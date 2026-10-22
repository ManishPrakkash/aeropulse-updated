import React, { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Heart, Wind, Moon, Footprints, Pill, Leaf, ShoppingCart, Watch, Smartphone, Activity, Upload, ShieldCheck, Check } from 'lucide-react';
import { useCart } from './cart-context';

/* ---------------- Report ---------------- */
const RANGES: Record<string, number> = { '7 days': 7, '30 days': 30, '90 days': 90 };

const makeSeries = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i));
    return {
      day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      hr: Math.round(63 + Math.sin(i / 3) * 3 + ((i * 7) % 5) * 0.6),
      sys: Math.round(120 + Math.cos(i / 4) * 4 + ((i * 3) % 4)),
      dia: Math.round(77 + Math.sin(i / 5) * 3),
      spo2: Math.round(97 + ((i * 5) % 3) * 0.7),
    };
  });

export const ReportView: React.FC = () => {
  const [range, setRange] = useState('30 days');
  const data = useMemo(() => makeSeries(RANGES[range]), [range]);

  return (
    <>
      <div className="ch-row" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 className="ch-h1">Health Report</h1>
          <p className="ch-sub" style={{ marginTop: 4 }}>Summary of monitored vitals · for review with your care team</p>
        </div>
        <div className="ch-filters" style={{ margin: 0 }}>
          {Object.keys(RANGES).map((r) => (
            <button key={r} className={`ch-filter ${range === r ? 'on' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="ch-kpis">
        <div className="ch-kpi"><span className="ch-label">Resting heart rate</span><b>62 <small style={{ fontSize: 12, color: '#7b88a0' }}>bpm</small></b><span className="ch-chip teal">Stable</span></div>
        <div className="ch-kpi"><span className="ch-label">Blood pressure</span><b>118/76</b><span className="ch-chip green">In range</span></div>
        <div className="ch-kpi"><span className="ch-label">SpO₂</span><b>98 <small style={{ fontSize: 12, color: '#7b88a0' }}>%</small></b><span className="ch-chip blue">Normal</span></div>
        <div className="ch-kpi"><span className="ch-label">Sleep average</span><b>6h 50m</b><span className="ch-chip amber">Below goal</span></div>
        <div className="ch-kpi"><span className="ch-label">Daily steps</span><b>8,420</b><span className="ch-chip pink">+6% vs last</span></div>
      </div>

      <div className="ch-two">
        <section className="ch-card">
          <div className="ch-row" style={{ marginBottom: 8 }}><h3 className="ch-title">Resting heart rate</h3><span className="ch-sub">{range}</span></div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="hrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f0627f" stopOpacity={0.35} /><stop offset="1" stopColor="#f0627f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f8" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#7b88a0' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[55, 75]} tick={{ fontSize: 10, fill: '#7b88a0' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 0, boxShadow: '0 8px 24px rgba(15,31,61,.12)' }} />
                <Area type="monotone" dataKey="hr" stroke="#f0627f" strokeWidth={2.5} fill="url(#hrg)" name="HR (bpm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ch-card">
          <h3 className="ch-title" style={{ marginBottom: 8 }}>Blood pressure trend</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#eef2f8" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#7b88a0' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[60, 135]} tick={{ fontSize: 10, fill: '#7b88a0' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 0, boxShadow: '0 8px 24px rgba(15,31,61,.12)' }} />
                <Line type="monotone" dataKey="sys" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Systolic" />
                <Line type="monotone" dataKey="dia" stroke="#14b8a6" strokeWidth={2.5} dot={false} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="ch-card" style={{ marginTop: 14 }}>
        <h3 className="ch-title" style={{ marginBottom: 6 }}>Marker overview</h3>
        <table className="ch-table">
          <thead><tr><th>Marker</th><th>Latest</th><th>Reference</th><th>Status</th></tr></thead>
          <tbody>
            {[
              ['LDL cholesterol', '131 mg/dL', '< 130', 'Borderline', 'amber'],
              ['HbA1c', '5.6 %', '< 5.7', 'Upper normal', 'amber'],
              ['Vitamin D', '34 ng/mL', '30 – 100', 'In range', 'green'],
              ['TSH', '2.1 mIU/L', '0.4 – 4.0', 'In range', 'green'],
              ['Resting HR', '62 bpm', '60 – 100', 'In range', 'teal'],
            ].map(([a, b, c, d, t]) => (
              <tr key={a}><td>{a}</td><td>{b}</td><td style={{ color: '#7b88a0' }}>{c}</td><td><span className={`ch-chip ${t}`}>{d}</span></td></tr>
            ))}
          </tbody>
        </table>
        <p className="ch-sub" style={{ marginTop: 10 }}>Sample data shown for interface demonstration. Discuss results with your clinician.</p>
      </section>
    </>
  );
};

/* ---------------- Pharmacy ---------------- */
const PRODUCTS = [
  { name: 'Vitamin D3 2000 IU', sub: '90 softgels', price: 14.5, icon: <Pill size={34} />, bg: 'linear-gradient(160deg,#e4eeff,#d4f5ee)', c: '#2563c9' },
  { name: 'Omega-3 Fish Oil', sub: '120 capsules', price: 22, icon: <Heart size={34} />, bg: 'linear-gradient(160deg,#fde6ec,#fff1d6)', c: '#d03a5c' },
  { name: 'Magnesium Glycinate', sub: '60 tablets', price: 18.25, icon: <Leaf size={34} />, bg: 'linear-gradient(160deg,#dcf7ea,#e0f7fb)', c: '#14895c' },
  { name: 'Peak Flow Meter', sub: 'Adult range', price: 29, icon: <Wind size={34} />, bg: 'linear-gradient(160deg,#e0f7fb,#ece9ff)', c: '#0c8f80' },
  { name: 'Home BP Monitor', sub: 'Bluetooth cuff', price: 59, icon: <Activity size={34} />, bg: 'linear-gradient(160deg,#ece9ff,#fde6ec)', c: '#5b4bd6' },
  { name: 'Sleep Support Blend', sub: '30 sachets', price: 16, icon: <Moon size={34} />, bg: 'linear-gradient(160deg,#fff1d6,#e4eeff)', c: '#b57505' },
];

export const PharmacyView: React.FC = () => {
  const { add } = useCart();
  const [added, setAdded] = useState<string[]>([]);
  return (
    <>
      <div className="ch-row" style={{ marginBottom: 14 }}>
        <div><h1 className="ch-h1">ClyHealth Pharmacy</h1><p className="ch-sub" style={{ marginTop: 4 }}>Supplements and monitoring devices matched to your plan</p></div>
        <span className="ch-chip teal"><ShieldCheck size={13} /> Pharmacist reviewed</span>
      </div>
      <div className="ch-products">
        {PRODUCTS.map((p) => (
          <article className="ch-product" key={p.name}>
            <div className="img" style={{ background: p.bg, color: p.c }}>{p.icon}</div>
            <b>{p.name}</b>
            <span className="ch-sub">{p.sub}</span>
            <div className="ch-row" style={{ marginTop: 'auto' }}>
              <b style={{ fontSize: 16 }}>${p.price.toFixed(2)}</b>
              <button
                className={`ch-btn ${added.includes(p.name) ? 'ghost' : ''}`}
                onClick={() => { add(); setAdded((a) => [...a, p.name]); }}
              >
                {added.includes(p.name) ? <><Check size={13} /> In cart</> : <><ShoppingCart size={13} /> Add</>}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

/* ---------------- Data management ---------------- */
export const DataView: React.FC = () => {
  const [sources, setSources] = useState([
    { id: 'aw', name: 'Apple Watch Series 9', sub: 'Heart rate · SpO₂ · ECG', icon: <Watch size={18} />, on: true, c: '#3b82f6' },
    { id: 'ph', name: 'iPhone Health', sub: 'Steps · Sleep · Workouts', icon: <Smartphone size={18} />, on: true, c: '#14b8a6' },
    { id: 'bp', name: 'Withings BPM Connect', sub: 'Blood pressure', icon: <Heart size={18} />, on: false, c: '#f0627f' },
    { id: 'st', name: 'Step counter', sub: 'Daily steps', icon: <Footprints size={18} />, on: true, c: '#f5a524' },
  ]);
  return (
    <>
      <div className="ch-row" style={{ marginBottom: 14 }}>
        <div><h1 className="ch-h1">Data Management</h1><p className="ch-sub" style={{ marginTop: 4 }}>Control connected sources and what is shared</p></div>
        <button className="ch-btn"><Upload size={13} /> Import records</button>
      </div>
      <div className="ch-two">
        <section className="ch-card">
          <h3 className="ch-title" style={{ marginBottom: 6 }}>Connected sources</h3>
          {sources.map((s) => (
            <div className="ch-source" key={s.id}>
              <div className="ch-note-ic" style={{ background: '#f3f6fb', color: s.c, width: 38, height: 38 }}>{s.icon}</div>
              <div style={{ flex: 1 }}><b>{s.name}</b><div className="ch-sub">{s.sub}</div></div>
              <span className={`ch-chip ${s.on ? 'green' : 'gray'}`}>{s.on ? 'Syncing' : 'Paused'}</span>
              <button className={`ch-toggle ${s.on ? 'on' : ''}`} aria-label={`Toggle ${s.name}`} onClick={() => setSources((all) => all.map((x) => (x.id === s.id ? { ...x, on: !x.on } : x)))} />
            </div>
          ))}
        </section>
        <section className="ch-card">
          <h3 className="ch-title" style={{ marginBottom: 10 }}>Storage & privacy</h3>
          <div className="ch-metric"><span className="ch-label">Records stored</span><div className="v">12,480<small>entries</small></div><div className="ch-range"><i style={{ left: '38%' }} /></div></div>
          <div className="ch-divider" />
          <p className="ch-sub" style={{ lineHeight: 1.6 }}>Data is encrypted at rest. You can export or delete records at any time.</p>
          <button className="ch-btn ghost full" style={{ marginTop: 12 }}>Export all data</button>
        </section>
      </div>
    </>
  );
};
