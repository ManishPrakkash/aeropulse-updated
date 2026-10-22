import React, { useState } from 'react';
import {
  ChevronDown, Heart, Wind, Activity, Brain, Droplets, Pill, Leaf, FileText, History, Users,
  Eye, RotateCw, ZoomIn, Layers, Bone, Clock, Flame, Scale, User, CalendarDays, Dna,
} from 'lucide-react';
import { SYSTEMS, SystemKey, ViewKey } from './AnatomyFigure';
import { AnatomyModel } from './AnatomyModel';

const RangeBar: React.FC<{ pos: number }> = ({ pos }) => (
  <div className="ch-range" aria-hidden><i style={{ left: `${pos}%` }} /></div>
);

interface MetricDef { label: string; value: string; unit?: string; status: string; tone: string; pos: number }
interface SysDef {
  key: SystemKey; title: string; icon: React.ReactNode; tint: string; score: number; scoreTone: string;
  chips: { t: string; c: string }[]; metrics: MetricDef[];
}

const SYS_CARDS: SysDef[] = [
  {
    key: 'respiratory', title: 'Respiratory System', icon: <Wind size={17} />, tint: '#e0f7fb', score: 82, scoreTone: '#0c8f80',
    chips: [{ t: 'Mild wheeze history', c: 'amber' }, { t: 'Normal SpO₂', c: 'teal' }, { t: 'Seasonal allergies', c: 'blue' }],
    metrics: [
      { label: 'SpO₂', value: '98', unit: '%', status: 'Optimal', tone: '#14895c', pos: 56 },
      { label: 'Resp. rate', value: '16', unit: '/min', status: 'Normal', tone: '#14895c', pos: 48 },
      { label: 'FEV1/FVC', value: '0.78', status: 'Borderline', tone: '#b57505', pos: 72 },
      { label: 'Peak flow', value: '470', unit: 'L/min', status: 'Good', tone: '#14895c', pos: 42 },
    ],
  },
  {
    key: 'cardiovascular', title: 'Cardiovascular Health Report', icon: <Heart size={17} />, tint: '#fde6ec', score: 74, scoreTone: '#d03a5c',
    chips: [{ t: 'BP elevated', c: 'pink' }, { t: 'LDL watch', c: 'amber' }, { t: 'Good HRV', c: 'teal' }],
    metrics: [
      { label: 'Blood pressure', value: '118/76', unit: 'mmHg', status: 'Normal', tone: '#14895c', pos: 46 },
      { label: 'Resting HR', value: '62', unit: 'bpm', status: 'Athletic', tone: '#14895c', pos: 38 },
      { label: 'LDL', value: '131', unit: 'mg/dL', status: 'Borderline', tone: '#b57505', pos: 76 },
      { label: 'HRV', value: '58', unit: 'ms', status: 'Good', tone: '#14895c', pos: 52 },
    ],
  },
  {
    key: 'endocrine', title: 'Endocrine System', icon: <Droplets size={17} />, tint: '#fff1d6', score: 88, scoreTone: '#b57505',
    chips: [{ t: 'TSH in range', c: 'teal' }, { t: 'Pre-diabetic watch', c: 'amber' }],
    metrics: [
      { label: 'HbA1c', value: '5.6', unit: '%', status: 'Upper normal', tone: '#b57505', pos: 68 },
      { label: 'Fasting glucose', value: '96', unit: 'mg/dL', status: 'Normal', tone: '#14895c', pos: 50 },
      { label: 'TSH', value: '2.1', unit: 'mIU/L', status: 'Optimal', tone: '#14895c', pos: 47 },
      { label: 'Cortisol (AM)', value: '14', unit: 'µg/dL', status: 'Normal', tone: '#14895c', pos: 53 },
    ],
  },
];

const SYSTEM_BUTTONS: { key: SystemKey; icon: React.ReactNode }[] = [
  { key: 'respiratory', icon: <Wind size={17} /> },
  { key: 'cardiovascular', icon: <Heart size={17} /> },
  { key: 'endocrine', icon: <Droplets size={17} /> },
  { key: 'nervous', icon: <Brain size={17} /> },
  { key: 'digestive', icon: <Leaf size={17} /> },
];

export const DashboardView: React.FC = () => {
  const [system, setSystem] = useState<SystemKey>('respiratory');
  const [view, setView] = useState<ViewKey>('body');
  const [zoom, setZoom] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [device, setDevice] = useState('Apple Watch Series 9');
  const [dataType, setDataType] = useState('Vitals');
  const [open, setOpen] = useState<Record<string, boolean>>({ respiratory: true, cardiovascular: false, endocrine: false });

  const sys = SYSTEMS[system];
  const toggle = (k: string, key: SystemKey) => {
    setOpen((o) => ({ ...o, [k]: !o[k] }));
    setSystem(key);
  };

  return (
    <>
      {/* Patient strip */}
      <section className="ch-strip" aria-label="Patient summary">
        <span className="ch-pill"><Dna size={14} color="#14b8a6" /> <small>Biological age</small> 34 yrs</span>
        <span className="ch-pill"><User size={14} color="#3b82f6" /> <small>Sex</small> Female</span>
        <span className="ch-pill"><Scale size={14} color="#8b7cf6" /> <small>Weight</small> 62 kg</span>
        <span className="ch-pill"><span className="ch-dot" /> <small>Last sync</small> 2 min ago</span>
        <span style={{ flex: 1 }} />
        <button className="ch-pill action"><History size={14} /> Recent: BP check</button>
        <button className="ch-pill action"><Pill size={14} /> Recent: Vitamin D3</button>
        <button className="ch-pill action"><CalendarDays size={14} /> Lab · Mar 12</button>
      </section>

      <div className="ch-grid-3">
        {/* LEFT */}
        <aside>
          <div className="ch-card">
            <div className="ch-row" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2 className="ch-title">Health Summary</h2>
                <p className="ch-sub" style={{ marginTop: 3 }}>Aisha M. · 34 · Updated today</p>
              </div>
              <div className="ch-risk-ring">
                <svg viewBox="0 0 64 64" width="64" height="64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#e8eef7" strokeWidth="6" />
                  <circle cx="32" cy="32" r="27" fill="none" stroke="url(#rg)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${0.78 * 169.6} 169.6`} transform="rotate(-90 32 32)" />
                  <defs><linearGradient id="rg"><stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#14b8a6" /></linearGradient></defs>
                </svg>
                <span>78</span>
              </div>
            </div>
            <p style={{ margin: '12px 0 10px', lineHeight: 1.5, color: '#46557a', fontSize: 12.5 }}>
              Overall risk is <b style={{ color: '#0c8f80' }}>low to moderate</b>. Cardiovascular and respiratory markers are being tracked more closely this month.
            </p>
            <div className="ch-chips">
              <span className="ch-chip green">Low risk · 3 systems</span>
              <span className="ch-chip amber">Watch · 2</span>
            </div>
            <button className="ch-btn gradient full" style={{ marginTop: 6 }}><FileText size={14} /> Open Patient Portal</button>
          </div>

          <div className="ch-card">
            <h3 className="ch-title" style={{ marginBottom: 10 }}>Health History</h3>
            <div className="ch-note">
              <div className="ch-note-ic" style={{ background: '#e0f7fb', color: '#0c8f80' }}><Wind size={15} /></div>
              <div><b>Exercise-induced wheeze</b><p>Diagnosed 2019 · managed with inhaler as needed.</p></div>
            </div>
            <div className="ch-note">
              <div className="ch-note-ic" style={{ background: '#fff1d6', color: '#b57505' }}><Flame size={15} /></div>
              <div><b>Seasonal allergies</b><p>Spring pollen · antihistamine in season.</p></div>
            </div>
            <div className="ch-note">
              <div className="ch-note-ic" style={{ background: '#ece9ff', color: '#5b4bd6' }}><Clock size={15} /></div>
              <div><b>Sleep pattern</b><p>Avg 6h 50m · consistency improving.</p></div>
            </div>
          </div>

          <div className="ch-card">
            <div className="ch-row" style={{ marginBottom: 10 }}>
              <h3 className="ch-title">Family History</h3>
              <Users size={15} color="#7b88a0" />
            </div>
            <div className="ch-family">
              {[
                ['Hypertension', '#f0627f'], ['Type 2 diabetes', '#f5a524'], ['Asthma', '#14b8d6'], ['Heart disease', '#f0627f'],
              ].map(([n, c]) => (
                <div key={n}>{n}<i style={{ background: c }} /></div>
              ))}
            </div>
          </div>

          <div className="ch-card">
            <h3 className="ch-title" style={{ marginBottom: 10 }}>Supplements & Recent</h3>
            <div className="ch-mini-cards">
              <div className="ch-mini"><div className="ic"><Pill size={14} color="#3b82f6" /></div><b>Vitamin D3</b><span>2000 IU · daily</span></div>
              <div className="ch-mini"><div className="ic"><Leaf size={14} color="#22c08a" /></div><b>Omega-3</b><span>1000 mg · daily</span></div>
              <div className="ch-mini"><div className="ic"><Droplets size={14} color="#f5a524" /></div><b>Magnesium</b><span>300 mg · evening</span></div>
              <div className="ch-mini"><div className="ic"><Activity size={14} color="#f0627f" /></div><b>BP monitor</b><span>Ordered · in transit</span></div>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section className="ch-col-center">
          <div className="ch-card ch-monitor">
            <div className="ch-row" style={{ flexWrap: 'wrap' }}>
              <div>
                <h2 className="ch-title">Real Time Data Monitoring</h2>
                <p className="ch-sub" style={{ marginTop: 3 }}><span className="ch-dot" style={{ display: 'inline-block', marginRight: 6, width: 6, height: 6 }} />Streaming from {device}</p>
              </div>
              <div className="ch-selects">
                <select id="ch-device" className="ch-select" value={device} onChange={(e) => setDevice(e.target.value)} aria-label="Device">
                  <option>Apple Watch Series 9</option><option>Oura Ring Gen 3</option><option>Withings BPM</option>
                </select>
                <select id="ch-datatype" className="ch-select" value={dataType} onChange={(e) => setDataType(e.target.value)} aria-label="Data type">
                  <option>Vitals</option><option>Activity</option><option>Sleep</option><option>Respiratory</option>
                </select>
              </div>
            </div>

            <div className="ch-vitals">
              <div className="ch-vital"><span className="ch-label">Blood pressure</span><br /><b>118/76<em>mmHg</em></b></div>
              <div className="ch-vital"><span className="ch-label">Resting heart rate</span><br /><b>62<em>bpm</em></b></div>
              <div className="ch-vital"><span className="ch-label">{dataType}</span><br /><b style={{ color: sys.color }}>{sys.label}</b></div>
            </div>

            <div className="ch-stage">
              <AnatomyModel system={system} view={view} zoom={zoom} rotated={rotated} />
              <div className="ch-stage-tag" style={{ right: '8%', top: `${sys.y + 4}%` }}>
                <i style={{ background: sys.color, boxShadow: `0 0 10px ${sys.color}` }} />{sys.tag}
              </div>
              <div className="ch-stage-tag" style={{ left: '6%', bottom: '12%' }}>
                <Eye size={12} /> {view === 'body' ? 'Surface' : view === 'skeleton' ? 'Skeletal' : 'Vascular'} view
              </div>
            </div>

            <div className="ch-controls" role="toolbar" aria-label="Anatomy controls">
              {SYSTEM_BUTTONS.map((b) => (
                <button key={b.key} id={`ch-sys-${b.key}`} className={`ch-round ${system === b.key ? 'on' : ''}`} title={SYSTEMS[b.key].label} aria-label={SYSTEMS[b.key].label} onClick={() => setSystem(b.key)}>
                  {b.icon}
                </button>
              ))}
              <span style={{ width: 1, background: '#e1e7f1', margin: '4px 4px' }} />
              <button className={`ch-round ${view === 'body' ? 'on' : ''}`} title="Surface" aria-label="Surface view" onClick={() => setView('body')}><Layers size={17} /></button>
              <button className={`ch-round ${view === 'skeleton' ? 'on' : ''}`} title="Skeleton" aria-label="Skeleton view" onClick={() => setView('skeleton')}><Bone size={17} /></button>
              <button className={`ch-round ${view === 'vessels' ? 'on' : ''}`} title="Vessels" aria-label="Vascular view" onClick={() => setView('vessels')}><Activity size={17} /></button>
              <button className={`ch-round ${rotated ? 'on' : ''}`} title="Rotate" aria-label="Rotate" onClick={() => setRotated((r) => !r)}><RotateCw size={17} /></button>
              <button className={`ch-round ${zoom ? 'on' : ''}`} title="Zoom" aria-label="Zoom" onClick={() => setZoom((z) => !z)}><ZoomIn size={17} /></button>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside>
          <div className="ch-row" style={{ padding: '2px 4px 12px' }}>
            <h2 className="ch-title">Health Risks</h2>
            <span className="ch-chip gray">{SYS_CARDS.length} systems</span>
          </div>
          {SYS_CARDS.map((s) => (
            <div className="ch-sys" key={s.key}>
              <button className="ch-sys-head" onClick={() => toggle(s.key, s.key)} aria-expanded={!!open[s.key]}>
                <span className="ch-sys-ic" style={{ background: s.tint, color: s.scoreTone }}>{s.icon}</span>
                <span className="grow"><b>{s.title}</b><span className="ch-sub">Risk score</span></span>
                <span className="ch-score" style={{ color: s.scoreTone }}>{s.score}</span>
                <ChevronDown size={16} className={`ch-chev ${open[s.key] ? 'open' : ''}`} />
              </button>
              {open[s.key] && (
                <div className="ch-sys-body">
                  <div className="ch-chips">
                    {s.chips.map((c) => <span key={c.t} className={`ch-chip ${c.c}`}>{c.t}</span>)}
                  </div>
                  <div className="ch-metrics">
                    {s.metrics.map((m) => (
                      <div className="ch-metric" key={m.label}>
                        <span className="ch-label">{m.label}</span>
                        <div className="v">{m.value}{m.unit && <small>{m.unit}</small>}</div>
                        <div className="st" style={{ color: m.tone }}>{m.status}</div>
                        <RangeBar pos={m.pos} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </aside>
      </div>
    </>
  );
};
