// AeroPulse ESP32 Auto-Connecting Multi-Device Telemetry Bridge
// Auto-detects ESP32 COM port (e.g. Silicon Labs CP210x / CH340 on COM7)
// and broadcasts live telemetry to all connected phones, tablets, and PCs.

const http = require('http');
const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const PORT = process.env.BRIDGE_PORT || 3001;
const BAUD_RATE = 115200;
let TARGET_PORT = process.env.COM_PORT || null;

console.log('==================================================');
console.log('       AeroPulse Real-Time Telemetry Bridge       ');
console.log('==================================================');
console.log(`WebSocket Server: ws://0.0.0.0:${PORT}`);
console.log(`Baud Rate: ${BAUD_RATE}`);
console.log('==================================================');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AeroPulse ESP32 Bridge is running on port ' + PORT + '\n');
});

const wss = new WebSocket.Server({ server });
const clients = new Set();
let latestTelemetryPacket = null;

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  clients.add(ws);
  console.log(`[Bridge] Client connected from ${clientIp}. Total active clients: ${clients.size}`);
  
  ws.send('[SYSTEM] Connected to AeroPulse ESP32 Bridge');
  
  // Immediately send the latest packet if available
  if (latestTelemetryPacket) {
    ws.send(latestTelemetryPacket);
  }

  ws.on('message', (message) => {
    const text = message.toString().trim();
    console.log(`[Command from Client -> ESP32] ${text}`);
    // Forward commands (e.g. ON, OFF) to the ESP32
    if (activePort && activePort.isOpen) {
      activePort.write(text + '\n');
    }
    // Broadcast to other connected clients
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[Bridge] Client disconnected. Total active clients: ${clients.size}`);
  });
});

function broadcast(data) {
  latestTelemetryPacket = data;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

let activePort = null;
let isConnecting = false;

async function findESP32Port() {
  if (TARGET_PORT) return TARGET_PORT;
  try {
    const ports = await SerialPort.list();
    for (const p of ports) {
      const desc = `${p.friendlyName || ''} ${p.manufacturer || ''} ${p.description || ''}`.toLowerCase();
      if (desc.includes('cp210') || desc.includes('ch340') || desc.includes('uart') || desc.includes('silicon labs')) {
        return p.path;
      }
    }
    const com7 = ports.find((p) => p.path === 'COM7');
    if (com7) return 'COM7';
    if (ports.length > 0) return ports[0].path;
  } catch (err) {
    console.error('[Bridge] Error listing ports:', err.message);
  }
  return 'COM7';
}

async function connectToESP32() {
  if (isConnecting || (activePort && activePort.isOpen)) return;
  isConnecting = true;

  const portPath = await findESP32Port();
  if (!portPath) {
    console.log('[Bridge] No serial port found. Retrying in 3s...');
    isConnecting = false;
    setTimeout(connectToESP32, 3000);
    return;
  }

  console.log(`[Bridge] Attempting connection to ESP32 on ${portPath} @ ${BAUD_RATE} baud...`);

  try {
    const port = new SerialPort({
      path: portPath,
      baudRate: BAUD_RATE,
      autoOpen: false,
      rtscts: false,
    });

    port.open((err) => {
      isConnecting = false;
      if (err) {
        if (err.message.includes('Access denied')) {
          console.log(`\n⚠️  [LOCKED] Port ${portPath} is busy/locked by another program (e.g. Arduino IDE Serial Monitor).`);
          console.log(`   👉 PLEASE CLOSE THE SERIAL MONITOR in Arduino IDE so AeroPulse can connect.`);
          console.log(`   Will retry automatically in 3 seconds...\n`);
        } else {
          console.error(`[Bridge] Port error on ${portPath}:`, err.message);
        }
        setTimeout(connectToESP32, 3000);
        return;
      }

      console.log(`\n✅ [CONNECTED] AeroPulse Bridge is streaming from ESP32 on ${portPath}!`);
      activePort = port;

      // Release DTR / RTS so ESP32 CPU is not held in reset
      port.set({ dtr: false, rts: false }, () => {
        // Send ON command to kickstart streaming if waiting
        port.write('ON\n');
      });

      // Split on newline (\n) which handles both \r\n and \n
      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.on('data', (line) => {
        const trimmed = line.trim();
        if (trimmed) {
          console.log(`[ESP32 -> Network] ${trimmed}`);
          broadcast(trimmed);
        }
      });

      port.on('close', () => {
        console.log(`[Bridge] Port ${portPath} was closed. Reconnecting in 3s...`);
        activePort = null;
        setTimeout(connectToESP32, 3000);
      });

      port.on('error', (err) => {
        console.error(`[Bridge] Port error: ${err.message}`);
      });
    });
  } catch (err) {
    isConnecting = false;
    console.error(`[Bridge] Connection exception: ${err.message}`);
    setTimeout(connectToESP32, 3000);
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Bridge Server] Ready on http://0.0.0.0:${PORT}`);
  connectToESP32();
});
