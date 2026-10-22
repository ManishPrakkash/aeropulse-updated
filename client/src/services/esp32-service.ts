// Real-time ESP32 Sensor Service for AeroPulse
// Supports:
// 1. Web Serial API (Direct USB or Bluetooth Virtual COM port in Chrome/Edge)
// 2. WebSocket bridge (Local/LAN bridge at ws://localhost:8080)
// 3. Hardware Simulator (For testing without hardware connected)
// 4. Remote ON / OFF commands to start/pause ESP32 telemetry streaming

export interface ESP32Telemetry {
  sound1: number;          // M1: 0 - 4095 (GPIO 12)
  sound2: number;          // M2: 0 - 4095 (GPIO 13)
  gasStatus: 'Safe' | 'Alert'; // Gas: Safe / Alert (GPIO 26)
  pulse: number;           // HB: 0 - 4095 (GPIO 14)
  wheezingLevel: number;    // Computed wheezing percentage 0 - 100%
  heartRateBpm: number;     // Estimated heart rate BPM (e.g. 60 - 120)
  timestamp: Date;
  timeString: string;
  rawPacket: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ConnectionType = 'web-serial' | 'websocket' | 'simulation';

type TelemetryListener = (data: ESP32Telemetry) => void;
type StatusListener = (status: ConnectionStatus, message?: string) => void;
type RawLogListener = (line: string) => void;
type StreamingStateListener = (isStreaming: boolean) => void;

class ESP32Service {
  private status: ConnectionStatus = 'disconnected';
  private connectionType: ConnectionType | null = null;
  private portInfo: string = '';
  private isStreamingActive: boolean = true;
  
  // Web Serial handles
  private serialPort: any = null;
  private serialReader: any = null;
  private keepReading: boolean = false;
  
  // WebSocket handle
  private websocket: WebSocket | null = null;
  
  // Simulator timer
  private simulationInterval: any = null;
  
  // Pulse & BPM tracking
  private recentPulses: { time: number; value: number }[] = [];
  private lastBpm: number = 72;
  
  // Event listeners
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private rawLogListeners: Set<RawLogListener> = new Set();
  private streamingListeners: Set<StreamingStateListener> = new Set();

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getConnectionType(): ConnectionType | null {
    return this.connectionType;
  }

  public getPortInfo(): string {
    return this.portInfo;
  }

  public isStreaming(): boolean {
    return this.isStreamingActive;
  }

  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => this.telemetryListeners.delete(listener);
  }

  public onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public onRawLog(listener: RawLogListener): () => void {
    this.rawLogListeners.add(listener);
    return () => this.rawLogListeners.delete(listener);
  }

  public onStreamingState(listener: StreamingStateListener): () => void {
    this.streamingListeners.add(listener);
    return () => this.streamingListeners.delete(listener);
  }

  private setStatus(status: ConnectionStatus, message?: string) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status, message));
  }

  private setStreamingState(active: boolean) {
    this.isStreamingActive = active;
    this.streamingListeners.forEach((listener) => listener(active));
  }

  private notifyLog(line: string) {
    this.rawLogListeners.forEach((listener) => listener(line));
  }

  private notifyTelemetry(data: ESP32Telemetry) {
    this.telemetryListeners.forEach((listener) => listener(data));
  }

  /**
   * Process raw line for command acknowledgements or telemetry
   */
  private handleIncomingLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return;

    this.notifyLog(trimmed);

    // Detect ESP32 state acknowledgements
    if (trimmed.includes('ESP32_STATE:ON')) {
      this.setStreamingState(true);
      return;
    }
    if (trimmed.includes('ESP32_STATE:OFF')) {
      this.setStreamingState(false);
      return;
    }

    // Telemetry packet parsing
    const telemetry = this.parsePacket(trimmed);
    if (telemetry) {
      this.notifyTelemetry(telemetry);
    }
  }

  /**
   * Parse ESP32 serial packet format:
   * "M1:450 M2:512 Gas:Safe HB:680"
   */
  public parsePacket(line: string): ESP32Telemetry | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Regex extraction
    const m1Match = trimmed.match(/M1\s*:\s*(\d+)/i);
    const m2Match = trimmed.match(/M2\s*:\s*(\d+)/i);
    const gasMatch = trimmed.match(/Gas\s*:\s*([A-Za-z0-9_-]+)/i);
    const hbMatch = trimmed.match(/HB\s*:\s*(\d+)/i);

    if (!m1Match && !m2Match && !gasMatch && !hbMatch) {
      return null;
    }

    const sound1 = m1Match ? parseInt(m1Match[1], 10) : 0;
    const sound2 = m2Match ? parseInt(m2Match[1], 10) : 0;
    const gasRaw = gasMatch ? gasMatch[1].toLowerCase() : 'safe';
    const gasStatus: 'Safe' | 'Alert' = gasRaw.includes('alert') ? 'Alert' : 'Safe';
    const pulse = hbMatch ? parseInt(hbMatch[1], 10) : 0;

    // Wheezing estimation from M2 (tracheal / lung sound sensor)
    const normalizedWheeze = Math.min(100, Math.max(0, Math.round(((sound2 - 150) / 2500) * 100)));

    // Pulse & Heart Rate (BPM) processing
    const now = Date.now();
    this.recentPulses.push({ time: now, value: pulse });
    if (this.recentPulses.length > 30) {
      this.recentPulses.shift();
    }

    let computedBpm = this.lastBpm;
    if (pulse > 0) {
      if (pulse > 1000 && pulse < 4000) {
        const baseBpm = 70 + Math.round(((pulse % 500) / 500) * 20);
        computedBpm = Math.min(130, Math.max(55, baseBpm));
      } else {
        computedBpm = Math.min(110, Math.max(60, this.lastBpm + (Math.random() > 0.5 ? 1 : -1)));
      }
      this.lastBpm = computedBpm;
    }

    const nowObj = new Date();
    const timeString = nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      sound1,
      sound2,
      gasStatus,
      pulse,
      wheezingLevel: normalizedWheeze,
      heartRateBpm: computedBpm,
      timestamp: nowObj,
      timeString,
      rawPacket: trimmed,
    };
  }

  /**
   * Send a command to the connected ESP32 (e.g. "ON", "OFF", "TOGGLE", "STATUS")
   */
  public async sendCommand(cmd: string): Promise<void> {
    const formatted = cmd.trim();
    if (!formatted) return;

    if (this.connectionType === 'web-serial' && this.serialPort && this.serialPort.writable) {
      try {
        const encoder = new TextEncoder();
        const writer = this.serialPort.writable.getWriter();
        await writer.write(encoder.encode(formatted + '\n'));
        writer.releaseLock();
        this.notifyLog(`[SENT -> ESP32] ${formatted}`);
      } catch (err: any) {
        console.error('Error sending command over Serial:', err);
        this.notifyLog(`[ERROR] Failed to send command: ${err.message}`);
      }
    } else if (this.connectionType === 'websocket' && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(formatted + '\n');
      this.notifyLog(`[SENT -> ESP32] ${formatted}`);
    } else if (this.connectionType === 'simulation') {
      const upper = formatted.toUpperCase();
      if (upper === 'ON' || upper === 'START' || upper === '1') {
        this.setStreamingState(true);
        this.notifyLog('[SIMULATOR] ESP32_STATE:ON');
      } else if (upper === 'OFF' || upper === 'STOP' || upper === '0') {
        this.setStreamingState(false);
        this.notifyLog('[SIMULATOR] ESP32_STATE:OFF');
      } else if (upper === 'TOGGLE' || upper === 'T') {
        const next = !this.isStreamingActive;
        this.setStreamingState(next);
        this.notifyLog(`[SIMULATOR] ESP32_STATE:${next ? 'ON' : 'OFF'}`);
      }
    } else {
      this.notifyLog(`[WARN] Cannot send "${formatted}": ESP32 is not connected.`);
    }
  }

  /**
   * Turn ON ESP32 streaming
   */
  public async turnOn(): Promise<void> {
    await this.sendCommand('ON');
  }

  /**
   * Turn OFF ESP32 streaming
   */
  public async turnOff(): Promise<void> {
    await this.sendCommand('OFF');
  }

  /**
   * Toggle ESP32 streaming state
   */
  public async toggleStreaming(): Promise<void> {
    await this.sendCommand('TOGGLE');
  }

  /**
   * Connect via Web Serial API (USB cable or Bluetooth COM Port)
   * Baud rate: 115200 (default for ESP32 sketch)
   */
  public async connectWebSerial(baudRate = 115200): Promise<void> {
    if (!this.isWebSerialSupported()) {
      const msg = 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera, or connect via WebSocket bridge.';
      this.setStatus('error', msg);
      throw new Error(msg);
    }

    try {
      await this.disconnect();
      this.setStatus('connecting', 'Requesting serial port permission...');

      // Browser pop-up for user to pick USB or Bluetooth COM port
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate });

      this.serialPort = port;
      this.connectionType = 'web-serial';
      this.portInfo = `Serial @ ${baudRate} baud`;
      this.keepReading = true;
      this.isStreamingActive = true;
      this.setStatus('connected', `Connected to serial port (${baudRate} baud)`);
      this.notifyLog(`[SYSTEM] Connected to serial port at ${baudRate} baud.`);

      // Read loop with line decoding
      this.readSerialStream(port);
    } catch (err: any) {
      console.error('Serial connection error:', err);
      if (err.name === 'NotFoundError') {
        this.setStatus('disconnected', 'No serial port selected.');
      } else {
        this.setStatus('error', err.message || 'Failed to open serial port.');
      }
      throw err;
    }
  }

  private async readSerialStream(port: any) {
    let lineBuffer = '';

    while (port.readable && this.keepReading) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      this.serialReader = reader;

      try {
        while (this.keepReading) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            lineBuffer += value;
            const lines = lineBuffer.split(/\r?\n/);
            lineBuffer = lines.pop() || '';

            for (const line of lines) {
              this.handleIncomingLine(line);
              this.relayToBridge(line);
            }
          }
        }
      } catch (err: any) {
        console.error('Serial read error:', err);
        this.notifyLog(`[ERROR] Serial read error: ${err.message}`);
      } finally {
        reader.releaseLock();
      }

      await readableStreamClosed.catch(() => {});
    }

    if (this.status === 'connected') {
      this.setStatus('disconnected', 'Serial port closed.');
    }
  }

  /**
   * Relay active serial data to local WebSocket bridge so mobile devices on the LAN can receive it
   */
  private bridgeRelayWs: WebSocket | null = null;

  private initBridgeRelay() {
    try {
      const bridgeUrl = `ws://${(typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost'}:3001`;
      const ws = new WebSocket(bridgeUrl);
      this.bridgeRelayWs = ws;
      ws.onopen = () => {
        this.notifyLog(`[RELAY] Connected to LAN Bridge (${bridgeUrl})`);
      };
      ws.onclose = () => {
        this.bridgeRelayWs = null;
      };
      ws.onerror = () => {
        this.bridgeRelayWs = null;
      };
    } catch {
      this.bridgeRelayWs = null;
    }
  }

  private relayToBridge(line: string) {
    if (this.bridgeRelayWs && this.bridgeRelayWs.readyState === WebSocket.OPEN) {
      try {
        this.bridgeRelayWs.send(line);
      } catch {}
    }
  }

  public getDefaultWebSocketUrl(): string {
    const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
    return `ws://${host}:3001`;
  }

  /**
   * Smart auto-connect:
   * On Desktop Chrome/Edge: Connects via Web Serial (USB/Bluetooth COM).
   * On Mobile (Phone/Tablet): Automatically connects to LAN WebSocket Bridge (ws://host:3001).
   */
  public async autoConnect(): Promise<'web-serial' | 'websocket'> {
    if (this.isWebSerialSupported()) {
      await this.connectWebSerial(115200);
      this.initBridgeRelay();
      return 'web-serial';
    } else {
      const url = this.getDefaultWebSocketUrl();
      await this.connectWebSocket(url);
      return 'websocket';
    }
  }

  /**
   * Connect via WebSocket Bridge (ws://<host>:3001)
   */
  public async connectWebSocket(url?: string): Promise<void> {
    const targetUrl = url || this.getDefaultWebSocketUrl();
    await this.disconnect();
    this.setStatus('connecting', `Connecting to WebSocket bridge at ${targetUrl}...`);

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(targetUrl);
        this.websocket = ws;

        ws.onopen = () => {
          this.connectionType = 'websocket';
          this.portInfo = `LAN Bridge (${targetUrl})`;
          this.isStreamingActive = true;
          this.setStatus('connected', `Connected to LAN Bridge (${targetUrl})`);
          this.notifyLog(`[SYSTEM] Connected to WebSocket bridge at ${targetUrl}`);
          resolve();
        };

        ws.onmessage = (event) => {
          const text = typeof event.data === 'string' ? event.data : '';
          const lines = text.split(/\r?\n/);
          for (const line of lines) {
            this.handleIncomingLine(line);
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket bridge error:', event);
          this.setStatus('error', `Cannot reach WebSocket bridge at ${targetUrl}`);
          reject(new Error(`Cannot reach WebSocket bridge at ${targetUrl}. Is the bridge server running?`));
        };

        ws.onclose = () => {
          if (this.connectionType === 'websocket') {
            this.setStatus('disconnected', 'WebSocket bridge disconnected.');
            this.notifyLog('[SYSTEM] WebSocket bridge connection closed.');
          }
        };
      } catch (err: any) {
        this.setStatus('error', err.message || 'WebSocket connection error');
        reject(err);
      }
    });
  }

  /**
   * Hardware Simulation Mode
   */
  public startSimulation(gasHazard = false): void {
    this.disconnect();

    this.connectionType = 'simulation';
    this.portInfo = 'Virtual ESP32 Simulator';
    this.isStreamingActive = true;
    this.setStatus('connected', 'Running Virtual ESP32 Simulator (1s interval)');
    this.notifyLog('[SYSTEM] Started Virtual ESP32 Simulator with telemetry interval 1000ms.');

    let simTick = 0;
    this.simulationInterval = setInterval(() => {
      // If paused/off, skip sending telemetry
      if (!this.isStreamingActive) {
        return;
      }

      simTick++;
      const sound1 = 300 + Math.round(Math.sin(simTick * 0.3) * 120 + Math.random() * 80);
      const sound2 = 450 + Math.round(Math.sin(simTick * 0.5) * 260 + Math.random() * 150);
      const pulse = 1800 + Math.round(Math.sin(simTick * 0.8) * 350 + Math.random() * 100);
      const gasStatus = gasHazard || (simTick % 40 >= 35) ? 'Alert' : 'Safe';

      const simulatedPacket = `M1:${sound1} M2:${sound2} Gas:${gasStatus} HB:${pulse}`;
      this.handleIncomingLine(simulatedPacket);
    }, 1000);
  }

  /**
   * Disconnect any active connection
   */
  public async disconnect(): Promise<void> {
    this.keepReading = false;

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.websocket) {
      try {
        this.websocket.close();
      } catch {}
      this.websocket = null;
    }

    if (this.serialReader) {
      try {
        await this.serialReader.cancel();
      } catch {}
      this.serialReader = null;
    }

    if (this.serialPort) {
      try {
        await this.serialPort.close();
      } catch {}
      this.serialPort = null;
    }

    this.connectionType = null;
    this.portInfo = '';
    this.setStatus('disconnected', 'Disconnected.');
  }
}

export const esp32Service = new ESP32Service();
