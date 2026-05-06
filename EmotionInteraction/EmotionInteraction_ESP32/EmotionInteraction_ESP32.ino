/*
 * 树洞情绪交互装置 - ESP32 版本 (SD卡 + DAC音频输出)
 * 兼容 ESP32 Arduino Core 2.0.17
 *
 * ===== 硬件接线说明 =====
 *
 * 【压力传感器 FSR402B x2】检测拥抱/触摸力度
 *   使用 FS402 双路信号转换模块
 *   - OUT1 (左侧) → GPIO32 (A4)
 *   - OUT2 (右侧) → GPIO33 (A5)
 *   - VCC → 3.3V
 *   - GND → GND
 *
 * 【触摸按键 TTP223】用户交互控制
 *   - OUT → GPIO4
 *   - VCC → 3.3V
 *   - GND → GND
 *
 * 【六轴运动传感器 MPU6050】检测摇晃/振动
 *   - SDA → GPIO16 (I2C数据线)
 *   - SCL → GPIO17 (I2C时钟线)
 *   - VCC → 3.3V
 *   - GND → GND
 *
 * 【LED灯带 WS2812】情绪可视化，24颗灯珠
 *   - DIN → GPIO2 (数据输入)
 *   - VCC → 5V (需要足够电流驱动)
 *   - GND → GND
 *
 * 【SD卡模块】存储WAV音频文件，原生SPI通信
 *   - CS   → GPIO5  (片选)
 *   - SCK  → GPIO48 (时钟)
 *   - MOSI → GPIO23 (主机输出)
 *   - MISO → GPIO49 (主机输入)
 *   - VCC  → 3.3V 或 5V (按模块要求)
 *   - GND  → GND
 *
 * 【功放模块 PAM8403】驱动音箱播放音效
 *   - LIN → GPIO25 (左声道)
 *   - RIN → GPIO26 (右声道，可不接)
 *   - VCC → 5V
 *   - GND → GND
 *   - LOUT/ROUT → 接无源音箱
 *
 * ===== 操作说明 =====
 *
 * 触摸按键功能：
 *   - 短按 (<2秒) : 开关音效
 *   - 长按 (>2秒) : 切换 自动检测模式 / 手动切换模式
 *
 * 手动模式下：
 *   - 短按：循环切换情绪状态 (疲惫 → 焦虑 → 愤怒 → 平静)
 *
 * ===== 需要安装的库 =====
 * 在 Arduino IDE 的"库管理器"中搜索安装：
 *   1. Adafruit_NeoPixel  (LED灯带驱动)
 *   2. Adafruit_MPU6050   (加速度计/陀螺仪)
 *   3. Adafruit_Sensor    (传感器基类库)
 *   4. ESP8266Audio v1.9.7 (WAV播放，注意：必须用1.9.7版本！)
 *
 * ===== SD卡文件准备 =====
 * 将WAV文件按以下命名放入SD卡根目录：
 *   - 0001.wav → 疲惫/平静时播放
 *   - 0002.wav → 焦虑时播放
 *   - 0003.wav → 愤怒时播放
 * SD卡格式：FAT32
 */

#include <Adafruit_NeoPixel.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <SPI.h>
#include <SD.h>
#include <Wire.h>

// ESP8266Audio 库 - WAV解码播放
#include <AudioFileSourceSD.h>
#include <AudioGeneratorWAV.h>
#include <AudioOutputI2S.h>

// ======================== 引脚定义 ========================

// FSR压力传感器 (ESP32 ADC1通道)
#define FSR_LEFT_PIN        A4   // GPIO32 - ADC1_CH4 - 左侧压力
#define FSR_RIGHT_PIN       A5   // GPIO33 - ADC1_CH5 - 右侧压力

#define TTP223_PIN          4    // 触摸按键输入
#define LED_PIN             2    // WS2812 LED数据引脚
#define LED_COUNT           24   // LED灯珠数量

// SD卡 SPI 引脚 (原生SPI)
#define SD_CS               5    // 片选
#define SD_SCK              48   // 时钟
#define SD_MOSI             23   // 主机输出从机输入
#define SD_MISO             49   // 主机输入从机输出

// I2C 引脚
#define I2C_SDA             16   // I2C数据线
#define I2C_SCL             17   // I2C时钟线

// ======================== 阈值参数 ========================

// FSR 压力传感器阈值 (ESP32 ADC为12位，取值范围 0-4095)
// 数值越小越敏感，越大需要越用力
#define THRESHOLD_LIGHT     300   // 轻触阈值：>此值判定为"疲惫"
#define THRESHOLD_MEDIUM    1000  // 中压阈值：>此值判定为"焦虑"
#define THRESHOLD_HEAVY     2000  // 重压阈值：>此值判定为"愤怒"

// MPU6050 运动检测阈值 (单位：m/s²，即重力加速度倍数)
// 数值越小越敏感，轻轻摇晃就能触发
#define MOTION_THRESHOLD_CALM    0.4f   // 平静运动阈值
#define MOTION_THRESHOLD_ANGRY   2.5f   // 愤怒触发阈值：运动幅度>此值且受压时判定为愤怒

// 防抖延时 (单位：毫秒)
// 防止状态快速跳动，确保稳定后才切换
#define DEBOUNCE_MS         150

// 灯光效果刷新速度 (单位：毫秒)
#define EFFECT_SPEED_FAST   30

// 触摸按键长按判定时间 (单位：毫秒)
#define LONG_PRESS_MS       2000  // >2秒视为长按

// I2S 音频输出配置
#define SAMPLE_RATE         44100  // 采样率
#define BUFFER_SIZE         1024   // 缓冲区大小

// ======================== 情绪状态枚举 ========================

// 定义6种情绪/状态
enum MoodState {
  STATE_IDLE,    // 空闲 - 无人互动
  STATE_TIRED,   // 疲惫 - 轻压
  STATE_ANXIOUS, // 焦虑 - 中压
  STATE_ANGRY,   // 愤怒 - 重压或剧烈摇晃
  STATE_CALM,    // 平静 - 特殊状态
  STATE_EXCITED  // 兴奋 - 特殊状态
};

// ======================== 全局对象 ========================

// LED灯带控制对象 (24颗灯珠, GPIO2, GRB格式, 800KHz)
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

// MPU6050加速度计对象
Adafruit_MPU6050 mpu;
bool mpuOk = false;

// ======================== 状态变量结构体 ========================

// 系统运行状态
struct SystemState {
  MoodState current;       // 当前状态
  MoodState last;          // 上一次读取的状态(用于防抖)
  unsigned long debounceTime; // 状态变化时间点
} state = { STATE_IDLE, STATE_IDLE, 0 };

// 系统配置
struct SystemConfig {
  bool soundEnabled;       // 音效开关
  bool autoMode;           // 自动/手动模式
  uint8_t manualMoodIndex; // 手动模式当前情绪索引
} config = { true, true, 0 };

// 触摸按键状态
struct TTP223State {
  bool lastState;          // 上一次按键状态
  unsigned long pressTime; // 按下开始时间
  bool longPressHandled;   // 是否已处理过长按
} ttp223 = { false, 0, false };

// 灯光效果状态
struct EffectState {
  unsigned long lastTime;  // 上次更新时间
  uint16_t step;           // 动画步进 (自动回绕)
  uint8_t breathValue;     // 呼吸亮度值
  int8_t breathDir;        // 呼吸方向 (1=渐亮, -1=渐暗)
  bool flashOn;            // 闪烁开关
  int runPos;              // 跑马灯位置
} effect = { 0, 0, 30, 1, false, 0 };

// ======================== 音频系统 (ESP8266Audio) ========================

// 音频对象指针
AudioFileSourceSD *fileSource = nullptr;    // SD卡文件源
AudioGeneratorWAV *wavGenerator = nullptr;  // WAV解码器
AudioOutputI2S *audioOutput = nullptr;      // I2S音频输出

// 音频系统状态
struct AudioSystem {
  bool playing;            // 是否正在播放
  uint8_t currentTrack;    // 当前播放的曲目编号
  uint8_t lastPlayedTrack; // 上次播放的曲目(防重复)
  bool initialized;        // 是否已初始化
} audio = { false, 0, 0, false };

// 初始化音频系统 (I2S + 内置DAC)
bool initAudio() {
  if (audio.initialized) return true;

  // 创建 I2S 输出，使用ESP32内置DAC (GPIO25/GPIO26)
  audioOutput = new AudioOutputI2S(0, 1);
  audioOutput->SetGain(0.5);
  audio.initialized = true;
  Serial.println(F("[OK] 音频系统初始化完成"));
  return true;
}

// 停止音频播放并释放资源
void stopAudio() {
  if (!audio.playing) return;

  if (wavGenerator) {
    wavGenerator->stop();
    delete wavGenerator;
    wavGenerator = nullptr;
  }

  if (fileSource) {
    fileSource->close();
    delete fileSource;
    fileSource = nullptr;
  }

  audio.playing = false;
  audio.lastPlayedTrack = 0;

  Serial.println(F("[音效] 停止播放"));
}

// 播放指定编号的WAV文件
// track: 1=疲惫/平静音效, 2=焦虑音效, 3=愤怒音效
void playAudio(uint8_t track) {
  if (!config.soundEnabled || track == audio.lastPlayedTrack || track == 0) return;

  stopAudio();

  if (!initAudio()) {
    Serial.println(F("[音频错误] 音频初始化失败"));
    return;
  }

  char filename[16];
  snprintf(filename, sizeof(filename), "/%04d.wav", track);

  if (!SD.exists(filename)) {
    Serial.print(F("[错误] 文件不存在: "));
    Serial.println(filename);
    return;
  }

  // 打开SD卡文件
  fileSource = new AudioFileSourceSD(filename);
  if (!fileSource || !fileSource->isOpen()) {
    Serial.print(F("[错误] 无法打开文件: "));
    Serial.println(filename);
    if (fileSource) {
      delete fileSource;
      fileSource = nullptr;
    }
    return;
  }

  // 创建WAV解码器并开始播放
  wavGenerator = new AudioGeneratorWAV();
  if (!wavGenerator->begin(fileSource, audioOutput)) {
    Serial.println(F("[错误] WAV解码器启动失败"));
    delete wavGenerator;
    wavGenerator = nullptr;
    delete fileSource;
    fileSource = nullptr;
    return;
  }

  audio.playing = true;
  audio.currentTrack = track;
  audio.lastPlayedTrack = track;

  Serial.print(F("[音效] 播放: "));
  Serial.println(filename);
}

// 处理音频循环 (需在loop()中高频调用)
void processAudio() {
  if (!audio.playing || !wavGenerator) return;

  // 持续解码播放音频帧
  if (wavGenerator->isRunning()) {
    if (!wavGenerator->loop()) {
      // 播放完成或出错
      Serial.println(F("[音效] 播放完成"));
      stopAudio();
    }
  } else {
    // 解码器已停止
    stopAudio();
  }
}

// ======================== 灯光效果 ========================

// 获取状态名称字符串 (用于串口输出)
const char* getStateName(MoodState s) {
  switch (s) {
    case STATE_IDLE:    return "空闲";
    case STATE_TIRED:   return "疲惫";
    case STATE_ANXIOUS: return "焦虑";
    case STATE_ANGRY:   return "愤怒";
    case STATE_CALM:    return "平静";
    case STATE_EXCITED: return "兴奋";
    default:            return "未知";
  }
}

// 空闲状态效果：蓝色呼吸灯 (缓慢明暗变化)
void effectIdle() {
  effect.breathValue += effect.breathDir;
  if (effect.breathValue >= 50 || effect.breathValue <= 10) effect.breathDir *= -1;

  strip.setBrightness(effect.breathValue);
  strip.fill(strip.Color(0, 30, 60));  // 深蓝青色
  strip.show();
}

// 疲惫状态效果：淡蓝色流动灯 (像缓慢流动的水)
void effectTired() {
  effect.breathValue += effect.breathDir * 2;
  if (effect.breathValue >= 80 || effect.breathValue <= 30) effect.breathDir *= -1;

  strip.setBrightness(effect.breathValue);
  strip.clear();

  // 4颗灯珠流动
  for (int i = 0; i < 4; i++) {
    int pos = (effect.step + i) % LED_COUNT;
    uint8_t factor = 200 - (i * 50);  // 渐暗
    strip.setPixelColor(pos, 0, (180 * factor) / 255, (255 * factor) / 255);
  }
  strip.show();
  effect.step++;
}

// 焦虑状态效果：橙黄色波浪 (不安的波动感)
void effectAnxious() {
  strip.setBrightness(120);
  strip.clear();

  // 正弦波计算产生波动效果
  for (int i = 0; i < LED_COUNT; i++) {
    float wave = sinf((effect.step + i) * 0.3f) * 0.5f + 0.5f;
    uint8_t r = (uint8_t)(255 * wave);
    uint8_t g = (uint8_t)(160 * wave);
    uint8_t b = (uint8_t)(30 * wave * 0.3f);
    strip.setPixelColor(i, r, g, b);
  }
  strip.show();
  effect.step++;
}

// 愤怒状态效果：红色闪烁 + 红色跑马灯
void effectAngry() {
  unsigned long now = millis();
  if (now - effect.lastTime >= EFFECT_SPEED_FAST) {
    effect.flashOn = !effect.flashOn;  // 切换闪烁状态
    effect.lastTime = now;
  }

  strip.setBrightness(255);  // 最大亮度
  strip.clear();

  if (effect.flashOn) {
    strip.fill(strip.Color(60, 0, 0));  // 背景暗红
    // 三颗高亮红灯跑马
    strip.setPixelColor(effect.runPos % LED_COUNT, 255, 0, 0);
    strip.setPixelColor((effect.runPos + 8) % LED_COUNT, 255, 50, 0);
    strip.setPixelColor((effect.runPos + 16) % LED_COUNT, 255, 100, 0);
  } else {
    strip.fill(strip.Color(20, 0, 0));  // 闪烁变暗
  }
  strip.show();
  effect.runPos++;
}

// 平静状态效果：绿色呼吸灯 (舒缓放松)
void effectCalm() {
  effect.breathValue += effect.breathDir;
  if (effect.breathValue >= 60 || effect.breathValue <= 20) effect.breathDir *= -1;

  strip.setBrightness(effect.breathValue);
  strip.fill(strip.Color(0, 100, 50));  // 柔和绿色
  strip.show();
}

// 兴奋状态效果：彩虹流动灯
void effectExcited() {
  strip.setBrightness(200);

  // 色轮算法生成彩虹色
  for (int i = 0; i < LED_COUNT; i++) {
    uint8_t wheelPos = ((i * 256 / LED_COUNT) + effect.step) & 255;
    wheelPos = 255 - wheelPos;

    uint32_t color;
    if (wheelPos < 85) {
      color = strip.Color(255 - wheelPos * 3, 0, wheelPos * 3);
    } else if (wheelPos < 170) {
      wheelPos -= 85;
      color = strip.Color(0, wheelPos * 3, 255 - wheelPos * 3);
    } else {
      wheelPos -= 170;
      color = strip.Color(wheelPos * 3, 255 - wheelPos * 3, 0);
    }
    strip.setPixelColor(i, color);
  }
  strip.show();
  effect.step += 3;
}

// 根据状态应用对应的灯光效果
void applyEffect(MoodState s) {
  switch (s) {
    case STATE_IDLE:    effectIdle(); break;
    case STATE_TIRED:   effectTired(); break;
    case STATE_ANXIOUS: effectAnxious(); break;
    case STATE_ANGRY:   effectAngry(); break;
    case STATE_CALM:    effectCalm(); break;
    case STATE_EXCITED: effectExcited(); break;
  }
}

// 开机自检动画：红绿蓝三色流水灯
void startupAnimation() {
  const uint32_t colors[] = {
    strip.Color(50, 0, 0),   // 红
    strip.Color(0, 50, 0),   // 绿
    strip.Color(0, 0, 50)    // 蓝
  };

  for (int c = 0; c < 3; c++) {
    for (int i = 0; i < LED_COUNT; i++) {
      strip.clear();
      strip.setPixelColor(i, colors[c]);
      strip.show();
      delay(30);
    }
  }
  strip.clear();
  strip.show();
}

// ======================== 传感器读取 ========================

// 读取压力传感器 (左右取平均值)
int readFSR() {
  return (analogRead(FSR_LEFT_PIN) + analogRead(FSR_RIGHT_PIN)) / 2;
}

// 获取运动强度 (MPU6050加速度矢量和与重力加速度的差值)
// 返回值越大表示运动越剧烈，传感器未就绪时返回0
float getMotionIntensity() {
  if (!mpuOk) return 0.0f;

  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  float ax = a.acceleration.x;
  float ay = a.acceleration.y;
  float az = a.acceleration.z;

  // 计算总加速度与重力加速度的差值
  return fabsf(sqrtf(ax*ax + ay*ay + az*az) - 9.8f);
}

// ======================== 情绪判断逻辑 ========================

// 根据压力和运动数据判断当前情绪状态
// fsrValue: 压力传感器读数 (0-4095)
// motion: 运动强度 (m/s²)
MoodState determineMood(int fsrValue, float motion) {
  MoodState fsrState;

  // 首先根据压力判断基础状态
  if (fsrValue < THRESHOLD_LIGHT) {
    fsrState = STATE_IDLE;     // 无压力 = 空闲
  } else if (fsrValue < THRESHOLD_MEDIUM) {
    fsrState = STATE_TIRED;    // 轻压 = 疲惫
  } else if (fsrValue < THRESHOLD_HEAVY) {
    fsrState = STATE_ANXIOUS;  // 中压 = 焦虑
  } else {
    fsrState = STATE_ANGRY;    // 重压 = 愤怒
  }

  // 如果有压力且剧烈摇晃，强制判定为愤怒
  if (motion > MOTION_THRESHOLD_ANGRY && fsrState != STATE_IDLE) {
    return STATE_ANGRY;
  }

  return fsrState;
}

// 状态变化时的回调处理
void onStateChange(MoodState newState, MoodState oldState) {
  Serial.print(F("[状态] "));
  Serial.print(getStateName(oldState));
  Serial.print(F(" -> "));
  Serial.println(getStateName(newState));

  if (!config.soundEnabled) return;

  // 根据新状态播放对应音效
  switch (newState) {
    case STATE_IDLE:    stopAudio(); break;  // 空闲静音
    case STATE_TIRED:   playAudio(1); break; // 疲惫音效
    case STATE_ANXIOUS: playAudio(2); break; // 焦虑音效
    case STATE_ANGRY:   playAudio(3); break; // 愤怒音效
    case STATE_CALM:    playAudio(1); break; // 平静音效
    case STATE_EXCITED: playAudio(3); break; // 兴奋音效
  }
}

// ======================== 触摸按键处理 ========================

// 统一的按钮处理：短按/长按行为取决于当前模式
void handleTTP223() {
  bool pressed = digitalRead(TTP223_PIN);
  unsigned long now = millis();

  if (pressed && !ttp223.lastState) {
    // 按下：记录时间
    ttp223.pressTime = now;
    ttp223.longPressHandled = false;
  }

  if (!pressed && ttp223.lastState) {
    // 释放：判断短按/长按
    unsigned long duration = now - ttp223.pressTime;

    if (duration < LONG_PRESS_MS) {
      // 短按：根据模式执行不同操作
      if (config.autoMode) {
        config.soundEnabled = !config.soundEnabled;
        Serial.print(F("[短按] 音效: "));
        Serial.println(config.soundEnabled ? F("开") : F("关"));
        if (!config.soundEnabled) stopAudio();
      } else {
        config.manualMoodIndex = (config.manualMoodIndex + 1) % 4;
        const char* moodNames[] = {"疲惫", "焦虑", "愤怒", "平静"};
        Serial.print(F("[短按] 情绪: "));
        Serial.println(moodNames[config.manualMoodIndex]);
      }
    }
    ttp223.pressTime = 0;
  }

  // 长按检测
  if (pressed && !ttp223.longPressHandled && ttp223.pressTime > 0
      && now - ttp223.pressTime >= LONG_PRESS_MS) {
    config.autoMode = !config.autoMode;
    ttp223.longPressHandled = true;
    Serial.print(F("[长按] 模式: "));
    Serial.println(config.autoMode ? F("自动") : F("手动"));
    if (!config.autoMode) playAudio(2);
  }

  ttp223.lastState = pressed;
}

// ======================== 手动模式处理 ========================

// 手动模式：播放音效、应用灯光、打印状态（不再读取按钮）
void handleManualMode() {
  static int lastIndex = -1;
  const MoodState states[] = {STATE_TIRED, STATE_ANXIOUS, STATE_ANGRY, STATE_CALM};
  MoodState current = states[config.manualMoodIndex];

  // 情绪变化时播放音效
  if ((int)config.manualMoodIndex != lastIndex) {
    lastIndex = config.manualMoodIndex;
    if (config.soundEnabled) {
      switch (current) {
        case STATE_TIRED:   playAudio(1); break;
        case STATE_ANXIOUS: playAudio(2); break;
        case STATE_ANGRY:   playAudio(3); break;
        case STATE_CALM:    playAudio(1); break;
        default: break;
      }
    }
  }

  applyEffect(current);

  // 每500ms打印一次当前状态
  static unsigned long lastPrint = 0;
  unsigned long now = millis();
  if (now - lastPrint >= 500) {
    lastPrint = now;
    Serial.print(F("[手动模式] "));
    Serial.println(getStateName(current));
  }
}

// ======================== 初始化函数 ========================

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000);  // 等待串口就绪，最多2秒
  Serial.println(F("\n=== 树洞情绪交互装置 ESP32 v2.0.17 ==="));

  // 初始化 I2C 总线 (用于MPU6050)
  Wire.begin(I2C_SDA, I2C_SCL);
  Serial.println(F("[OK] I2C 初始化 (SDA:16, SCL:17)"));

  // 初始化 LED 灯带
  strip.begin();
  strip.clear();
  strip.show();
  strip.setBrightness(100);
  Serial.println(F("[OK] WS2812 初始化 (GPIO2)"));

  // 初始化 MPU6050 加速度计
  if (mpu.begin(0x68, &Wire)) {
    mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
    mpu.setGyroRange(MPU6050_RANGE_250_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    mpuOk = true;
    Serial.println(F("[OK] MPU6050 初始化完成"));
  } else {
    Serial.println(F("[警告] MPU6050 初始化失败，运动检测不可用"));
  }

  // 初始化 SD卡
  SPI.begin(SD_SCK, SD_MISO, SD_MOSI, SD_CS);
  if (!SD.begin(SD_CS)) {
    Serial.println(F("[警告] SD卡初始化失败，检查接线和SD卡格式(FAT32)"));
  } else {
    Serial.println(F("[OK] SD卡初始化完成"));

    // 列出SD卡根目录文件
    File root = SD.open("/");
    if (root) {
      Serial.println(F("SD卡文件列表:"));
      File file = root.openNextFile();
      int count = 0;
      while (file && count < 10) {
        Serial.print(F("  - "));
        Serial.println(file.name());
        file.close();
        file = root.openNextFile();
        count++;
      }
      if (count == 0) {
        Serial.println(F("  (无文件，请确保WAV文件命名为 0001.wav, 0002.wav, 0003.wav)"));
      }
      root.close();
    }
  }

  // 初始化 FSR 压力传感器引脚
  pinMode(FSR_LEFT_PIN, INPUT);
  pinMode(FSR_RIGHT_PIN, INPUT);
  Serial.println(F("[OK] FSR传感器初始化 (A4/A5 - GPIO32/33)"));

  // 初始化 TTP223 触摸按键
  pinMode(TTP223_PIN, INPUT);
  Serial.println(F("[OK] TTP223触摸模块初始化 (GPIO4)"));

  // 执行开机动画
  startupAnimation();

  // 打印操作说明
  Serial.println(F("\n=== 系统就绪 ==="));
  Serial.println(F("操作说明:"));
  Serial.println(F("  短按TTP223 (<2秒): 开/关音效"));
  Serial.println(F("  长按TTP223 (>2秒): 切换自动/手动模式"));
  Serial.println(F("  手动模式下短按: 切换情绪状态"));
}

// ======================== 主循环 ========================

void loop() {
  // 处理音频播放 (高优先级，避免爆音)
  processAudio();

  // 处理触摸按键
  handleTTP223();

  if (config.autoMode) {
    // ========== 自动模式 ==========
    // 读取传感器数据
    int fsrValue = readFSR();
    float motion = getMotionIntensity();

    // 判断当前情绪
    MoodState newState = determineMood(fsrValue, motion);

    // 防抖处理：状态持续150ms才确认切换
    unsigned long now = millis();
    if (newState != state.last) {
      state.debounceTime = now;
      state.last = newState;
    }

    if (now - state.debounceTime >= DEBOUNCE_MS) {
      if (newState != state.current) {
        onStateChange(newState, state.current);
        state.current = newState;
      }
    }

    // 应用对应的灯光效果
    applyEffect(state.current);

    // 每500ms打印一次状态信息
    static unsigned long lastPrint = 0;
    if (now - lastPrint >= 500) {
      lastPrint = now;
      Serial.print(F("FSR: "));
      Serial.print(fsrValue);
      Serial.print(F(" 运动: "));
      Serial.print(motion, 2);
      Serial.print(F(" 状态: "));
      Serial.println(getStateName(state.current));
    }
  } else {
    // ========== 手动模式 ==========
    handleManualMode();
  }

  delay(20);  // 50Hz刷新率，足够流畅
}
