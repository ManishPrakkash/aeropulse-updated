import React, { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Bell, Search, ShoppingCart, Activity } from 'lucide-react';
import './clyhealth.css';
import { DashboardView } from './DashboardView';
import { GoalsView } from './GoalsView';
import { ReportView, PharmacyView, DataView } from './OtherViews';

import { CartContext } from './cart-context';

const NAV = [
  { to: '/clyhealth/dashboard', label: 'Dashboard' },
  { to: '/clyhealth/goals', label: 'Goals' },
  { to: '/clyhealth/report', label: 'Report' },
  { to: '/clyhealth/pharmacy', label: 'ClyHealth Pharmacy' },
  { to: '/clyhealth/data', label: 'Data Management' },
];

export const ClyHealthApp: React.FC = () => {
  const [count, setCount] = useState(2);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notif, setNotif] = useState(true);

  return (
    <CartContext.Provider value={{ count, add: (n = 1) => setCount((c) => c + n) }}>
      <div className="ch-root">
        <header className="ch-header">
          <NavLink to="/clyhealth/dashboard" className="ch-logo" aria-label="ClyHealth home">
            <span className="ch-logo-mark"><Activity size={16} /></span>
            Cly<b>Health</b>
          </NavLink>

          <nav className="ch-nav" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ch-tools">
            <div className={`ch-search ${searchOpen ? 'open' : ''}`}>
              <button
                id="ch-search-btn"
                className="ch-icon-btn"
                style={{ background: 'transparent', width: 20, height: 20 }}
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
              >
                <Search size={16} />
              </button>
              <input id="ch-search-input" placeholder="Search health data" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button id="ch-notif-btn" className="ch-icon-btn" aria-label="Notifications" onClick={() => setNotif(false)}>
              <Bell size={16} />
              {notif && <span className="ch-badge">3</span>}
            </button>
            <button id="ch-cart-btn" className="ch-icon-btn" aria-label="Cart">
              <ShoppingCart size={16} />
              <span className="ch-badge">{count}</span>
            </button>
            <div className="ch-avatar" title="Profile">AM</div>
          </div>
        </header>

        <main className="ch-page">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="goals" element={<GoalsView />} />
            <Route path="report" element={<ReportView />} />
            <Route path="pharmacy" element={<PharmacyView />} />
            <Route path="data" element={<DataView />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </CartContext.Provider>
  );
};
