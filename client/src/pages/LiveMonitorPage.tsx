import { useEffect, useRef, useState, useCallback } from "react";
import {
  Activity,
  ArrowLeft,
  Bluetooth,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Heart,
  PauseCircle,
  Play,
  Power,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  Usb,
  Volume2,
  Wind
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Link } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { exportToPDF, type SessionData } from "../utils/pdf-export";
import { simplePdfExport } from "../utils/simple-pdf-export";
import { esp32Service, ESP32Telemetry, ConnectionStatus } from "../services/esp32-service";

export function LiveMonitorPage() {
  // ESP32 Connection states
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(esp32Service.getStatus());
  const [portInfo, setPortInfo] = useState<string>(esp32Service.getPortInfo());
  const [showTerminal, setShowTerminal] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [autoScrollTerminal, setAutoScrollTerminal] = useState(true);
  const [isStreaming, setIsStreaming] = useState(esp32Service.isStreaming());
  const [customCommand, setCustomCommand] = useState("");

  // Latest Telemetry values
  const [currentTelemetry, setCurrentTelemetry] = useState<ESP32Telemetry>({
    sound1: 0,
    sound2: 0,
    gasStatus: "Safe",
    pulse: 0,
    wheezingLevel: 0,
    heartRateBpm: 72,
    timestamp: new Date(),
    timeString: new Date().toLocaleTimeString(),
    rawPacket: "M1:0 M2:0 Gas:Safe HB:0"
  });

  // Session & Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);

  // Data collections for display and export
  const [displayData, setDisplayData] = useState<SessionData[]>([]);
  const [completeSessionData, setCompleteSessionData] = useState<SessionData[]>([]);

  // Oscilloscope channel mode
  const [waveformChannel, setWaveformChannel] = useState<'sound2' | 'pulse' | 'dual'>('sound2');

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const durationTimerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // Oscilloscope drawing state
  const waveBufferRef = useRef<number[]>(new Array(200).fill(128));
  const wavePhaseRef = useRef<number>(0);

  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine Wheezing Severity
  const getWheezeSeverity = (level: number) => {
    if (level < 25) return { label: "Normal", color: "text-emerald-500", bg: "bg-emerald-500" };
    if (level < 50) return { label: "Mild Wheezing", color: "text-amber-500", bg: "bg-amber-500" };
    if (level < 75) return { label: "Moderate Wheezing", color: "text-orange-500", bg: "bg-orange-500" };
    return { label: "Severe Wheezing", color: "text-red-500", bg: "bg-red-500" };
  };

  // Connect via Web Serial (Desktop) or WebSocket LAN bridge (Mobile)
  const handleConnectSerial = async () => {
    try {
      const mode = await esp32Service.autoConnect();
      if (mode === 'websocket') {
        alert("Connected to PC's Live Telemetry Bridge via WebSocket!");
      }
    } catch (err: any) {
      if (err.name !== "NotFoundError") {
        const isMobile = !esp32Service.isWebSerialSupported();
        if (isMobile) {
          const trySim = confirm(
            `Mobile Browser Detected:\n\nPhones don't have direct USB COM ports.\nCould not connect to PC LAN Bridge (${esp32Service.getDefaultWebSocketUrl()}).\n\nWould you like to start Hardware Simulator mode on your phone instead?`
          );
          if (trySim) {
            esp32Service.startSimulation();
          }
        } else {
          alert(`Connection Error: ${err.message}`);
        }
      }
    }
  };

  // Connect via Simulator
  const handleStartSimulation = () => {
    esp32Service.startSimulation();
  };

  // Disconnect
  const handleDisconnect = async () => {
    await esp32Service.disconnect();
  };

  // Turn ON / OFF streaming remotely
  const handleToggleStream = async () => {
    await esp32Service.toggleStreaming();
  };

  // Send command to ESP32
  const handleSendCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    await esp32Service.sendCommand(cmd);
    setCustomCommand("");
  };

  // Start / Resume session recording
  const startRecording = () => {
    if (!sessionActive) {
      setCompleteSessionData([]);
      setDisplayData([]);
      setSessionDuration(0);
      setRecordingStartTime(new Date());
      setSessionActive(true);
    }
    setIsRecording(true);

    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
  };

  // Pause session recording
  const pauseRecording = () => {
    setIsRecording(false);
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  // Reset entire session
  const resetSession = () => {
    pauseRecording();
    setSessionActive(false);
    setCompleteSessionData([]);
    setDisplayData([]);
    setSessionDuration(0);
    setRecordingStartTime(null);
  };

  // Handle incoming telemetry from ESP32 service
  const handleNewTelemetry = useCallback((data: ESP32Telemetry) => {
    setCurrentTelemetry(data);

    // Update waveform buffer with continuous synthetic wave influenced by raw ADC
    const buffer = waveBufferRef.current;
    buffer.shift();
    
    // Choose wave value based on selected channel
    let waveVal = 128;
    wavePhaseRef.current += 0.25;
    const phase = wavePhaseRef.current;

    if (waveformChannel === 'sound2') {
      const amp = Math.min(100, (data.sound2 / 4095) * 110 + 10);
      waveVal = 128 + Math.sin(phase) * amp + (Math.sin(phase * 2.8) * (amp * 0.4));
    } else if (waveformChannel === 'pulse') {
      // ECG / PPG peak pattern
      const p = phase % (Math.PI * 2);
      let spike = 0;
      if (p > 1.2 && p < 1.6) {
        spike = 80;
      } else if (p > 1.6 && p < 2.0) {
        spike = -30;
      }
      const amp = Math.min(70, (data.pulse / 4095) * 60 + 20);
      waveVal = 128 + spike * (amp / 50) + Math.sin(phase * 0.5) * 10;
    } else {
      // Dual overlay
      const s1 = (data.sound1 / 4095) * 60;
      const s2 = (data.sound2 / 4095) * 60;
      waveVal = 128 + Math.sin(phase) * s2 + Math.cos(phase * 1.5) * s1;
    }

    buffer.push(Math.max(10, Math.min(245, waveVal)));

    // If recording is active, append to session collections
    if (isRecording) {
      const point: SessionData = {
        time: data.timeString,
        level: data.wheezingLevel,
        sound1: data.sound1,
        sound2: data.sound2,
        pulse: data.pulse,
        heartRate: data.heartRateBpm,
        gasStatus: data.gasStatus
      };

      setCompleteSessionData((prev) => [...prev, point]);
      setDisplayData((prev) => {
        const next = [...prev, point];
        return next.length > 25 ? next.slice(next.length - 25) : next;
      });
    }
  }, [isRecording, waveformChannel]);

  // Subscribe to service events
  useEffect(() => {
    const unsubStatus = esp32Service.onStatus((status) => {
      setConnectionStatus(status);
      setPortInfo(esp32Service.getPortInfo());
    });

    const unsubTelemetry = esp32Service.onTelemetry(handleNewTelemetry);

    const unsubLogs = esp32Service.onRawLog((line) => {
      setSerialLogs((prev) => {
        const next = [...prev, `[${new Date().toLocaleTimeString()}] ${line}`];
        return next.length > 150 ? next.slice(next.length - 150) : next;
      });
    });

    const unsubStreaming = esp32Service.onStreamingState((streaming) => {
      setIsStreaming(streaming);
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubLogs();
      unsubStreaming();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [handleNewTelemetry]);

  // Auto-scroll terminal log internally without affecting page scroll
  useEffect(() => {
    if (autoScrollTerminal && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [serialLogs, autoScrollTerminal]);

  // Canvas oscilloscope render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;
      const buffer = waveBufferRef.current;

      // Dark oscilloscope display background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      // Grid background
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";

      // Horizontal lines
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Center reference line
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Trace line color based on alert / wheeze
      const isGasAlert = currentTelemetry.gasStatus === 'Alert';
      const isSevere = currentTelemetry.wheezingLevel > 60;

      let traceColor = "#22c55e"; // emerald green
      if (isGasAlert || isSevere) {
        traceColor = "#ef4444"; // red
      } else if (currentTelemetry.wheezingLevel > 35) {
        traceColor = "#f59e0b"; // amber
      } else if (waveformChannel === 'pulse') {
        traceColor = "#38bdf8"; // sky blue for pulse
      }

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = traceColor;
      ctx.shadowBlur = 12;
      ctx.shadowColor = traceColor;

      ctx.beginPath();
      const step = width / buffer.length;

      for (let i = 0; i < buffer.length; i++) {
        const val = buffer[i];
        const y = (val / 255) * height;
        const x = i * step;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset glow

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentTelemetry.gasStatus, currentTelemetry.wheezingLevel, waveformChannel]);

  // PDF Export
  const handleExportData = async () => {
    try {
      const selectedPatient = {
        id: 1,
        name: "John Doe",
        age: 45,
        gender: "Male",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        address: "123 Main St, Anytown, USA",
        medicalHistory: "Asthma, Occupational Air Exposure",
        lastSession: recordingStartTime ? recordingStartTime.toLocaleString() : new Date().toLocaleString(),
        nextAppointment: "Jun 15, 2026",
        status: currentTelemetry.gasStatus === 'Alert' ? 'Hazard Alert' : 'Monitored',
        wheezingLevel: Math.round(currentTelemetry.wheezingLevel),
        respiratoryRate: 16,
        oxygenLevel: 98,
        medications: ["Albuterol", "Fluticasone"],
        notes: `Telemetry captured via ESP32 (${portInfo || 'Live Stream'}). Gas detector status: ${currentTelemetry.gasStatus}.`
      };

      const dataToExport = completeSessionData.length > 0
        ? completeSessionData
        : [{
            time: new Date().toLocaleTimeString(),
            level: currentTelemetry.wheezingLevel,
            sound1: currentTelemetry.sound1,
            sound2: currentTelemetry.sound2,
            pulse: currentTelemetry.pulse,
            heartRate: currentTelemetry.heartRateBpm,
            gasStatus: currentTelemetry.gasStatus
          }];

      const gasAlerts = completeSessionData.filter(d => d.gasStatus === 'Alert').length;
      const avgPulse = completeSessionData.length > 0
        ? Math.round(completeSessionData.reduce((acc, d) => acc + (d.heartRate || 72), 0) / completeSessionData.length)
        : currentTelemetry.heartRateBpm;

      const sessionInfo = {
        sessionStart: recordingStartTime ? recordingStartTime.toLocaleString() : new Date().toLocaleString(),
        sessionDuration: formatDuration(sessionDuration),
        dataPointsCount: dataToExport.length,
        averageWheezingLevel: Math.round(
          dataToExport.reduce((sum, point) => sum + point.level, 0) / dataToExport.length
        ),
        maxWheezingLevel: Math.round(
          Math.max(...dataToExport.map((point) => point.level), 0)
        ),
        currentStatus: isRecording ? "Active" : "Completed",
        averageHeartRate: avgPulse,
        gasAlertsDetected: gasAlerts,
        sourceDevice: `ESP32 (${portInfo || 'Active'})`
      };

      try {
        await exportToPDF(selectedPatient.id, selectedPatient, dataToExport, chartRef, sessionInfo);
      } catch (pdfErr) {
        console.warn("Advanced PDF failed, fallback to simple export", pdfErr);
        simplePdfExport(selectedPatient, dataToExport, sessionInfo);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("An error occurred during report export.");
    }
  };

  const wheezeSeverity = getWheezeSeverity(currentTelemetry.wheezingLevel);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      {/* Top Header & Connection Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Real-Time ESP32 Monitor</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Live 115200 Baud
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Dual Acoustic Sensors (M1/M2) • Heart Rate Pulse (HB) • Gas Hazard Detector (MQ)
            </p>
          </div>
        </div>

        {/* Hardware Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {connectionStatus !== 'connected' ? (
            <>
              <Button
                onClick={handleConnectSerial}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm text-xs md:text-sm"
              >
                <Usb className="h-4 w-4 mr-2" />
                <Bluetooth className="h-4 w-4 mr-1.5" />
                Connect ESP32 (USB / BT)
              </Button>
              <Button
                variant="outline"
                onClick={handleStartSimulation}
                className="text-xs md:text-sm"
              >
                <Activity className="h-4 w-4 mr-1.5 text-primary" />
                Simulate ESP32
              </Button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleToggleStream}
                className={`text-xs font-semibold shadow-sm transition-all ${
                  isStreaming
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                }`}
                title={isStreaming ? "Click to pause ESP32 telemetry (send OFF)" : "Click to resume ESP32 telemetry (send ON)"}
              >
                <Power className="h-3.5 w-3.5 mr-1.5" />
                {isStreaming ? 'ESP32 Stream: ON' : 'ESP32 Stream: OFF (Paused)'}
              </Button>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                <span className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                <span className="font-mono text-[11px]">{portInfo || 'ESP32'}</span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                className="text-xs"
              >
                Disconnect
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
            className={`text-xs ${showTerminal ? 'bg-accent' : ''}`}
          >
            <Terminal className="h-3.5 w-3.5 mr-1.5" />
            Raw Feed
            {showTerminal ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Critical Gas Alert Banner (when MQ detects hazardous gas) */}
      {currentTelemetry.gasStatus === 'Alert' && (
        <Alert variant="destructive" className="border-red-600 bg-red-950/40 text-red-100 animate-pulse shadow-lg">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-base font-bold text-red-200">
            ⚠️ ENVIRONMENTAL GAS HAZARD DETECTED! (MQ D0: LOW)
          </AlertTitle>
          <AlertDescription className="text-sm text-red-300">
            The digital MQ gas detector on GPIO 26 has triggered an Alert state. Ensure the patient is in a well-ventilated area away from toxic fumes, smoke, or combustible gases.
          </AlertDescription>
        </Alert>
      )}

      {/* Real-Time Telemetry 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sound 2 / Wheezing Level (GPIO 13) */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Wind className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sound 2 • Wheeze Index
              </CardTitle>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${wheezeSeverity.bg}`}>
                {wheezeSeverity.label}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold">{currentTelemetry.wheezingLevel}%</div>
              <div className="text-xs text-slate-400 font-mono">
                ADC: <span className="text-emerald-400 font-bold">{currentTelemetry.sound2}</span> / 4095
              </div>
            </div>
            <Progress
              value={currentTelemetry.wheezingLevel}
              className="h-2 bg-slate-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>GPIO 13 (Tracheal Mic)</span>
              <span>Baseline: 0-4095</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Sound 1 (Ambient / Reference Mic - GPIO 12) */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Volume2 className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sound 1 • Reference Mic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold">{currentTelemetry.sound1}</div>
              <div className="text-xs text-slate-400 font-mono">
                {Math.round((currentTelemetry.sound1 / 4095) * 100)}% scale
              </div>
            </div>
            <Progress
              value={Math.round((currentTelemetry.sound1 / 4095) * 100)}
              className="h-2 bg-slate-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>GPIO 12 (Ambient Sensor)</span>
              <span>Differential Base</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Heart Rate & Pulse (GPIO 14 - HB) */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Heart className="h-16 w-16 text-rose-500" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pulse & Heart Rate
              </CardTitle>
              <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold flex items-baseline gap-1">
                {currentTelemetry.heartRateBpm}
                <span className="text-xs font-normal text-slate-400">BPM</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                HB ADC: <span className="text-sky-400 font-bold">{currentTelemetry.pulse}</span>
              </div>
            </div>
            <Progress
              value={Math.min(100, Math.round((currentTelemetry.pulse / 4095) * 100))}
              className="h-2 bg-slate-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>GPIO 14 (Analog PPG)</span>
              <span>Resting: 60-100 BPM</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: MQ Gas Detector (GPIO 26 - Gas) */}
        <Card className={`border-0 shadow-md text-white relative overflow-hidden transition-all ${
          currentTelemetry.gasStatus === 'Alert'
            ? 'bg-gradient-to-br from-red-900 to-red-950 border border-red-500 animate-pulse'
            : 'bg-gradient-to-br from-slate-900 to-slate-800'
        }`}>
          <div className="absolute top-0 right-0 p-3 opacity-10">
            {currentTelemetry.gasStatus === 'Alert' ? (
              <ShieldAlert className="h-16 w-16 text-red-400" />
            ) : (
              <ShieldCheck className="h-16 w-16 text-emerald-400" />
            )}
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Air Safety • MQ Gas
              </CardTitle>
              {currentTelemetry.gasStatus === 'Alert' ? (
                <ShieldAlert className="h-4 w-4 text-red-400" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className={`text-3xl font-extrabold ${
                currentTelemetry.gasStatus === 'Alert' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {currentTelemetry.gasStatus.toUpperCase()}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {currentTelemetry.gasStatus === 'Alert' ? 'LOW (Hazard)' : 'HIGH (Normal)'}
              </div>
            </div>
            <div className={`h-2 rounded-full w-full ${
              currentTelemetry.gasStatus === 'Alert' ? 'bg-red-500' : 'bg-emerald-500'
            }`} />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>GPIO 26 (Digital Sensor)</span>
              <span>Threshold Trigger</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Serial Terminal Drawer (Collapsible) */}
      {showTerminal && (
        <Card className="border bg-slate-950 text-slate-100 font-mono shadow-xl">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">ESP32 Live Serial Terminal</span>
              <span className="text-slate-500">({serialLogs.length} packets received)</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={autoScrollTerminal}
                  onChange={(e) => setAutoScrollTerminal(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700"
                />
                Auto-scroll
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSerialLogs([])}
                className="h-7 text-xs text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div ref={terminalContainerRef} className="h-44 overflow-y-auto space-y-1 text-xs select-text">
              {serialLogs.length === 0 ? (
                <div className="text-slate-500 italic py-6 text-center">
                  Waiting for serial packets from ESP32... Click "Connect ESP32" or "Simulate ESP32" above.
                </div>
              ) : (
                serialLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 font-mono hover:bg-slate-900 px-1 py-0.5 rounded">
                    <span className="text-slate-500">{idx + 1}</span>
                    <span className={log.includes("Alert") ? "text-red-400 font-bold" : "text-emerald-300"}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          {/* Terminal Command Controls */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-semibold mr-1">Controls:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendCommand('ON')}
                className="h-7 text-xs bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60"
              >
                Send ON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendCommand('OFF')}
                className="h-7 text-xs bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/60"
              >
                Send OFF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendCommand('TOGGLE')}
                className="h-7 text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              >
                TOGGLE
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendCommand('STATUS')}
                className="h-7 text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              >
                STATUS
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommand(customCommand);
              }}
              className="flex items-center gap-1.5 flex-1 max-w-xs"
            >
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="Custom command (e.g. ON)..."
                className="flex-1 h-7 px-2 text-xs rounded bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" className="h-7 px-2.5 text-xs bg-primary hover:bg-primary/90">
                <Send className="h-3 w-3 mr-1" /> Send
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Main Visualizer & Trend Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Oscilloscope Waveform & Channel Select (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <div>
                    <CardTitle className="text-base text-white">Live Telemetry Oscilloscope</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      High-fidelity acoustic & bio-signal waveform
                    </CardDescription>
                  </div>
                </div>

                {/* Channel Selector */}
                <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
                  <button
                    onClick={() => setWaveformChannel('sound2')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      waveformChannel === 'sound2' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sound 2 (Wheeze)
                  </button>
                  <button
                    onClick={() => setWaveformChannel('pulse')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      waveformChannel === 'pulse' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pulse (HB)
                  </button>
                  <button
                    onClick={() => setWaveformChannel('dual')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      waveformChannel === 'dual' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dual Mic (M1+M2)
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="aspect-[2.2/1] bg-[#090d16] rounded-xl overflow-hidden border border-slate-800 shadow-inner relative">
                <canvas ref={canvasRef} width={800} height={340} className="w-full h-full block" />
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono flex gap-4">
                  <span>SWEEP: REAL-TIME</span>
                  <span>CAL: 12-BIT ADC</span>
                  <span>PACKET: {currentTelemetry.rawPacket}</span>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <Button
                      size="default"
                      onClick={pauseRecording}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5"
                    >
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Pause Recording
                    </Button>
                  ) : (
                    <Button
                      size="default"
                      onClick={startRecording}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {sessionActive ? "Resume Recording" : "Start Session Recording"}
                    </Button>
                  )}

                  {sessionActive && (
                    <Button
                      variant="outline"
                      size="default"
                      onClick={resetSession}
                      className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
                    >
                      Reset Session
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Session Duration</div>
                    <div className="text-lg font-mono font-bold text-white">
                      {formatDuration(sessionDuration)}
                    </div>
                  </div>
                  {isRecording && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Trend Chart */}
          <Card className="border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Real-Time Telemetry Trend</CardTitle>
                  <CardDescription className="text-xs">
                    Continuous monitoring timeline ({displayData.length} active data points)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]" ref={chartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => {
                        const parts = val.split(":");
                        return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : val;
                      }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as SessionData;
                          return (
                            <div className="bg-slate-900 border border-slate-700 text-slate-100 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                              <p className="font-bold text-slate-300">{label}</p>
                              <p className="text-emerald-400">Wheezing Index: {data.level}%</p>
                              <p className="text-sky-400">Pulse (HB): {data.pulse}</p>
                              <p className="text-indigo-400">Sound 1 (M1): {data.sound1}</p>
                              <p className="text-purple-400">Sound 2 (M2): {data.sound2}</p>
                              <p className={data.gasStatus === 'Alert' ? 'text-red-400 font-bold' : 'text-slate-400'}>
                                Gas Status: {data.gasStatus}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      name="Wheezing Level (%)"
                      dataKey="level"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      name="Pulse (scaled %)"
                      dataKey={(d) => Math.round(((d.pulse || 0) / 4095) * 100)}
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clinical Status, Patient Summary & Report Export */}
        <div className="space-y-4">
          {/* Patient Card */}
          <Card className="border shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Patient Monitored</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  ID: #1042
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold">John Doe (45 M)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span>Mild Asthma / Wheeze</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AeroPulse Link:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-medium">
                  {portInfo || 'ESP32_Sensor'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Diagnostic Overview */}
          <Card className="border shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Clinical Telemetry Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current Wheezing:</span>
                  <span className="font-bold">{currentTelemetry.wheezingLevel}%</span>
                </div>
                <Progress value={currentTelemetry.wheezingLevel} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Heart Rate (Pulse):</span>
                  <span className="font-bold text-rose-500">{currentTelemetry.heartRateBpm} BPM</span>
                </div>
                <Progress value={Math.min(100, (currentTelemetry.heartRateBpm / 140) * 100)} className="h-1.5 bg-rose-100 dark:bg-rose-950" />
              </div>

              <div className="pt-2 border-t space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Points Logged:</span>
                  <span className="font-mono font-medium">{completeSessionData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Wheezing:</span>
                  <span className="font-mono font-medium">
                    {completeSessionData.length > 0
                      ? Math.round(completeSessionData.reduce((acc, d) => acc + d.level, 0) / completeSessionData.length)
                      : currentTelemetry.wheezingLevel}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Air Safety (MQ):</span>
                  <span className={`font-semibold ${currentTelemetry.gasStatus === 'Alert' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {currentTelemetry.gasStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export & Actions */}
          <Card className="border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export & Actions</CardTitle>
              <CardDescription className="text-xs">
                Generate clinical reports with ESP32 sensor telemetry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="default"
                onClick={handleExportData}
                className="w-full flex items-center justify-center bg-primary hover:bg-primary/90"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export Clinical PDF Report
              </Button>

              {completeSessionData.length > 0 && (
                <a
                  href={`data:text/csv;charset=utf-8,Time,Sound1_M1,Sound2_M2,Gas_Status,Pulse_HB,Wheezing_Level,HeartRate_BPM\n${
                    completeSessionData.map(
                      (p) => `${p.time},${p.sound1 || 0},${p.sound2 || 0},${p.gasStatus || 'Safe'},${p.pulse || 0},${p.level},${p.heartRate || 72}`
                    ).join("\n")
                  }`}
                  download={`aeropulse_esp32_telemetry_${new Date().toISOString().split("T")[0]}.csv`}
                  className="flex items-center justify-center w-full py-2 px-3 border rounded-lg text-xs font-medium hover:bg-accent transition-colors"
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Download Full CSV Telemetry ({completeSessionData.length} rows)
                </a>
              )}

              <Button
                variant="outline"
                onClick={() => alert("Session telemetry sent to doctor's clinical inbox!")}
                className="w-full text-xs"
              >
                <Share2 className="mr-2 h-3.5 w-3.5" />
                Share with Pulmonologist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
