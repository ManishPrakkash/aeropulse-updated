import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Download, FileText, Mic, PauseCircle, Share2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { exportToPDF, generateNaturalWheezingLevel, type SessionData } from "../utils/pdf-export";
import { simplePdfExport } from "../utils/simple-pdf-export";

export function LiveMonitorPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [wheezingLevel, setWheezingLevel] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);

  // Split historical data into two states:
  // - displayData: the data shown in the chart (limited to last 20 points for better visualization)
  // - completeSessionData: all data collected during the session (used for PDF export)
  const [displayData, setDisplayData] = useState<SessionData[]>([]);
  const [completeSessionData, setCompleteSessionData] = useState<SessionData[]>([]);

  const [baseWheezingLevel, setBaseWheezingLevel] = useState(30); // Base level for natural fluctuations
  const [sessionActive, setSessionActive] = useState(false); // Track if a session has been started

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);

  const startRecording = async () => {
    try {
      // If starting a new session (not resuming), clear previous data
      if (!sessionActive) {
        setCompleteSessionData([]);
        setDisplayData([]);
        setSessionDuration(0);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsRecording(true);
      setSessionActive(true); // Mark that a session is active

      // Only set the start time if this is a new session
      if (!recordingStartTime) {
        setRecordingStartTime(new Date());
      }

      drawWaveform();

      // Simulate wheezing detection with more natural fluctuations
      const interval = setInterval(() => {
        // Generate a more natural wheezing level with smoother transitions
        const newLevel = generateNaturalWheezingLevel(wheezingLevel, baseWheezingLevel, 0.15);
        setWheezingLevel(newLevel);

        // Add to historical data
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Create the new data point
        const newDataPoint = { time: timeString, level: newLevel };

        // Update complete session data (keep all points)
        setCompleteSessionData(prev => [...prev, newDataPoint]);

        // Update display data (keep only last 20 points for better visualization)
        setDisplayData(prev => {
          const newData = [...prev, newDataPoint];
          if (newData.length > 20) {
            return newData.slice(newData.length - 20);
          }
          return newData;
        });
      }, 1500); // Increased interval for smoother appearance

      // Store the interval reference for cleanup
      intervalRef.current = interval;

      // Update session duration
      const durationTimer = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      timerRef.current = window.setInterval(() => {
        // This is a placeholder for the interval function
        console.log('Interval running');
      }, 1000);
      return () => {
        clearInterval(interval);
        clearInterval(durationTimer);
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    // Stop the media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close the audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // Clear all intervals
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // Update state - only change recording status, keep session active
    // This allows us to preserve all the data for export
    setIsRecording(false);

    // Note: We intentionally don't reset sessionActive, completeSessionData, or displayData
    // This allows us to preserve the session data even after stopping
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

  const handleExportData = async () => {
    try {
      console.log("Export PDF button clicked");

      // Temporarily stop recording if active to prevent chart updates during export
      const wasRecording = isRecording;
      if (wasRecording) {
        stopRecording();
      }

      // Get the selected patient (for this demo, we'll use a hardcoded patient)
      const selectedPatient = {
        id: 1,
        name: "John Doe",
        age: 45,
        gender: "Male",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        address: "123 Main St, Anytown, USA",
        medicalHistory: "Asthma, Hypertension",
        lastSession: recordingStartTime ? recordingStartTime.toLocaleString() : new Date().toLocaleString(),
        nextAppointment: "Jun 15, 2024",
        status: "Stable",
        wheezingLevel: Math.round(wheezingLevel),
        respiratoryRate: 16,
        oxygenLevel: 98,
        medications: ["Albuterol", "Lisinopril"],
        notes: "Patient showing improvement after medication adjustment"
      };

      // Use the complete session data for export, not just the displayed data
      // This ensures we include all data points from the entire session
      const dataToExport = completeSessionData.length > 0
        ? completeSessionData
        : [{ time: new Date().toLocaleTimeString(), level: wheezingLevel }];

      console.log(`Exporting ${dataToExport.length} data points`);

      // Add session summary information
      const sessionInfo = sessionActive ? {
        sessionStart: recordingStartTime ? recordingStartTime.toLocaleString() : 'Unknown',
        sessionDuration: formatDuration(sessionDuration),
        dataPointsCount: completeSessionData.length,
        averageWheezingLevel: Math.round(
          completeSessionData.reduce((sum, point) => sum + point.level, 0) /
          (completeSessionData.length || 1)
        ),
        maxWheezingLevel: Math.round(
          Math.max(...completeSessionData.map(point => point.level), 0)
        ),
        currentStatus: isRecording ? 'Recording' : 'Paused'
      } : null;

      // Show loading message
      alert("Generating PDF with complete session data... This may take a moment.");

      // Wait a moment to ensure the UI is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // First try the advanced PDF export
        console.log("Attempting advanced PDF export...");
        const result = await exportToPDF(
          selectedPatient.id,
          selectedPatient,
          dataToExport,
          chartRef,
          sessionInfo
        );

        console.log("PDF export result:", result);

        if (result) {
          alert("PDF generated successfully! Check your downloads folder.");
        }
      } catch (pdfError) {
        console.error("Advanced PDF generation error:", pdfError);

        // If the advanced export fails, try the simple export as fallback
        try {
          console.log("Falling back to simple PDF export...");
          alert("Using simplified PDF export as fallback...");

          // Use the simple PDF export function
          simplePdfExport(
            selectedPatient,
            dataToExport,
            sessionInfo
          );

          alert("PDF generated successfully using simplified export! Check your downloads folder.");
        } catch (simplePdfError) {
          console.error("Simple PDF export also failed:", simplePdfError);
          alert(`Error generating PDF: ${pdfError.message}`);
        }
      }

      // Restart recording if it was active
      if (wasRecording) {
        startRecording();
      }
    } catch (error) {
      console.error("Error in export function:", error);
      alert(`An error occurred while exporting data: ${error.message}`);
    }
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
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={handleShareSession} className="flex items-center">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Add a direct download link for CSV data as a fallback */}
                {completeSessionData.length > 0 && (
                  <div className="mt-2">
                    <a
                      href={`data:text/csv;charset=utf-8,Time,Wheezing Level\n${
                        completeSessionData.map(point => `${point.time},${Math.round(point.level)}`).join('\n')
                      }`}
                      download={`aeropulse_data_${new Date().toISOString().split('T')[0]}.csv`}
                      className="text-xs text-primary hover:underline"
                    >
                      Download raw data (CSV)
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Session Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]" ref={chartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData}>
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
