import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { MonitorPage } from './pages/MonitorPage';
import { PatientPage } from './pages/PatientPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import './index.css';
import './styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MonitorPage />} />
          <Route path="patient" element={<PatientPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="/live-monitor" element={<LiveMonitorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
