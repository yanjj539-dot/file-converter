/*
 * DFRobotDFPlayerMini - 精简版
 * 适用于 ESP32, 通过 HardwareSerial 控制 DFPlayer Mini
 */
#ifndef DFROBOT_DFPLAYER_MINI_H
#define DFROBOT_DFPLAYER_MINI_H

#include <Arduino.h>

// 消息类型
#define DFPlayerPlayFinished 0x3D
#define DFPlayerCardOnline   0x3F
#define DFPlayerCardInserted 0x3A
#define DFPlayerCardRemoved  0x3B

// 播放模式
#define DFPLAYER_DEVICE_U_DISK 1
#define DFPLAYER_DEVICE_SD     2

class DFRobot_DFPlayerMini {
public:
    DFRobot_DFPlayerMini();

    bool begin(Stream &stream, bool isACK = true, bool doReset = true);

    void play(uint16_t track);
    void play(uint8_t folder, uint8_t track);
    void playMp3Folder(uint16_t track);
    void playLargeFolder(uint8_t folder, uint16_t track);
    void loop(uint16_t track);
    void loopFolder(uint8_t folder);
    void pause();
    void resume();
    void stop();
    void next();
    void previous();
    void volume(uint8_t vol);
    void volumeUp();
    void volumeDown();
    void EQ(uint8_t eq);
    void playbackSource(uint8_t source);
    void standbyMode();
    void normalMode();
    void reset();
    void start();
    void enableLoopAll();
    void disableLoopAll();
    void randomAll();
    void enableLoop();
    void disableLoop();
    void moduleSleep();
    void moduleWakeUp();

    bool available();
    uint8_t readType();
    uint16_t read();
    void readState(uint8_t &type, uint16_t &value);

    bool waitAvailable(unsigned long duration = 0);

private:
    Stream *_serial;
    bool _isACK;
    uint8_t _rxBuf[10];
    uint8_t _rxIndex;

    void sendCommand(uint8_t cmd, uint16_t param = 0);
    void sendCheck(uint8_t cmd, uint16_t param = 0);
    uint16_t calcChecksum(uint8_t *buf, uint8_t len);
    bool parsePacket();
    uint8_t _lastType;
    uint16_t _lastValue;
    bool _packetReady;
};

#endif
