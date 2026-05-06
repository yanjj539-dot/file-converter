/*
 * DFRobotDFPlayerMini - 精简版实现
 * 通过串口发送指令控制 DFPlayer Mini 模块
 */
#include "DFRobot_DFPlayerMini.h"

// 命令码
#define DFPLAYER_CMD_PLAY_NEXT        0x01
#define DFPLAYER_CMD_PLAY_PREV        0x02
#define DFPLAYER_CMD_PLAY_TRACK       0x03
#define DFPLAYER_CMD_VOLUME_UP        0x04
#define DFPLAYER_CMD_VOLUME_DOWN      0x05
#define DFPLAYER_CMD_SET_VOLUME       0x06
#define DFPLAYER_CMD_SET_EQ           0x07
#define DFPLAYER_CMD_PLAY_TRACK_REPEAT 0x08
#define DFPLAYER_CMD_SET_PLAYBACK_SRC 0x09
#define DFPLAYER_CMD_STANDBY          0x0A
#define DFPLAYER_CMD_NORMAL           0x0B
#define DFPLAYER_CMD_RESET            0x0C
#define DFPLAYER_CMD_PLAY             0x0D
#define DFPLAYER_CMD_PAUSE            0x0E
#define DFPLAYER_CMD_PLAY_FOLDER      0x0F
#define DFPLAYER_CMD_REPEAT_ALL       0x11
#define DFPLAYER_CMD_RANDOM_ALL       0x12
#define DFPLAYER_CMD_REPEAT_CURRENT   0x13
#define DFPLAYER_CMD_SET_DAC          0x1A
#define DFPLAYER_CMD_PLAY_MP3_FOLDER  0x12
#define DFPLAYER_CMD_PLAY_LARGE       0x14
#define DFPLAYER_CMD_STOP             0x16
#define DFPLAYER_CMD_LOOP_FOLDER      0x17
#define DFPLAYER_CMD_RANDOM_FOLDER    0x18
#define DFPLAYER_CMD_SLEEP            0x0A

#define DFPLAYER_CMD_QUERY_STATUS     0x42
#define DFPLAYER_CMD_QUERY_VOLUME     0x43
#define DFPLAYER_CMD_QUERY_EQ         0x44
#define DFPLAYER_CMD_QUERY_PLAY_MODE  0x45
#define DFPLAYER_CMD_QUERY_SW_VERSION 0x46
#define DFPLAYER_CMD_QUERY_TF_FILES   0x47
#define DFPLAYER_CMD_QUERY_U_FILES    0x48
#define DFPLAYER_CMD_QUERY_SD_FILES   0x49
#define DFPLAYER_CMD_QUERY_TRACK_SD   0x4C
#define DFPLAYER_CMD_QUERY_TOTAL_TRACKS 0x48

// NOTE: Arduino.h already provides constrain(), removed redefinition

DFRobot_DFPlayerMini::DFRobot_DFPlayerMini()
    : _serial(nullptr), _isACK(true), _rxIndex(0),
      _lastType(0), _lastValue(0), _packetReady(false) {}

bool DFRobot_DFPlayerMini::begin(Stream &stream, bool isACK, bool doReset) {
    _serial = &stream;
    _isACK = isACK;

    if (doReset) {
        reset();
        delay(200);
    }

    // 设置回放源为 SD 卡
    sendCommand(DFPLAYER_CMD_SET_PLAYBACK_SRC, DFPLAYER_DEVICE_SD);
    delay(200);

    // 设置音量
    volume(20);

    return true;
}

void DFRobot_DFPlayerMini::play(uint16_t track) {
    sendCommand(DFPLAYER_CMD_PLAY_TRACK, constrain(track, 1, 3000));
}

void DFRobot_DFPlayerMini::play(uint8_t folder, uint8_t track) {
    uint16_t param = ((uint16_t)folder << 8) | track;
    sendCommand(DFPLAYER_CMD_PLAY_FOLDER, param);
}

void DFRobot_DFPlayerMini::playMp3Folder(uint16_t track) {
    sendCommand(DFPLAYER_CMD_PLAY_MP3_FOLDER, constrain(track, 1, 3000));
}

void DFRobot_DFPlayerMini::playLargeFolder(uint8_t folder, uint16_t track) {
    uint16_t param = ((uint16_t)folder << 12) | track;
    sendCommand(DFPLAYER_CMD_PLAY_LARGE, param);
}

void DFRobot_DFPlayerMini::loop(uint16_t track) {
    sendCommand(DFPLAYER_CMD_PLAY_TRACK_REPEAT, constrain(track, 1, 3000));
}

void DFRobot_DFPlayerMini::loopFolder(uint8_t folder) {
    sendCommand(DFPLAYER_CMD_LOOP_FOLDER, folder);
}

void DFRobot_DFPlayerMini::pause() {
    sendCommand(DFPLAYER_CMD_PAUSE);
}

void DFRobot_DFPlayerMini::resume() {
    sendCommand(DFPLAYER_CMD_PLAY);
}

void DFRobot_DFPlayerMini::stop() {
    sendCommand(DFPLAYER_CMD_STOP);
}

void DFRobot_DFPlayerMini::next() {
    sendCommand(DFPLAYER_CMD_PLAY_NEXT);
}

void DFRobot_DFPlayerMini::previous() {
    sendCommand(DFPLAYER_CMD_PLAY_PREV);
}

void DFRobot_DFPlayerMini::volume(uint8_t vol) {
    sendCommand(DFPLAYER_CMD_SET_VOLUME, constrain(vol, 0, 30));
}

void DFRobot_DFPlayerMini::volumeUp() {
    sendCommand(DFPLAYER_CMD_VOLUME_UP);
}

void DFRobot_DFPlayerMini::volumeDown() {
    sendCommand(DFPLAYER_CMD_VOLUME_DOWN);
}

void DFRobot_DFPlayerMini::EQ(uint8_t eq) {
    sendCommand(DFPLAYER_CMD_SET_EQ, constrain(eq, 0, 5));
}

void DFRobot_DFPlayerMini::playbackSource(uint8_t source) {
    sendCommand(DFPLAYER_CMD_SET_PLAYBACK_SRC, source);
}

void DFRobot_DFPlayerMini::standbyMode() {
    sendCommand(DFPLAYER_CMD_STANDBY);
}

void DFRobot_DFPlayerMini::normalMode() {
    sendCommand(DFPLAYER_CMD_NORMAL);
}

void DFRobot_DFPlayerMini::reset() {
    sendCommand(DFPLAYER_CMD_RESET);
}

void DFRobot_DFPlayerMini::enableLoopAll() {
    sendCommand(DFPLAYER_CMD_REPEAT_ALL, 1);
}

void DFRobot_DFPlayerMini::disableLoopAll() {
    sendCommand(DFPLAYER_CMD_REPEAT_ALL, 0);
}

void DFRobot_DFPlayerMini::randomAll() {
    sendCommand(DFPLAYER_CMD_RANDOM_ALL);
}

void DFRobot_DFPlayerMini::enableLoop() {
    sendCommand(DFPLAYER_CMD_REPEAT_CURRENT, 1);
}

void DFRobot_DFPlayerMini::disableLoop() {
    sendCommand(DFPLAYER_CMD_REPEAT_CURRENT, 0);
}

void DFRobot_DFPlayerMini::moduleSleep() {
    sendCommand(DFPLAYER_CMD_SLEEP);
}

void DFRobot_DFPlayerMini::moduleWakeUp() {
    _serial->write(0xFF);
}

void DFRobot_DFPlayerMini::start() {
    sendCommand(DFPLAYER_CMD_PLAY);
}

// ---- 数据接收与解析 ----

bool DFRobot_DFPlayerMini::available() {
    while (_serial->available()) {
        uint8_t byte = _serial->read();
        _rxBuf[_rxIndex++] = byte;

        // 检测起始字节 + 版本号
        if (_rxIndex == 1 && byte != 0x7E) {
            _rxIndex = 0;
            continue;
        }
        if (_rxIndex == 2 && byte != 0xFF) {
            _rxIndex = 0;
            continue;
        }
        if (_rxIndex == 3 && byte != 0x06) {
            _rxIndex = 0;
            continue;
        }

        // 接收完整的 10 字节包
        if (_rxIndex >= 10) {
            _rxIndex = 0;
            if (parsePacket()) {
                _packetReady = true;
                return true;
            }
        }
    }
    return _packetReady;
}

uint8_t DFRobot_DFPlayerMini::readType() {
    if (_packetReady) {
        return _lastType;
    }
    return 0;
}

uint16_t DFRobot_DFPlayerMini::read() {
    _packetReady = false;
    return _lastValue;
}

void DFRobot_DFPlayerMini::readState(uint8_t &type, uint16_t &value) {
    type = _lastType;
    value = _lastValue;
    _packetReady = false;
}

bool DFRobot_DFPlayerMini::waitAvailable(unsigned long duration) {
    unsigned long start = millis();
    do {
        if (available()) return true;
        delay(1);
    } while (millis() - start < duration);
    return false;
}

// ---- 内部函数 ----

void DFRobot_DFPlayerMini::sendCommand(uint8_t cmd, uint16_t param) {
    uint8_t buf[10] = {0};
    buf[0] = 0x7E;          // 起始字节
    buf[1] = 0xFF;          // 版本
    buf[2] = 0x06;          // 数据长度(不含起始/结束/校验)
    buf[3] = cmd;           // 命令
    buf[4] = (_isACK ? 0x01 : 0x00);  // 反馈
    buf[5] = (param >> 8) & 0xFF;     // 参数高字节
    buf[6] = param & 0xFF;            // 参数低字节
    uint16_t checksum = calcChecksum(buf, 7);
    buf[7] = (checksum >> 8) & 0xFF;
    buf[8] = checksum & 0xFF;
    buf[9] = 0xEF;          // 结束字节

    for (uint8_t i = 0; i < 10; i++) {
        _serial->write(buf[i]);
    }
    delay(30); // 给模块处理时间
}

void DFRobot_DFPlayerMini::sendCheck(uint8_t cmd, uint16_t param) {
    sendCommand(cmd, param);
    // 简化版不等待 ACK
}

uint16_t DFRobot_DFPlayerMini::calcChecksum(uint8_t *buf, uint8_t len) {
    uint16_t sum = 0;
    for (uint8_t i = 1; i < len; i++) {  // 跳过起始字节
        sum += buf[i];
    }
    return -sum;
}

bool DFRobot_DFPlayerMini::parsePacket() {
    // 验证校验和
    uint16_t expected = calcChecksum(_rxBuf, 7);
    uint16_t received = ((uint16_t)_rxBuf[7] << 8) | _rxBuf[8];
    if (expected != received) return false;
    if (_rxBuf[9] != 0xEF) return false;

    _lastType  = _rxBuf[3];
    _lastValue = ((uint16_t)_rxBuf[5] << 8) | _rxBuf[6];
    return true;
}
