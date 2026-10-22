import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Bluetooth, Power, Radio, Usb, AlertTriangle } from "lucide-react";
import { esp32Service, ConnectionStatus } from "../services/esp32-service";
import { Button } from "./ui/button";

export function ESP32ConnectionBadge() {
  const [status, setStatus] = useState<ConnectionStatus>(esp32Service.getStatus());
  const [portInfo, setPortInfo] = useState<string>(esp32Service.getPortInfo());
  const [isStreaming, setIsStreaming] = useState<boolean>(esp32Service.isStreaming());
  const [gasAlert, setGasAlert] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubStatus = esp32Service.onStatus((newStatus) => {
      setStatus(newStatus);
      setPortInfo(esp32Service.getPortInfo());
    });

    const unsubTelemetry = esp32Service.onTelemetry((data) => {
      setGasAlert(data.gasStatus === 'Alert');
    });

    const unsubStreaming = esp32Service.onStreamingState((streaming) => {
      setIsStreaming(streaming);
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubStreaming();
    };
  }, []);

  const handleConnectSerial = async () => {
    try {
      setDropdownOpen(false);
      await esp32Service.autoConnect();
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
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

  const handleSimulation = () => {
    setDropdownOpen(false);
    esp32Service.startSimulation();
  };

  const handleDisconnect = async () => {
    setDropdownOpen(false);
    await esp32Service.disconnect();
  };

  const handleToggleStream = async () => {
    await esp32Service.toggleStreaming();
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        {gasAlert && (
          <div className="flex items-center px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-semibold animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-red-400" />
            GAS HAZARD!
          </div>
        )}

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-sm ${
            status === 'connected'
              ? isStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : status === 'connecting'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
              : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
          }`}
          title="Click to manage ESP32 connection & streaming"
        >
          <span className="relative flex h-2 w-2">
            {status === 'connected' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isStreaming ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                status === 'connected'
                  ? isStreaming ? 'bg-emerald-500' : 'bg-amber-500'
                  : status === 'connecting'
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
            ></span>
          </span>

          <span className="flex items-center gap-1.5">
            <Bluetooth className="h-3.5 w-3.5" />
            <Usb className="h-3.5 w-3.5" />
            <span>
              {status === 'connected'
                ? `ESP32: ${isStreaming ? 'Streaming ON' : 'Paused OFF'}`
                : status === 'connecting'
                ? 'ESP32 Connecting...'
                : 'Connect ESP32'}
            </span>
          </span>
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-card border shadow-xl p-3 z-50 text-foreground text-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="font-semibold flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-primary" />
              <span>ESP32 Hardware Stream</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                status === 'connected'
                  ? isStreaming
                    ? 'bg-emerald-500/20 text-emerald-500 font-medium'
                    : 'bg-amber-500/20 text-amber-500 font-medium'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status === 'connected' ? (isStreaming ? 'Streaming ON' : 'Paused OFF') : status}
            </span>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            {portInfo ? `Port: ${portInfo}` : 'Connect over USB Serial or Classic Bluetooth COM port at 115200 baud.'}
          </div>

          <div className="space-y-1.5 pt-1">
            {status !== 'connected' ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleConnectSerial}
                >
                  <Usb className="h-3.5 w-3.5 mr-2" />
                  Connect USB / Bluetooth Serial
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start text-xs"
                  onClick={handleSimulation}
                >
                  <Activity className="h-3.5 w-3.5 mr-2 text-primary" />
                  Start Hardware Simulator
                </Button>
              </>
            ) : (
              <div className="space-y-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className={`w-full justify-start text-xs font-semibold ${
                    isStreaming
                      ? 'text-amber-500 border-amber-500/30 hover:bg-amber-500/10'
                      : 'text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                  onClick={handleToggleStream}
                >
                  <Power className="h-3.5 w-3.5 mr-2" />
                  {isStreaming ? 'Turn Stream OFF (Send OFF)' : 'Turn Stream ON (Send ON)'}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full justify-start text-xs"
                  onClick={handleDisconnect}
                >
                  Disconnect ESP32
                </Button>
              </div>
            )}

            <Link
              to="/live-monitor"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-center text-xs py-1.5 text-primary hover:underline font-medium"
            >
              Open Live Monitor Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
