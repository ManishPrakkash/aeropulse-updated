import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Download, Mic, PauseCircle, Share2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

export function LiveMonitorPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [wheezingLevel, setWheezingLevel] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [historicalData, setHistoricalData] = useState<{ time: string; level: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsRecording(true);
      setRecordingStartTime(new Date());
      drawWaveform();

      // Simulate wheezing detection
      const interval = setInterval(() => {
        const newLevel = Math.random() * 100;
        setWheezingLevel(newLevel);
        
        // Add to historical data
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setHistoricalData(prev => {
          const newData = [...prev, { time: timeString, level: newLevel }];
          // Keep only the last 20 data points
          if (newData.length > 20) {
            return newData.slice(newData.length - 20);
          }
          return newData;
        });
      }, 1000);

      // Update session duration
      const durationTimer = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      timerRef.current = window.setInterval(interval);
      return () => {
        clearInterval(interval);
        clearInterval(durationTimer);
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "rgb(15, 23, 42)"; // Dark blue background
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      
      // Horizontal grid lines
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = wheezingLevel > 50 ? "#ef4444" : "#22c55e";
      ctx.beginPath();

      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      // Add glow effect for high wheezing levels
      if (wheezingLevel > 50) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ef4444";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportData = () => {
    // In a real app, this would export the session data
    alert("Session data exported successfully!");
  };

  const handleShareSession = () => {
    // In a real app, this would share the session with healthcare providers
    alert("Session shared with healthcare provider!");
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Live Breathing Monitor</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Respiratory Waveform</CardTitle>
                {isRecording && (
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2"></span>
                    <span className="text-white text-sm">Recording: {formatDuration(sessionDuration)}</span>
                  </div>
                )}
              </div>
              <CardDescription className="text-slate-400">Real-time breathing pattern visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[2/1] bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
                <canvas ref={canvasRef} width={800} height={300} className="w-full h-full" />
              </div>
              <div className="flex justify-center mt-4">
                <Button 
                  size="lg" 
                  onClick={isRecording ? stopRecording : startRecording} 
                  className={`w-40 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {isRecording ? (
                    <>
                      <PauseCircle className="mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Wheezing Level</span>
                    <span className="font-medium">{Math.round(wheezingLevel)}%</span>
                  </div>
                  <Progress value={wheezingLevel} className="h-2" 
                    style={{
                      background: 'linear-gradient(to right, #22c55e, #eab308, #ef4444)',
                      maskImage: `linear-gradient(to right, #000 ${wheezingLevel}%, transparent ${wheezingLevel}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Normal</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
                
                {wheezingLevel > 50 && (
                  <Alert variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>High wheezing levels detected. Please check breathing pattern.</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="outline" onClick={handleExportData} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={handleShareSession} className="flex items-center">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Session Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }} 
                      tickFormatter={(value) => value.split(':')[0] + ':' + value.split(':')[1]}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="level" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
