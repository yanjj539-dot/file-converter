/*
 * ============================================================================
 * 树洞情绪疗愈装置 (Tree Hole Emotional Healing Device)
 * ESP32-based interactive emotional healing installation
 * ============================================================================
 * 硬件平台: ESP32
 * 核心功能: 三段式情绪疗愈状态机 + 传感器融合 + 灯光动画 + 音效控制
 *
 * 状态机: IDLE(空闲) -> LISTEN(倾听) -> RELEASE(宣泄) -> RECOVER(回归) -> IDLE
 *
 * 传感器:
 *   - 左FSR402B (GPIO32): "倾诉之手" - 用户按压倾诉
 *   - 右FSR402B (GPIO33): "安抚之手" - 用户自我安抚
 *   - TTP223 (GPIO4):    "树的耳朵" - 触摸交互
 *   - MPU6050 (I2C):      运动检测与姿态感知
 *
 * 输出:
 *   - WS2812 24灯环 (GPIO2):    情绪灯光渲染
 *   - DFPlayer Mini (Serial2, GPIO18/19): MP3音效播放 (自带DAC输出->PAM8403)
 *   - I2S DAC (GPIO25/26):       ESP32内部DAC音频输出 (补充/混合音频路径)
 * ============================================================================
 */

// ============================================================================
// 1. 库引用
// ============================================================================
#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_NeoPixel.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "DFRobot_DFPlayerMini.h"
#include <driver/i2s.h>

// ============================================================================
// 2. 引脚定义 (不可更改)
// ============================================================================
#define PIN_FSR_LEFT        32      // 左FSR: "倾诉之手" (ADC1_CH4)
#define PIN_FSR_RIGHT       33      // 右FSR: "安抚之手" (ADC1_CH5)
#define PIN_TOUCH           4       // TTP223触摸: "树的耳朵"
#define PIN_NEOPIXEL        2       // WS2812灯环DIN
#define PIN_I2C_SDA         16      // MPU6050 SDA
#define PIN_I2C_SCL         17      // MPU6050 SCL
#define PIN_SPI_CS          5       // SD卡SPI CS (DFPlayer模块SD卡槽)
#define PIN_SPI_SCK         48      // SD卡SPI SCK
#define PIN_SPI_MOSI        23      // SD卡SPI MOSI
#define PIN_SPI_MISO        49      // SD卡SPI MISO
#define PIN_DF_RX           18      // DFPlayer Mini RX (接DFPlayer TX)
#define PIN_DF_TX           19      // DFPlayer Mini TX (接DFPlayer RX)
#define PIN_DAC_LEFT        25      // ESP32 DAC1 -> PAM8403左声道
#define PIN_DAC_RIGHT       26      // ESP32 DAC2 -> PAM8403右声道

// ============================================================================
// 3. 常量定义
// ============================================================================
#define NUM_LEDS            24                  // WS2812灯珠数量
#define LED_BOTTOM          18                  // 6点钟方向灯珠索引
#define LED_CENTER_LEFT     11                  // 顶部中心偏左
#define LED_CENTER_RIGHT    12                  // 顶部中心偏右

// ---- FSR压力阈值 ----
#define FSR_LIGHT_TOUCH     600                 // 轻触下限
#define FSR_MEDIUM          2000                // 中压下限
#define FSR_HEAVY           3500                // 重压下限
#define FSR_MAX             4095                // ADC最大读数

// ---- MPU6050运动幅度阈值 ----
#define MOTION_CALM         0.8f                // 静止/冷静
#define MOTION_ANXIOUS      2.0f                // 焦虑
#define MOTION_ANGRY        5.0f                // 愤怒/爆发

// ---- 状态转换时长 (毫秒) ----
#define DUR_IDLE_TO_LISTEN          2000        // IDLE->LISTEN需持续满足条件
#define DUR_LISTEN_TO_RELEASE       1000        // LISTEN->RELEASE高压保持
#define DUR_RELEASE_TO_RECOVER      5000        // RELEASE->RECOVER平静保持
#define DUR_RECOVER_TO_IDLE_HUG     30000       // RECOVER->IDLE拥抱姿态
#define DUR_RECOVER_TO_IDLE_INACT   60000       // RECOVER->IDLE无互动超时
#define DUR_INACTIVITY_TIMEOUT      60000       // 全局超时返回IDLE
#define DUR_HUG_STABLE              1000        // 拥抱姿态稳定判定

// ---- 情绪积累参数 ----
#define STRESS_UPDATE_INTERVAL      100         // stress_level更新间隔(ms)
#define STRESS_MAX                  100         // 最大值
#define STRESS_MIN                  0           // 最小值
#define STRESS_INC_HEAVY            2.0f        // 重压/剧烈运动增量
#define STRESS_INC_MEDIUM           1.0f        // 中压/中度运动增量
#define STRESS_DEC_SELF_SOOTHE      1.0f        // 自我安抚减量
#define STRESS_DEC_GENTLE           0.5f        // 双手轻抚减量
#define STRESS_DEC_NATURAL          0.2f        // 自然衰减
#define STRESS_RELEASE_THRESHOLD    80          // 触发强制宣泄阈值

// ---- TTP223触摸 ----
#define TOUCH_LONG_PRESS_MS         2000        // 长按判定时长
#define TOUCH_DEBOUNCE_MS           50          // 去抖时间
#define MOOD_COLOR_CYCLE_MS         1000        // 心情选择颜色轮换间隔

// ---- 音效文件编号 ----
#define TRACK_SOOTHING_MUSIC        1           // 0001.mp3 舒缓音乐
#define TRACK_RAIN                  2           // 0002.mp3 雨声白噪音
#define TRACK_THUNDER               3           // 0003.mp3 雷声(单次)
#define TRACK_CAMPFIRE              4           // 0004.mp3 篝火环境声
#define TRACK_BELL                  5           // 0005.mp3 铃铛声
#define TRACK_GUIDE_ANXIOUS         6           // 0006.mp3 "今天有点不安吗？"
#define TRACK_GUIDE_STOP            7           // 0007.mp3 "你可以停在这里"
#define TRACK_GUIDE_ALWAYS          8           // 0008.mp3 "无论何时，我都在"

// ---- 音频参数 ----
#define VOLUME_DEFAULT              20
#define VOLUME_FADE_MS              2000        // 淡入淡出时长(ms)
#define VOLUME_MAX                  30
#define VOLUME_MIN                  0

// ---- 灯光动画参数 ----
#define BREATH_CYCLE_SLOW_MS        5000        // 慢呼吸周期
#define BREATH_CYCLE_FAST_MS        4000        // 快呼吸周期
#define STROBE_MIN_MS               50          // 最快暴闪间隔
#define STROBE_MAX_MS               500         // 最慢暴闪间隔
#define RIPPLE_RADIUS_MAX           12          // 水波最大扩散半径

// ---- 传感器读取间隔 ----
#define SENSOR_READ_MS              20
#define STATE_CHECK_MS              100
#define TOUCH_CHECK_MS              20

// ---- 安全词锁定时间 ----
#define SAFETY_WORD_LOCK_MS         5000

// ---- FSR压力映射上限 (用于灯光映射) ----
#define FSR_LISTEN_MAX              1999

// ============================================================================
// 4. 枚举定义
// ============================================================================
enum DeviceState : uint8_t {
    STATE_IDLE    = 0,
    STATE_LISTEN  = 1,
    STATE_RELEASE = 2,
    STATE_RECOVER = 3,
    STATE_MOOD_SELECT = 4      // 临时子状态: 心情选择模式
};

enum MoodColorIndex : uint8_t {
    MOOD_ICE_BLUE   = 0,      // 冰蓝 -> LISTEN
    MOOD_WARM_YELLOW = 1,     // 暖黄 -> LISTEN(焦虑基调)
    MOOD_RED        = 2,      // 红 -> RELEASE
    MOOD_GREEN      = 3       // 绿 -> RECOVER
};

enum TouchState : uint8_t {
    TOUCH_IDLE      = 0,
    TOUCH_PRESSED   = 1,      // 正在按下
    TOUCH_SHORT     = 2,      // 短按完成(待处理)
    TOUCH_LONG      = 3,      // 长按触发(已进入心情选择)
    TOUCH_RELEASED_IN_MOOD = 4  // 心情选择中松开
};

enum AudioFadeState : uint8_t {
    FADE_NONE       = 0,
    FADE_OUT       = 1,
    FADE_IN        = 2,
    FADE_COMPLETE  = 3
};

/*
 * @brief 状态转换条件跟踪 (每个转换独立, 避免互扰)
 */
struct TransitionTracker {
    bool    wasMet;       // 上一周期条件是否满足
    uint32_t startTime;   // 条件开始满足的时刻
};

// ============================================================================
// 5. 全局对象
// ============================================================================
Adafruit_NeoPixel strip(NUM_LEDS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);
Adafruit_MPU6050 mpu;

// DFPlayer Mini 通过 HardwareSerial2 (UART2) 控制
// DFPlayer 的 TX 接 ESP32 GPIO18 (RX), RX 接 ESP32 GPIO19 (TX)
DFRobot_DFPlayerMini dfplayer;

// ============================================================================
// 6. 传感器数据变量
// ============================================================================
uint16_t leftFsrValue   = 0;
uint16_t rightFsrValue  = 0;
float    motionMagnitude = 0.0f;
float    filteredMotion  = 0.0f;
float    pitchAngle      = 0.0f;
bool     touchRaw        = false;

// ---- MPU6050原始数据 ----
float ax = 0, ay = 0, az = 0;

// ---- 低通滤波系数 ----
const float MOTION_FILTER_ALPHA = 0.15f;

// ============================================================================
// 7. 状态机核心变量
// ============================================================================
DeviceState currentState      = STATE_IDLE;
DeviceState previousState     = STATE_IDLE;
DeviceState stateBeforeMood   = STATE_IDLE;  // 进入心情选择前的状态

float       stressLevel       = 0.0f;        // 情绪积累值 (0-100)
bool        safetyWordActive  = false;       // 安全词激活标志
uint32_t    safetyWordStart   = 0;           // 安全词开始时间

// ---- 独立的状态转换条件跟踪 ----
TransitionTracker trIdleToList    = {false, 0};
TransitionTracker trListToRelease = {false, 0};
TransitionTracker trReleaseToRecover = {false, 0};

uint32_t    lastInteractionTime = 0;         // 最后互动时间(用于超时检测)

// ---- 拥抱姿态检测 ----
bool        hugDetected       = false;
uint32_t    hugStableStart    = 0;
bool        hugWasStable      = false;

// ============================================================================
// 8. 触摸子系统变量
// ============================================================================
TouchState  touchState        = TOUCH_IDLE;
uint32_t    touchDownTime     = 0;           // 按下的时刻
uint32_t    touchLastRead     = 0;           // 上次读取时刻
bool        touchLastStable   = false;       // 去抖

// ---- 心情选择模式 ----
bool        moodSelectActive  = false;
MoodColorIndex moodSelectColor = MOOD_ICE_BLUE;
uint32_t    moodSelectCycleTime = 0;
MoodColorIndex moodSelectResult = MOOD_ICE_BLUE;

// ============================================================================
// 9. 灯光动画变量
// ============================================================================

// ---- IDLE: 星光 ----
int         starPosition      = 0;
uint32_t    starLastMove      = 0;

// ---- LISTEN: 水波 ----
int         rippleRadius      = 0;
int         rippleTargetRadius = 0;
uint32_t    rippleLastUpdate  = 0;

// ---- RELEASE: 暴闪+跑马灯 ----
uint32_t    strobeLastToggle  = 0;
bool        strobePhase       = false;
int         runnerPosition    = 0;
uint32_t    runnerLastUpdate  = 0;

// ---- RECOVER: 芽苗呼吸 ----
uint32_t    breathStart       = 0;

// ---- 心情选择动画 ----
uint32_t    moodAnimLastCycle = 0;
uint8_t     moodAnimBreathVal = 0;

// ---- 倾听回应动画(铃铛) ----
bool        bellAnimActive    = false;
uint32_t    bellAnimStart     = 0;

// ============================================================================
// 10. 音频子系统变量
// ============================================================================
int         currentTrack      = -1;          // 当前播放曲目编号
bool        isLooping         = false;       // 是否循环播放
bool        isMuted           = false;       // 是否静音
bool        waitingForThunderEnd = false;    // 等待雷声结束

AudioFadeState  fadeState     = FADE_NONE;
uint32_t    fadeStartTime     = 0;
uint8_t     fadeStartVolume   = 0;
uint8_t     fadeTargetVolume  = 0;
uint32_t    fadeDurationMs    = 0;

// 手动音量跟踪 (DFRobot库可能无readVolume)
uint8_t     currentVolume     = VOLUME_DEFAULT;

// ============================================================================
// 11. 通用计时变量
// ============================================================================
uint32_t    lastSensorRead    = 0;
uint32_t    lastStressUpdate  = 0;
uint32_t    lastStateCheck    = 0;
uint32_t    lastDebugPrint    = 0;
uint32_t    lastTouchCheck    = 0;

// ============================================================================
// 12. 辅助函数
// ============================================================================

/*
 * @brief 约束值在区间内
 */
template<typename T>
T clampVal(T val, T minVal, T maxVal) {
    return (val < minVal) ? minVal : (val > maxVal) ? maxVal : val;
}

/*
 * @brief 线性映射 (浮点版本)
 */
float mapf(float x, float in_min, float in_max, float out_min, float out_max) {
    if (in_max == in_min) return out_min;
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/*
 * @brief HSV转GRB (H:0-360, S:0-1, V:0-1)
 * 返回 32位GRB颜色值 (适配Adafruit_NeoPixel NEO_GRB格式: G<<16 | R<<8 | B)
 */
uint32_t hsvToGrb(uint16_t h, float s, float v) {
    float r = 0, g = 0, b = 0;
    uint16_t sector = (h % 360) / 60;
    float frac = (h % 360) / 60.0f - sector;
    float p = v * (1.0f - s);
    float q = v * (1.0f - s * frac);
    float t = v * (1.0f - s * (1.0f - frac));

    switch (sector) {
        case 0:  r = v; g = t; b = p; break;
        case 1:  r = q; g = v; b = p; break;
        case 2:  r = p; g = v; b = t; break;
        case 3:  r = p; g = q; b = v; break;
        case 4:  r = t; g = p; b = v; break;
        default: r = v; g = p; b = q; break;
    }

    uint8_t r8 = (uint8_t)(r * 255.0f);
    uint8_t g8 = (uint8_t)(g * 255.0f);
    uint8_t b8 = (uint8_t)(b * 255.0f);
    // NEO_GRB: G在最高字节, R在中间, B在最低
    return ((uint32_t)g8 << 16) | ((uint32_t)r8 << 8) | b8;
}

/*
 * @brief 全灯环填充单一GRB颜色
 */
void fillAll(uint8_t r, uint8_t g, uint8_t b) {
    uint32_t color = strip.Color(r, g, b);
    for (int i = 0; i < NUM_LEDS; i++) {
        strip.setPixelColor(i, color);
    }
}

/*
 * @brief 清空灯环 (全黑)
 */
void clearAll() {
    fillAll(0, 0, 0);
}

/*
 * @brief 设置音量并记录
 */
void setPlayerVolume(uint8_t vol) {
    vol = clampVal(vol, (uint8_t)VOLUME_MIN, (uint8_t)VOLUME_MAX);
    currentVolume = vol;
    dfplayer.volume(vol);
}

// ============================================================================
// 13. 传感器读取
// ============================================================================

void readSensors() {
    // ---- 读取FSR压力传感器 (12位SAR ADC: 0-4095) ----
    leftFsrValue  = analogRead(PIN_FSR_LEFT);
    rightFsrValue = analogRead(PIN_FSR_RIGHT);

    // ---- 读取MPU6050加速度计 ----
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    ax = a.acceleration.x;
    ay = a.acceleration.y;
    az = a.acceleration.z;

    // 计算运动幅度 (去除重力分量后取绝对值, 单位 m/s²)
    float rawMotion = fabsf(sqrtf(ax * ax + ay * ay + az * az) - 9.8f);

    // 低通滤波
    filteredMotion = filteredMotion * (1.0f - MOTION_FILTER_ALPHA)
                     + rawMotion * MOTION_FILTER_ALPHA;
    motionMagnitude = filteredMotion;

    // 计算俯仰角 (Pitch): atan2(ax, sqrt(ay²+az²))
    // 设备水平放置时 ≈ 0°
    pitchAngle = atan2f(ax, sqrtf(ay * ay + az * az)) * 180.0f / PI;

    // ---- 读取TTP223触摸传感器 ----
    touchRaw = (digitalRead(PIN_TOUCH) == HIGH);

    // 记录互动时间 (有按压、运动或触摸时刷新)
    if (leftFsrValue > FSR_LIGHT_TOUCH || rightFsrValue > FSR_LIGHT_TOUCH
        || motionMagnitude > MOTION_CALM || touchRaw) {
        lastInteractionTime = millis();
    }
}

// ============================================================================
// 14. 情绪积累更新 (每100ms调用)
// ============================================================================

void updateStressLevel() {
    float delta = 0.0f;

    // ---- 增加压力 ----
    if (leftFsrValue >= FSR_HEAVY || motionMagnitude >= MOTION_ANGRY) {
        delta += STRESS_INC_HEAVY;
    }
    else if (leftFsrValue >= FSR_MEDIUM || motionMagnitude >= MOTION_ANXIOUS) {
        delta += STRESS_INC_MEDIUM;
    }

    // ---- 减少压力 (安抚) ----
    if (rightFsrValue >= FSR_HEAVY) {
        // 右手自我安抚
        delta -= STRESS_DEC_SELF_SOOTHE;
    }
    else if (leftFsrValue >= FSR_LIGHT_TOUCH && leftFsrValue < FSR_MEDIUM
             && rightFsrValue >= FSR_LIGHT_TOUCH && rightFsrValue < FSR_MEDIUM
             && motionMagnitude < MOTION_CALM) {
        // 双手轻抚且静止
        delta -= STRESS_DEC_GENTLE;
    }
    else {
        // 自然衰减
        delta -= STRESS_DEC_NATURAL;
    }

    // 应用变化并约束
    stressLevel = clampVal(stressLevel + delta, (float)STRESS_MIN, (float)STRESS_MAX);
}

// ============================================================================
// 15. 灯光动画实现
// ============================================================================

// ---- 15a. IDLE: 等待的星光 ----
void updateIdleAnimation() {
    uint32_t now = millis();

    // 微弱蓝色呼吸 (周期4秒, 亮度0-30)
    float breathVal = (sinf(now / 1000.0f * PI * 0.5f) + 1.0f) / 2.0f;
    uint8_t brightness = (uint8_t)(breathVal * 30.0f);

    // 星光缓慢移动 (每150ms移动一个位置)
    if (now - starLastMove >= 150) {
        starLastMove = now;
        starPosition = (starPosition + 1) % NUM_LEDS;
    }

    clearAll();

    // 当前星光 (纯蓝色)
    strip.setPixelColor(starPosition, strip.Color(0, 0, brightness));

    // 微弱星尾 (后方2颗逐渐变暗)
    for (int i = 1; i <= 2; i++) {
        int idx = (starPosition - i + NUM_LEDS) % NUM_LEDS;
        uint8_t trailBrightness = brightness * (3 - i) / 3;
        strip.setPixelColor(idx, strip.Color(0, 0, trailBrightness));
    }

    strip.show();
}

// ---- 15b. LISTEN: 水波扩散 ----
void updateListenAnimation() {
    uint32_t now = millis();

    // 合并双手压力 (取较大值), 映射600-1999 -> 扩散半径0-12
    uint16_t combinedPressure = max(leftFsrValue, rightFsrValue);
    rippleTargetRadius = (int)mapf(
        clampVal(combinedPressure, (uint16_t)FSR_LIGHT_TOUCH, (uint16_t)FSR_LISTEN_MAX),
        (float)FSR_LIGHT_TOUCH, (float)FSR_LISTEN_MAX, 0, RIPPLE_RADIUS_MAX
    );

    // 平滑过渡 (每30ms更新)
    if (now - rippleLastUpdate >= 30) {
        rippleLastUpdate = now;
        if (rippleRadius < rippleTargetRadius) {
            rippleRadius++;
        } else if (rippleRadius > rippleTargetRadius) {
            rippleRadius--;
        }
    }

    // 水波呼吸 (微弱亮度波动)
    float breath = (sinf(now / 2000.0f * PI) + 1.0f) / 2.0f * 0.3f + 0.7f;

    // 压力强度归一化
    float pressureNorm = mapf(
        clampVal(combinedPressure, (uint16_t)FSR_LIGHT_TOUCH, (uint16_t)FSR_LISTEN_MAX),
        (float)FSR_LIGHT_TOUCH, (float)FSR_LISTEN_MAX, 0.3f, 1.0f
    );

    clearAll();

    // 从底部(LED_BOTTOM=18)向两侧对称扩散冰蓝色水波
    for (int i = 0; i <= rippleRadius; i++) {
        int idxRight = (LED_BOTTOM + i) % NUM_LEDS;
        int idxLeft  = (LED_BOTTOM - i + NUM_LEDS) % NUM_LEDS;

        // 越靠近中心越亮
        float distNorm = (rippleRadius > 0) ? (1.0f - (float)i / rippleRadius) : 1.0f;
        uint8_t brightness = (uint8_t)(distNorm * pressureNorm * breath * 200.0f);

        // 冰蓝色: hue≈200
        uint32_t color = hsvToGrb(200, 0.8f, brightness / 255.0f);
        strip.setPixelColor(idxRight, color);
        strip.setPixelColor(idxLeft, color);
    }

    strip.show();
}

// ---- 15c. RELEASE: 暴闪+跑马灯 ----
void updateReleaseAnimation() {
    uint32_t now = millis();

    // 安全词模式: 全环深紫色均匀呼吸 (周期4秒 = 2秒渐亮 + 2秒渐暗)
    if (safetyWordActive) {
        uint32_t elapsed = now - safetyWordStart;
        float cyclePos = fmodf(elapsed / 1000.0f, 4.0f);

        float brightness;
        if (cyclePos < 2.0f) {
            brightness = cyclePos / 2.0f;
        } else {
            brightness = 1.0f - (cyclePos - 2.0f) / 2.0f;
        }

        uint8_t b = (uint8_t)(clampVal(brightness, 0.0f, 1.0f) * 180.0f);
        fillAll(b / 3, 0, b);
        strip.show();
        return;
    }

    // ---- 非对称暴闪判定 ----
    bool asymmetric = (leftFsrValue >= FSR_HEAVY)
                      && (abs((int)leftFsrValue - (int)rightFsrValue) > 1500);

    // 暴闪间隔: 运动幅度越大越快 (最快50ms, 最慢500ms)
    uint32_t strobeInterval = (uint32_t)mapf(
        clampVal(motionMagnitude, MOTION_CALM, MOTION_ANGRY),
        MOTION_CALM, MOTION_ANGRY, (float)STROBE_MAX_MS, (float)STROBE_MIN_MS
    );

    if (now - strobeLastToggle >= strobeInterval) {
        strobeLastToggle = now;
        strobePhase = !strobePhase;
    }

    // 跑马灯速度: 压力越大越快 (间隔200ms-30ms)
    uint32_t runnerInterval = (uint32_t)mapf(
        clampVal(max(leftFsrValue, rightFsrValue), (uint16_t)FSR_LIGHT_TOUCH, (uint16_t)FSR_MAX),
        (float)FSR_LIGHT_TOUCH, (float)FSR_MAX, 200.0f, 30.0f
    );

    if (now - runnerLastUpdate >= runnerInterval) {
        runnerLastUpdate = now;
        runnerPosition = (runnerPosition + 1) % NUM_LEDS;
    }

    clearAll();

    // 绘制暴闪
    if (asymmetric) {
        for (int i = 0; i < NUM_LEDS; i++) {
            if (i < NUM_LEDS / 2) {
                uint8_t val = strobePhase ? 255 : 30;
                strip.setPixelColor(i, strip.Color(val, 0, 0));
            } else {
                uint8_t val = strobePhase ? 255 : 30;
                strip.setPixelColor(i, strip.Color(val, 0, val));
            }
        }
    } else {
        for (int i = 0; i < NUM_LEDS; i++) {
            uint8_t val = strobePhase ? 255 : 20;
            if (i % 2 == 0) {
                strip.setPixelColor(i, strip.Color(val, 0, 0));
            } else {
                strip.setPixelColor(i, strip.Color(val, 0, val));
            }
        }
    }

    // 叠加白色跑马灯 (带拖尾)
    for (int i = 0; i <= 3; i++) {
        int idx = (runnerPosition - i + NUM_LEDS) % NUM_LEDS;
        uint8_t trailVal = (uint8_t)(200 * (4 - i) / 4);
        strip.setPixelColor(idx, strip.Color(trailVal, trailVal, trailVal));
    }

    strip.show();
}

// ---- 15d. RECOVER: 芽苗呼吸 ----
void updateRecoverAnimation() {
    uint32_t now = millis();
    uint32_t breathElapsed = (now - breathStart) % BREATH_CYCLE_SLOW_MS;
    float breathPos = (float)breathElapsed / BREATH_CYCLE_SLOW_MS;

    // 呼吸: 0→0.4 扩散亮起, 0.4→1.0 收回变暗
    float breathVal;
    if (breathPos < 0.4f) {
        breathVal = sinf(breathPos / 0.4f * PI / 2.0f);
    } else {
        breathVal = sinf((1.0f - breathPos) / 0.6f * PI / 2.0f + PI / 2.0f);
    }
    breathVal = clampVal(breathVal, 0.0f, 1.0f);

    // 扩散半径 (最多覆盖全环)
    int spreadRadius = (int)(breathVal * (NUM_LEDS / 2));

    // 拥抱姿态: 定位偏移
    int centerOffset = 0;
    if (hugDetected) {
        if (leftFsrValue > rightFsrValue + 500) {
            centerOffset = -3;
        } else if (rightFsrValue > leftFsrValue + 500) {
            centerOffset = 3;
        }
    }

    clearAll();

    // 嫩绿色: hue≈120, 饱和度高
    for (int i = 0; i <= spreadRadius; i++) {
        float distNorm = (spreadRadius > 0) ? (1.0f - (float)i / spreadRadius) : 1.0f;
        uint8_t brightness = (uint8_t)(distNorm * breathVal * 200.0f);

        int baseL = LED_CENTER_LEFT;
        int idx1 = (baseL + i + centerOffset + NUM_LEDS) % NUM_LEDS;
        int idx2 = (baseL - i + centerOffset + NUM_LEDS) % NUM_LEDS;

        uint32_t color = hsvToGrb(120, 0.9f, brightness / 255.0f);
        strip.setPixelColor(idx1, color);
        if (idx1 != idx2) {
            strip.setPixelColor(idx2, color);
        }
    }

    // 拥抱姿态: 叠加暖光
    if (hugDetected) {
        float hugBrightness = mapf(
            clampVal((float)(leftFsrValue + rightFsrValue) / 2.0f,
                     (float)FSR_LIGHT_TOUCH, (float)FSR_LISTEN_MAX),
            (float)FSR_LIGHT_TOUCH, (float)FSR_LISTEN_MAX, 0.1f, 0.6f
        );
        uint8_t hb = (uint8_t)(hugBrightness * 80.0f);
        for (int i = 0; i < NUM_LEDS; i++) {
            uint32_t existing = strip.getPixelColor(i);
            uint8_t er = (existing >> 8) & 0xFF;
            uint8_t eg = (existing >> 16) & 0xFF;
            uint8_t eb = existing & 0xFF;
            uint8_t nr = min(255, er + hb / 3);
            uint8_t ng = min(255, eg + hb);
            uint8_t nb = min(255, eb + hb / 3);
            strip.setPixelColor(i, strip.Color(nr, ng, nb));
        }
    }

    strip.show();
}

// ---- 15e. 心情选择动画 ----
void updateMoodSelectAnimation() {
    uint32_t now = millis();

    // 颜色轮换 (每1秒)
    if (now - moodSelectCycleTime >= MOOD_COLOR_CYCLE_MS) {
        moodSelectCycleTime = now;
        moodSelectColor = (MoodColorIndex)((moodSelectColor + 1) % 4);
    }

    // 呼吸效果 (周期1.6秒, 亮度30-150)
    float breath = (sinf(now / 800.0f * PI) + 1.0f) / 2.0f;
    uint8_t bVal = (uint8_t)(breath * 120.0f + 30.0f);

    uint16_t hue;
    switch (moodSelectColor) {
        case MOOD_ICE_BLUE:     hue = 200; break;
        case MOOD_WARM_YELLOW:  hue = 42;  break;
        case MOOD_RED:          hue = 0;   break;
        case MOOD_GREEN:        hue = 120; break;
        default:                hue = 200; break;
    }

    uint32_t color = hsvToGrb(hue, 0.9f, bVal / 255.0f);
    for (int i = 0; i < NUM_LEDS; i++) {
        strip.setPixelColor(i, color);
    }

    strip.show();
}

// ---- 15f. 倾听回应动画 (琥珀色呼吸一圈) ----
void updateBellAnimation() {
    if (!bellAnimActive) return;

    uint32_t now = millis();
    uint32_t elapsed = now - bellAnimStart;
    const uint32_t bellDuration = 1200;

    if (elapsed >= bellDuration) {
        bellAnimActive = false;
        return;
    }

    float brightness;
    if (elapsed < 300) {
        brightness = (float)elapsed / 300.0f;
    } else if (elapsed < 900) {
        brightness = 1.0f;
    } else {
        brightness = 1.0f - (float)(elapsed - 900) / 300.0f;
    }

    uint8_t b = (uint8_t)(clampVal(brightness, 0.0f, 1.0f) * 200.0f);
    // 琥珀色: 偏橙 (R多, G中等, B少)
    fillAll((uint8_t)(b * 1.2f), b / 2, 0);
    strip.show();
}

// ---- 15g. 主动画调度器 ----
void updateAnimation() {
    if (moodSelectActive) {
        updateMoodSelectAnimation();
        return;
    }

    if (bellAnimActive) {
        updateBellAnimation();
        return;
    }

    switch (currentState) {
        case STATE_IDLE:    updateIdleAnimation();   break;
        case STATE_LISTEN:  updateListenAnimation();  break;
        case STATE_RELEASE: updateReleaseAnimation(); break;
        case STATE_RECOVER: updateRecoverAnimation(); break;
        default: break;
    }
}

// ---- 15h. 弹跳反馈动画 (短按TTP223) ----
void triggerBounceAnimation() {
    fillAll(255, 255, 255);
    strip.show();
    delay(80);  // 仅此处允许短暂阻塞(80ms), 反馈动画需要即时视觉
    clearAll();
    strip.show();
}

// ============================================================================
// 16. 音频控制
// ============================================================================

/*
 * @brief 启动音量渐入
 */
void startVolumeFadeIn(uint8_t target, uint32_t duration) {
    fadeState = FADE_IN;
    fadeStartTime = millis();
    fadeStartVolume = currentVolume;
    fadeTargetVolume = target;
    fadeDurationMs = duration;
}

/*
 * @brief 启动音量渐隐
 */
void startVolumeFadeOut(uint8_t target, uint32_t duration) {
    fadeState = FADE_OUT;
    fadeStartTime = millis();
    fadeStartVolume = currentVolume;
    fadeTargetVolume = target;
    fadeDurationMs = duration;
}

/*
 * @brief 更新音量渐变 (每帧调用, 非阻塞)
 */
void updateAudioFade() {
    if (fadeState == FADE_NONE || fadeState == FADE_COMPLETE) return;

    uint32_t now = millis();
    uint32_t elapsed = now - fadeStartTime;

    if (elapsed >= fadeDurationMs) {
        setPlayerVolume(fadeTargetVolume);
        fadeState = FADE_COMPLETE;
        return;
    }

    float progress = (float)elapsed / fadeDurationMs;
    uint8_t vol;
    if (fadeState == FADE_IN) {
        vol = (uint8_t)(fadeStartVolume + (fadeTargetVolume - fadeStartVolume) * progress);
    } else {
        vol = (uint8_t)(fadeStartVolume + (fadeTargetVolume - fadeStartVolume) * progress);
    }
    setPlayerVolume(vol);
}

/*
 * @brief 播放指定曲目
 * @param track 曲目编号 (1-8, 对应0001-0008.mp3)
 * @param loopFlag 是否循环播放
 */
void playTrack(int track, bool loopFlag = false) {
    if (isMuted) return;
    Serial.printf("[Audio] 播放 %04d, 循环=%d\n", track, loopFlag);
    if (loopFlag) {
        dfplayer.loop(track);
    } else {
        dfplayer.play(track);
    }
    currentTrack = track;
    isLooping = loopFlag;
}

/*
 * @brief 带淡入效果播放
 */
void playTrackWithFadeIn(int track, bool loopFlag = false) {
    setPlayerVolume(0);
    playTrack(track, loopFlag);
    startVolumeFadeIn(VOLUME_DEFAULT, VOLUME_FADE_MS);
}

/*
 * @brief 停止播放并淡出
 */
void stopTrackWithFadeOut() {
    if (currentTrack < 0) return;
    startVolumeFadeOut(0, VOLUME_FADE_MS);
}

/*
 * @brief 停止当前音频 (立即)
 */
void stopCurrentAudio() {
    if (currentTrack >= 0) {
        dfplayer.stop();
        currentTrack = -1;
        isLooping = false;
        waitingForThunderEnd = false;
    }
    fadeState = FADE_NONE;
}

/*
 * @brief 音效管理器 (每帧调用)
 */
void updateAudioManager() {
    updateAudioFade();

    if (isMuted) return;

    // 雷声播放完成 -> 自动接雨声循环
    if (waitingForThunderEnd && currentTrack == TRACK_THUNDER) {
        // DFPlayer 播放完成后 available() 返回非零
        if (dfplayer.available()) {
            uint8_t type = dfplayer.readType();
            if (type == DFPlayerPlayFinished) {
                dfplayer.read(); // 消费消息
                waitingForThunderEnd = false;
                Serial.println("[Audio] 雷声结束, 转入雨声循环");
                playTrackWithFadeIn(TRACK_RAIN, true);
            }
        }
    }
}

// ============================================================================
// 17. I2S DAC音频输出 (ESP32内部DAC -> PAM8403)
// ============================================================================

void initI2sDac() {
    // 兼容 ESP32 Arduino Core 2.x / 3.x
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX | I2S_MODE_DAC_BUILT_IN),
        .sample_rate = 16000,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_MSB,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,
        .dma_buf_len = 128,
        .use_apll = false,
    };

    esp_err_t err = i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
    if (err != ESP_OK) {
        Serial.printf("[I2S] 驱动安装失败: %d\n", err);
        return;
    }
    i2s_set_dac_mode(I2S_DAC_CHANNEL_BOTH_EN);
    Serial.println("[I2S] DAC初始化完成 (GPIO25左声道, GPIO26右声道)");
}

/*
 * @brief 通过I2S DAC输出立体声音频采样
 * I2S_CHANNEL_FMT_RIGHT_LEFT: 前16bit->右声道(GPIO26), 后16bit->左声道(GPIO25)
 * 8位DAC取每16bit的高8位: bits[31:24]->右, bits[15:8]->左
 */
void i2sWriteDacSample(uint8_t left, uint8_t right) {
    uint32_t sample = ((uint32_t)right << 24) | ((uint32_t)left << 8);
    size_t bytesWritten;
    i2s_write(I2S_NUM_0, &sample, sizeof(sample), &bytesWritten, 0);
}

// ============================================================================
// 18. 触摸交互处理
// ============================================================================

// Forward declarations
void handleShortPress();
void enterMoodSelection();
void exitMoodSelection();
void confirmMoodSelection();
void changeState(DeviceState newState);
void onEnterIdle();
void onEnterListen();
void onEnterRelease();
void onEnterRecover();

void handleTouchInput() {
    uint32_t now = millis();

    if (now - touchLastRead < TOUCH_DEBOUNCE_MS) return;
    touchLastRead = now;

    bool touchActive = touchRaw;

    switch (touchState) {

        case TOUCH_IDLE:
            if (touchActive) {
                touchState = TOUCH_PRESSED;
                touchDownTime = now;
                Serial.println("[Touch] 按下");
            }
            break;

        case TOUCH_PRESSED:
            if (!touchActive) {
                uint32_t pressDuration = now - touchDownTime;
                if (moodSelectActive) {
                    touchState = TOUCH_RELEASED_IN_MOOD;
                } else if (pressDuration >= TOUCH_LONG_PRESS_MS) {
                    // 长按 > 2s: 如果已在心情选择则退出, 否则进入
                    if (moodSelectActive) {
                        exitMoodSelection();
                    } else {
                        touchState = TOUCH_LONG;
                        enterMoodSelection();
                    }
                } else {
                    touchState = TOUCH_SHORT;
                }
            } else if (!moodSelectActive && (now - touchDownTime >= TOUCH_LONG_PRESS_MS)) {
                touchState = TOUCH_LONG;
                enterMoodSelection();
            }
            break;

        case TOUCH_SHORT:
            handleShortPress();
            touchState = TOUCH_IDLE;
            break;

        case TOUCH_LONG:
            if (!moodSelectActive) {
                touchState = TOUCH_IDLE;
            }
            break;

        case TOUCH_RELEASED_IN_MOOD:
            confirmMoodSelection();
            touchState = TOUCH_IDLE;
            break;
    }
}

/*
 * @brief 短按处理
 */
void handleShortPress() {
    Serial.println("[Touch] 短按");

    triggerBounceAnimation();

    // 全局: 静音切换
    if (currentTrack >= 0) {
        if (isMuted) {
            dfplayer.resume();
            isMuted = false;
            Serial.println("[Audio] 取消静音");
        } else {
            dfplayer.pause();
            isMuted = true;
            Serial.println("[Audio] 静音");
        }
    }

    // LISTEN状态额外: 倾听回应
    if (currentState == STATE_LISTEN) {
        Serial.println("[Touch] LISTEN - 铃铛回应");
        playTrack(TRACK_BELL, false);
        bellAnimActive = true;
        bellAnimStart = millis();
    }

    // RELEASE状态额外: 安全词
    if (currentState == STATE_RELEASE) {
        Serial.println("[Touch] RELEASE - 安全词激活");
        stressLevel = stressLevel / 2.0f;
        Serial.printf("[Stress] 安全词减半: %.1f\n", stressLevel);
        safetyWordActive = true;
        safetyWordStart = millis();
        playTrack(TRACK_GUIDE_STOP, false);
    }
}

/*
 * @brief 进入心情选择模式
 */
void enterMoodSelection() {
    Serial.println("[Mood] 进入心情选择模式");
    moodSelectActive = true;
    stateBeforeMood = currentState;
    currentState = STATE_MOOD_SELECT;
    moodSelectColor = MOOD_ICE_BLUE;
    moodSelectCycleTime = millis();

    if (currentTrack >= 0 && !isMuted) {
        dfplayer.pause();
    }
}

/*
 * @brief 退出心情选择模式
 */
void exitMoodSelection() {
    Serial.println("[Mood] 退出手动选择, 恢复自动状态机");
    moodSelectActive = false;
    currentState = stateBeforeMood;

    if (currentTrack >= 0 && isMuted) {
        dfplayer.resume();
        isMuted = false;
    }
}

/*
 * @brief 确认心情选择
 */
void confirmMoodSelection() {
    moodSelectActive = false;
    moodSelectResult = moodSelectColor;

    int guideTrack = 0;
    switch (moodSelectColor) {
        case MOOD_ICE_BLUE:
            Serial.println("[Mood] 选择: 冰蓝 -> LISTEN");
            changeState(STATE_LISTEN);
            guideTrack = TRACK_GUIDE_ANXIOUS;
            break;
        case MOOD_WARM_YELLOW:
            Serial.println("[Mood] 选择: 暖黄 -> LISTEN(焦虑基调)");
            changeState(STATE_LISTEN);
            guideTrack = TRACK_GUIDE_ANXIOUS;
            break;
        case MOOD_RED:
            Serial.println("[Mood] 选择: 红色 -> RELEASE");
            changeState(STATE_RELEASE);
            guideTrack = TRACK_GUIDE_STOP;
            break;
        case MOOD_GREEN:
            Serial.println("[Mood] 选择: 绿色 -> RECOVER");
            changeState(STATE_RECOVER);
            guideTrack = TRACK_GUIDE_ALWAYS;
            break;
    }

    if (guideTrack > 0) {
        playTrack(guideTrack, false);
    }
}

// ============================================================================
// 19. 状态机转换逻辑
// ============================================================================

/*
 * @brief 检查转换条件是否持续满足 (使用独立的Tracker)
 */
bool transitionConditionMet(TransitionTracker& tr, bool conditionMet, uint32_t requiredDuration) {
    uint32_t now = millis();
    if (conditionMet) {
        if (!tr.wasMet) {
            tr.startTime = now;
            tr.wasMet = true;
        }
        return (now - tr.startTime >= requiredDuration);
    } else {
        tr.wasMet = false;
        return false;
    }
}

/*
 * @brief 重置所有转换跟踪器 (状态切换后调用)
 */
void resetAllTrackers() {
    trIdleToList.wasMet = false;
    trListToRelease.wasMet = false;
    trReleaseToRecover.wasMet = false;
}

/*
 * @brief 执行状态转换
 */
void changeState(DeviceState newState) {
    if (currentState == newState) return;

    previousState = currentState;
    currentState = newState;

    const char* names[] = {"IDLE", "LISTEN", "RELEASE", "RECOVER", "MOOD"};
    Serial.printf("[State] %s -> %s\n", names[previousState], names[newState]);

    resetAllTrackers();

    switch (newState) {
        case STATE_IDLE:    onEnterIdle();    break;
        case STATE_LISTEN:  onEnterListen();  break;
        case STATE_RELEASE: onEnterRelease(); break;
        case STATE_RECOVER: onEnterRecover(); break;
        default: break;
    }
}

// ---- 状态进入处理 ----

void onEnterIdle() {
    stopCurrentAudio();
    breathStart = millis();
}

void onEnterListen() {
    stopCurrentAudio();
    playTrackWithFadeIn(TRACK_CAMPFIRE, true);
    rippleRadius = 0;
    rippleTargetRadius = 0;
}

void onEnterRelease() {
    waitingForThunderEnd = false;
    stopCurrentAudio();
    playTrack(TRACK_THUNDER, false);
    waitingForThunderEnd = true;
    strobePhase = false;
    strobeLastToggle = millis();
    runnerPosition = 0;
}

void onEnterRecover() {
    stopTrackWithFadeOut();
    playTrackWithFadeIn(TRACK_SOOTHING_MUSIC, true);
    breathStart = millis();
}

// ---- 状态转换检测 ----

void checkStateTransitions() {
    uint32_t now = millis();

    // ===== 全局超时: 无互动超60秒 -> IDLE =====
    if (currentState != STATE_IDLE && currentState != STATE_MOOD_SELECT) {
        if (now - lastInteractionTime >= DUR_INACTIVITY_TIMEOUT) {
            Serial.println("[State] 全局超时60秒, 返回IDLE");
            changeState(STATE_IDLE);
            return;
        }
    }

    // ===== IDLE -> LISTEN =====
    if (currentState == STATE_IDLE) {
        bool fsrInRange = (leftFsrValue >= FSR_LIGHT_TOUCH && leftFsrValue <= FSR_LISTEN_MAX)
                       || (rightFsrValue >= FSR_LIGHT_TOUCH && rightFsrValue <= FSR_LISTEN_MAX);
        bool calmMotion = (motionMagnitude < MOTION_CALM);
        bool condition = fsrInRange && calmMotion;

        if (condition) {
            if (!trIdleToList.wasMet) {
                trIdleToList.startTime = now;
                trIdleToList.wasMet = true;
                Serial.println("[State] IDLE->LISTEN 条件开始满足");
            }
            if (now - trIdleToList.startTime >= DUR_IDLE_TO_LISTEN) {
                Serial.println("[State] IDLE->LISTEN 触发 (持续2s)");
                changeState(STATE_LISTEN);
                return;
            }
        } else {
            trIdleToList.wasMet = false;
        }
    }

    // ===== LISTEN -> RELEASE =====
    if (currentState == STATE_LISTEN) {
        bool stressBurst = (stressLevel >= STRESS_RELEASE_THRESHOLD);
        if (stressBurst) {
            Serial.printf("[State] 情绪积累爆发: %.1f\n", stressLevel);
            changeState(STATE_RELEASE);
            return;
        }

        bool highIntensity = (leftFsrValue >= FSR_HEAVY) || (motionMagnitude >= MOTION_ANGRY);
        if (highIntensity) {
            if (!trListToRelease.wasMet) {
                trListToRelease.startTime = now;
                trListToRelease.wasMet = true;
                Serial.println("[State] LISTEN->RELEASE 条件开始满足");
            }
            if (now - trListToRelease.startTime >= DUR_LISTEN_TO_RELEASE) {
                Serial.println("[State] LISTEN->RELEASE 触发 (持续1s)");
                changeState(STATE_RELEASE);
                return;
            }
        } else {
            trListToRelease.wasMet = false;
        }
    }

    // ===== RELEASE -> RECOVER =====
    if (currentState == STATE_RELEASE) {
        if (safetyWordActive) {
            if (now - safetyWordStart >= SAFETY_WORD_LOCK_MS) {
                safetyWordActive = false;
                Serial.println("[Safety] 安全词锁定解除");
            } else {
                return;
            }
        }

        bool bothReleased = (leftFsrValue < FSR_LIGHT_TOUCH)
                         && (rightFsrValue < FSR_LIGHT_TOUCH);
        bool calm = (motionMagnitude < MOTION_CALM);
        bool condition = bothReleased && calm;

        if (condition) {
            if (!trReleaseToRecover.wasMet) {
                trReleaseToRecover.startTime = now;
                trReleaseToRecover.wasMet = true;
                Serial.println("[State] RELEASE->RECOVER 条件开始满足");
            }
            if (now - trReleaseToRecover.startTime >= DUR_RELEASE_TO_RECOVER) {
                Serial.println("[State] RELEASE->RECOVER 触发 (持续5s)");
                changeState(STATE_RECOVER);
                return;
            }
        } else {
            trReleaseToRecover.wasMet = false;
        }
    }

    // ===== RECOVER -> IDLE =====
    if (currentState == STATE_RECOVER) {
        // 拥抱姿态检测
        bool pitchLevel = (pitchAngle >= -15.0f && pitchAngle <= 15.0f);
        bool bothHolding = (leftFsrValue >= FSR_LIGHT_TOUCH && leftFsrValue <= FSR_LISTEN_MAX)
                        && (rightFsrValue >= FSR_LIGHT_TOUCH && rightFsrValue <= FSR_LISTEN_MAX);
        bool currentHug = pitchLevel && bothHolding;

        if (currentHug) {
            if (!hugWasStable) {
                hugStableStart = now;
                hugWasStable = true;
            }
            if (now - hugStableStart >= DUR_HUG_STABLE) {
                hugDetected = true;
            }
        } else {
            hugWasStable = false;
            hugDetected = false;
        }

        if (hugDetected && (now - hugStableStart >= DUR_RECOVER_TO_IDLE_HUG)) {
            Serial.println("[State] 拥抱姿态30秒, 返回IDLE");
            changeState(STATE_IDLE);
            return;
        }

        // 条件B: 60秒无互动
        if (now - lastInteractionTime >= DUR_RECOVER_TO_IDLE_INACT) {
            Serial.println("[State] RECOVER 60秒无互动, 返回IDLE");
            changeState(STATE_IDLE);
            return;
        }
    }
}

// ============================================================================
// 20. 初始化
// ============================================================================

void setup() {
    Serial.begin(115200);
    delay(300);
    Serial.println("\n========================================");
    Serial.println("  树洞情绪疗愈装置 v1.0");
    Serial.println("  Tree Hole Emotional Healing Device");
    Serial.println("========================================\n");

    // ---- 引脚初始化 ----
    pinMode(PIN_FSR_LEFT, INPUT);
    pinMode(PIN_FSR_RIGHT, INPUT);
    pinMode(PIN_TOUCH, INPUT);
    analogReadResolution(12);

    // ---- WS2812灯环 ----
    strip.begin();
    strip.setBrightness(255);
    clearAll();
    strip.show();
    Serial.println("[OK] WS2812 24灯环");

    // ---- MPU6050 ----
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    if (!mpu.begin()) {
        Serial.println("[ERR] MPU6050 初始化失败! 请检查I2C接线");
    } else {
        mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
        mpu.setGyroRange(MPU6050_RANGE_500_DEG);
        mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
        Serial.println("[OK] MPU6050");
    }

    // ---- DFPlayer Mini (HardwareSerial2 @ 9600bps) ----
    // 接线: DFPlayer TX -> ESP32 GPIO18, DFPlayer RX -> ESP32 GPIO19
    Serial2.begin(9600, SERIAL_8N1, PIN_DF_RX, PIN_DF_TX);
    delay(100);
    if (!dfplayer.begin(Serial2)) {
        Serial.println("[ERR] DFPlayer Mini 初始化失败!");
        Serial.println("      请检查: UART接线/波特率/SD卡/供电");
    } else {
        setPlayerVolume(VOLUME_DEFAULT);
        Serial.println("[OK] DFPlayer Mini (Serial2)");
        Serial.println("      0001.mp3 舒缓音乐    0005.mp3 铃铛声");
        Serial.println("      0002.mp3 雨声白噪音   0006.mp3 引导语-不安");
        Serial.println("      0003.mp3 雷声        0007.mp3 引导语-暂停");
        Serial.println("      0004.mp3 篝火环境声   0008.mp3 引导语-陪伴");
    }

    // ---- I2S DAC ----
    initI2sDac();

    // ---- 计时器初始化 ----
    lastInteractionTime = millis();
    breathStart = millis();

    Serial.println("\n[系统] 进入IDLE状态, 等待互动...\n");
}

// ============================================================================
// 21. 主循环 (非阻塞调度器)
// ============================================================================

void loop() {
    uint32_t now = millis();

    // ---- 传感器读取 (每20ms) ----
    if (now - lastSensorRead >= SENSOR_READ_MS) {
        readSensors();
        lastSensorRead = now;
    }

    // ---- 触摸检测 (每20ms) ----
    if (now - lastTouchCheck >= TOUCH_CHECK_MS) {
        handleTouchInput();
        lastTouchCheck = now;
    }

    // ---- 情绪积累更新 (每100ms) ----
    if (now - lastStressUpdate >= STRESS_UPDATE_INTERVAL) {
        updateStressLevel();
        lastStressUpdate = now;
    }

    // ---- 状态转换检测 (每100ms) ----
    if (now - lastStateCheck >= STATE_CHECK_MS) {
        checkStateTransitions();
        lastStateCheck = now;
    }

    // ---- 灯光动画更新 ----
    updateAnimation();

    // ---- 音频管理 (淡入淡出/播放完成) ----
    updateAudioManager();

    // ---- 调试输出 (每秒) ----
    if (now - lastDebugPrint >= 1000) {
        lastDebugPrint = now;
        const char* stateNames[] = {"IDLE", "LISTEN", "RELEASE", "RECOVER", "MOOD"};
        Serial.printf("[%lu] S:%s | L:%4u R:%4u | M:%.2f P:%.1f | ST:%.1f | T:%d SW:%d | TK:%d\n",
                      now,
                      stateNames[currentState],
                      leftFsrValue, rightFsrValue,
                      motionMagnitude, pitchAngle,
                      stressLevel,
                      touchRaw, safetyWordActive,
                      currentTrack);
    }

    yield();
}
