
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

// -------------------------
// Pin definitions
// -------------------------
#define SOUND1_PIN 12
#define SOUND2_PIN 13
#define PULSE_PIN  14
#define MQ_PIN     26

// Onboard indicators & controls (available on standard ESP32 Dev boards)
#define LED_PIN    2    // Built-in blue LED (HIGH = ON, LOW = OFF)
#define BUTTON_PIN 0    // Built-in BOOT button (active LOW, press to toggle ON/OFF)

// -------------------------
// State & Timing
// -------------------------
bool isStreaming = true;        // Controls whether ESP32 streams sensor telemetry
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 1000;  // 1 second

// Button debouncing
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 250;  // 250ms debounce

// Command buffer
String serialCmdBuffer = "";
String btCmdBuffer = "";

// --------------------------------
// Helper: Apply Streaming State
// --------------------------------
void setStreamingState(bool state) {
  isStreaming = state;
  digitalWrite(LED_PIN, isStreaming ? HIGH : LOW);

  String response = isStreaming ? "ESP32_STATE:ON" : "ESP32_STATE:OFF";
  Serial.println(response);
  SerialBT.println(response);

  if (isStreaming) {
    Serial.println("[SYSTEM] Telemetry streaming started (ON)");
    SerialBT.println("[SYSTEM] Telemetry streaming started (ON)");
  } else {
    Serial.println("[SYSTEM] Telemetry streaming paused (OFF)");
    SerialBT.println("[SYSTEM] Telemetry streaming paused (OFF)");
  }
}

// --------------------------------
// Helper: Process Text Commands
// Supports: "ON", "OFF", "START", "STOP", "TOGGLE", "1", "0"
// --------------------------------
void processCommand(String cmd) {
  cmd.trim();
  cmd.toUpperCase();

  if (cmd.length() == 0) return;

  if (cmd == "ON" || cmd == "START" || cmd == "1") {
    setStreamingState(true);
  } else if (cmd == "OFF" || cmd == "STOP" || cmd == "0") {
    setStreamingState(false);
  } else if (cmd == "TOGGLE" || cmd == "T") {
    setStreamingState(!isStreaming);
  } else if (cmd == "STATUS") {
    String statusMsg = String("ESP32_STATE:") + (isStreaming ? "ON" : "OFF");
    Serial.println(statusMsg);
    SerialBT.println(statusMsg);
  } else {
    Serial.println("[ERROR] Unknown command. Available: ON, OFF, TOGGLE, STATUS");
    SerialBT.println("[ERROR] Unknown command. Available: ON, OFF, TOGGLE, STATUS");
  }
}

void setup() {
  // USB Serial
  Serial.begin(115200);

  // Sensor Pins
  pinMode(MQ_PIN, INPUT);

  // Status LED & Physical Button
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Start with LED on since isStreaming starts as true
  digitalWrite(LED_PIN, HIGH);

  // Start Bluetooth
  SerialBT.begin("ESP32_Sensor");

  Serial.println();
  Serial.println("================================================");
  Serial.println("       AeroPulse ESP32 Multi-Sensor");
  Serial.println("================================================");
  Serial.println("Bluetooth : ESP32_Sensor");
  Serial.println("Sound 1   : GPIO12");
  Serial.println("Sound 2   : GPIO13");
  Serial.println("Pulse     : GPIO14");
  Serial.println("MQ D0     : GPIO26");
  Serial.println("Status LED: GPIO2");
  Serial.println("BOOT Btn  : GPIO0 (Press to toggle ON/OFF)");
  Serial.println("Commands  : Send 'ON', 'OFF', or 'TOGGLE' anytime");
  Serial.println("================================================");
  Serial.println("ESP32_STATE:ON");

  SerialBT.println("AeroPulse ESP32 Ready");
  SerialBT.println("ESP32_STATE:ON");
}

// --------------------------------
// Hardware Sampling Variables
// --------------------------------
int maxM1 = 0, minM1 = 4095;
int maxM2 = 0, minM2 = 4095;
int maxPulse = 0, minPulse = 4095;

void loop() {
  // 1. Check physical BOOT button
  int buttonReading = digitalRead(BUTTON_PIN);
  if (buttonReading == LOW && lastButtonState == HIGH) {
    if (millis() - lastDebounceTime > DEBOUNCE_DELAY) {
      lastDebounceTime = millis();
      setStreamingState(!isStreaming);
    }
  }
  lastButtonState = buttonReading;

  // 2. Check incoming USB Serial commands
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      if (serialCmdBuffer.length() > 0) {
        processCommand(serialCmdBuffer);
        serialCmdBuffer = "";
      }
    } else {
      serialCmdBuffer += c;
    }
  }

  // 3. Check incoming Bluetooth Serial commands
  while (SerialBT.available()) {
    char c = (char)SerialBT.read();
    if (c == '\n' || c == '\r') {
      if (btCmdBuffer.length() > 0) {
        processCommand(btCmdBuffer);
        btCmdBuffer = "";
      }
    } else {
      btCmdBuffer += c;
    }
  }

  // 4. If streaming is OFF, skip reading
  if (!isStreaming) {
    delay(10);
    return;
  }

  // --------------------------------
  // CONTINUOUS SIGNAL PROCESSING 
  // (Peak-to-Peak Envelope Tracking)
  // --------------------------------
  
  // Sample continuously as fast as the loop runs
  int currentM1 = analogRead(SOUND1_PIN);
  int currentM2 = analogRead(SOUND2_PIN);
  int currentPulse = analogRead(PULSE_PIN);

  // Track the highest and lowest points of the sound wave
  if (currentM1 > maxM1) maxM1 = currentM1;
  if (currentM1 < minM1) minM1 = currentM1;
  
  if (currentM2 > maxM2) maxM2 = currentM2;
  if (currentM2 < minM2) minM2 = currentM2;
  
  if (currentPulse > maxPulse) maxPulse = currentPulse;
  if (currentPulse < minPulse) minPulse = currentPulse;

  // --------------------------------
  // 5. Send Envelope Summary every SEND_INTERVAL
  // --------------------------------
  if (millis() - lastSend >= SEND_INTERVAL) {
    lastSend = millis();

    // The true acoustic feature is the envelope amplitude (Max - Min)
    int envM1 = maxM1 - minM1;
    int envM2 = maxM2 - minM2;
    
    // For the pulse sensor, we want the RAW analog value to detect the wave, 
    // NOT the peak-to-peak envelope. We'll send the most recent instantaneous reading.
    int rawPulse = currentPulse;

    // Read MQ digital output (LOW = gas detected)
    int mqState = digitalRead(MQ_PIN);
    String gasStatus = (mqState == LOW) ? "Alert" : "Safe";

    // Telemetry payload
    String data =
      "M1:" + String(envM1) +
      " M2:" + String(envM2) +
      " Gas:" + gasStatus +
      " HB:" + String(rawPulse);

    // USB Serial
    Serial.println(data);

    // Bluetooth
    SerialBT.println(data);

    // Reset tracking envelopes for the next 1-second window
    maxM1 = 0; minM1 = 4095;
    maxM2 = 0; minM2 = 4095;
  }
}
