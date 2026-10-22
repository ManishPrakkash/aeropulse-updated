# AeroPulse ESP32 Multi-Sensor Firmware

This firmware reads multiple medical & environmental sensors from an ESP32 board and transmits structured telemetry simultaneously over **USB Serial** and **Bluetooth Serial (SPP)** at **115200 baud**.

## 📌 Pin Configuration

| Sensor / Feature | ESP32 Pin | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Sound Sensor 1 (Acoustic / Mic 1)** | `GPIO 12` | Analog (ADC2_CH5) | Ambient / Reference audio level (0-4095) |
| **Sound Sensor 2 (Tracheal / Mic 2)** | `GPIO 13` | Analog (ADC2_CH4) | Wheeze / Respiratory acoustic level (0-4095) |
| **Pulse / Heart Rate Sensor** | `GPIO 14` | Analog (ADC2_CH6) | Analog PPG / Heartbeat signal (0-4095) |
| **MQ Gas Sensor (D0 pin)** | `GPIO 26` | Digital (INPUT) | Digital air quality threshold: `LOW` = Alert, `HIGH` = Safe |
| **Status LED** | `GPIO 2` | Output (Built-in) | `HIGH` = Streaming ON, `LOW` = Streaming OFF |
| **Physical Button** | `GPIO 0` | Input Pullup | Built-in **BOOT button**: Press to toggle ON/OFF |

## ⚡ Real-Time ON / OFF Control

You can turn sensor streaming ON and OFF in three ways:

### 1. Web App Switch
In the AeroPulse web app, click the **"ESP32 Stream: ON / OFF"** power button to pause or resume sensor acquisition remotely.

### 2. Serial / Bluetooth Commands
Send any of the following text commands over USB Serial or Bluetooth Serial:
- `ON` or `START` or `1`: Resumes telemetry streaming and turns on status LED.
- `OFF` or `STOP` or `0`: Pauses telemetry streaming and turns off status LED.
- `TOGGLE` or `T`: Toggles streaming state between ON and OFF.
- `STATUS`: Queries current state (`ESP32_STATE:ON` or `ESP32_STATE:OFF`).

### 3. Physical Button
Press the onboard **BOOT button (GPIO 0)** on your ESP32 board at any time to toggle streaming ON/OFF. The onboard LED (GPIO 2) illuminates when streaming is active.

## 📡 Output Telemetry Format

Transmitted every `1000ms` when ON:
```text
M1:482 M2:610 Gas:Safe HB:2048
```
- `M1`: Sound sensor 1 raw reading (0 - 4095)
- `M2`: Sound sensor 2 raw reading (0 - 4095)
- `Gas`: Gas detector status (`Safe` or `Alert`)
- `HB`: Pulse sensor raw reading (0 - 4095)
