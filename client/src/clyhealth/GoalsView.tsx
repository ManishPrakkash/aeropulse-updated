import React, { useMemo, useState } from 'react';
import {
  Pill, Settings2, Activity, FlaskConical, Salad, Leaf, Pencil, X, Dumbbell, HeartPulse, CalendarClock, Plus, Check,
} from 'lucide-react';

const FILTERS = ['Today', 'Yesterday', 'Last week', 'Last month', 'Custom'];
const PROGRESS: Record<string, { done: number; total: number; label: string }> = {
  Today: { done: 7, total: 10, label: 'On track' },
  Yesterday: { done: 9, total: 10, label: 'Great day' },
  'Last week': { done: 52, total: 70, label: 'On track' },
  'Last month': { done: 231, total: 300, label: 'Improving' },
  Custom: { done: 18, total: 25, label: 'On track' },
};

const Gauge: React.FC<{ value: number }> = ({ value }) => {
  const cx = 200, cy = 200, r = 160;
  const pt = (a: number, rad: number) => [cx + rad * Math.cos(a), cy - rad * Math.sin(a)];
  const [sx, sy] = pt(Math.PI, r);
  const endA = Math.PI - Math.PI * value;
  const [ex, ey] = pt(endA, r);
  const ticks = Array.from({ length: 41 }, (_, i) => i);
  const [nx, ny] = pt(endA, 120);
  return (
    <svg viewBox="0 0 400 225" role="img" aria-label={`${Math.round(value * 100)} percent of goals achieved`}>
      <defs>
        <linearGradient id="gg" x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <filter id="gglow"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <path d={`M${sx} ${sy} A${r} ${r} 0 0 1 ${pt(0, r)[0]} ${pt(0, r)[1]}`} fill="none" stroke="#e8eef7" strokeWidth="22" strokeLinecap="round" />
      <path d={`M${sx} ${sy} A${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" stroke="url(#gg)" strokeWidth="22" strokeLinecap="round" opacity="0.35" filter="url(#gglow)" style={{ transition: 'all .8s' }} />
      <path d={`M${sx} ${sy} A${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" stroke="url(#gg)" strokeWidth="22" strokeLinecap="round" style={{ transition: 'all .8s' }} />
      {ticks.map((i) => {
        const a = Math.PI - (Math.PI * i) / 40;
        const major = i % 10 === 0;
        const [x1, y1] = pt(a, 133);
        const [x2, y2] = pt(a, major ? 118 : 124);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major ? '#15233f' : '#b8c3d8'} strokeWidth={major ? 2 : 1.2} strokeLinecap="round" />;
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0f1f3d" strokeWidth="3.5" strokeLinecap="round" style={{ transition: 'all .8s' }} />
      <circle cx={cx} cy={cy} r="9" fill="#0f1f3d" />
      <circle cx={cx} cy={cy} r="3.5" fill="#fff" />
    </svg>
  );
};

interface Ev { id: number; label: string; start: number; end: number; lane: number; color: string; bg: string; icon: React.ReactNode }
const INITIAL: Ev[] = [
  { id: 1, label: 'Dose Taken', start: 7, end: 9.2, lane: 0, color: '#2563c9', bg: '#e4eeff', icon: <Pill size={13} /> },
  { id: 2, label: 'Routine Set', start: 9.5, end: 12, lane: 1, color: '#5b4bd6', bg: '#ece9ff', icon: <Settings2 size={13} /> },
  { id: 3, label: 'BP Monitoring', start: 11, end: 14, lane: 0, color: '#d03a5c', bg: '#fde6ec', icon: <Activity size={13} /> },
  { id: 4, label: 'Test Booked', start: 13.5, end: 16.5, lane: 2, color: '#b57505', bg: '#fff1d6', icon: <FlaskConical size={13} /> },
  { id: 5, label: 'Diet Switched', start: 15, end: 18, lane: 1, color: '#14895c', bg: '#dcf7ea', icon: <Salad size={13} /> },
  { id: 6, label: 'Supplementing', start: 17.5, end: 20.5, lane: 0, color: '#0c8f80', bg: '#e0f7f3', icon: <Leaf size={13} /> },
];

const fmt = (h: number) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  const ap = hh >= 12 ? 'PM' : 'AM';
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${ap}`;
};

const ACTIONS = [
  { icon: <Salad size={22} />, ic: '#14895c', bg: '#dcf7ea', title: 'Adopt a low-glycemic, heart-healthy diet', text: 'Favor legumes, leafy greens and whole grains at most meals.', impact: '+12% goal impact', tag: 'Nutrition', tone: 'green' },
  { icon: <Dumbbell size={22} />, ic: '#2563c9', bg: '#e4eeff', title: 'Train regularly while monitoring VO₂ max', text: 'Three zone-2 sessions weekly, reviewing VO₂ max every month.', impact: '+18% goal impact', tag: 'Fitness', tone: 'blue' },
  { icon: <HeartPulse size={22} />, ic: '#d03a5c', bg: '#fde6ec', title: 'Log blood pressure twice a day', text: 'Morning and evening readings build a reliable trend line.', impact: '+9% goal impact', tag: 'Cardio', tone: 'pink' },
  { icon: <CalendarClock size={22} />, ic: '#5b4bd6', bg: '#ece9ff', title: 'Keep a consistent sleep window', text: 'Aim for a bedtime within 30 minutes of your usual schedule.', impact: '+7% goal impact', tag: 'Sleep', tone: 'violet' },
];

export const GoalsView: React.FC = () => {
  const [filter, setFilter] = useState('Today');
  const [events, setEvents] = useState(INITIAL);
  const [edit, setEdit] = useState(false);
  const [range, setRange] = useState<[number, number]>([6, 22]);
  const [newLabel, setNewLabel] = useState('');
  const [done, setDone] = useState<number[]>([]);

  const prog = PROGRESS[filter];
  const value = prog.done / prog.total;
  const [r0, r1] = range;
  const span = r1 - r0;
  const pos = (h: number) => `${((h - r0) / span) * 100}%`;
  const now = useMemo(() => { const d = new Date(); return Math.min(Math.max(d.getHours() + d.getMinutes() / 60, r0), r1); }, [r0, r1]);
  const hours = Array.from({ length: Math.floor(span / 2) + 1 }, (_, i) => r0 + i * 2);

  const addEvent = () => {
    if (!newLabel.trim()) return;
    const start = Math.min(r0 + 1, r1 - 3);
    setEvents((e) => [...e, { id: Date.now(), label: newLabel.trim(), start, end: start + 2.5, lane: 3, color: '#2563c9', bg: '#e4eeff', icon: <Plus size={13} /> }]);
    setNewLabel('');
  };

  return (
    <>
      <div className="ch-filters" role="tablist" aria-label="Date range">
        {FILTERS.map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} className={`ch-filter ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <h1 className="ch-h1" style={{ marginBottom: 14 }}>Health Plan</h1>

      <section className="ch-card ch-hero">
        <div>
          <span className={`ch-chip green`}><span className="ch-dot" style={{ width: 6, height: 6, boxShadow: 'none' }} /> {prog.label}</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '12px 0 6px' }}>Your personalized progress</h2>
          <p className="ch-sub" style={{ fontSize: 13, lineHeight: 1.55, maxWidth: 380 }}>
            You completed {prog.done} of {prog.total} planned actions for <b>{filter.toLowerCase()}</b>. Keep your routines steady to move the pointer toward your target.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <span className="ch-chip blue">{Math.round(value * 100)}% complete</span>
            <span className="ch-chip gray">{prog.total - prog.done} remaining</span>
          </div>
        </div>
        <div className="ch-gauge">
          <Gauge value={value} />
          <div className="ch-gauge-center"><b>{prog.done}</b><span>of {prog.total} goals achieved</span></div>
        </div>
      </section>

      <section className="ch-card" style={{ marginTop: 14 }}>
        <div className="ch-row" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <h3 className="ch-title">Health Plan timeline</h3>
            <p className="ch-sub">{fmt(r0)} – {fmt(r1)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="ch-select" value={`${r0}-${r1}`} onChange={(e) => setRange(e.target.value.split('-').map(Number) as [number, number])} aria-label="Time range">
              <option value="6-22">6 AM – 10 PM</option><option value="8-20">8 AM – 8 PM</option><option value="0-24">Full day</option>
            </select>
            <button className={`ch-btn ${edit ? '' : 'ghost'}`} onClick={() => setEdit((e) => !e)}>{edit ? <><Check size={13} /> Done</> : <><Pencil size={13} /> Edit</>}</button>
          </div>
        </div>

        {edit && (
          <div className="ch-edit-panel">
            <input placeholder="New event name" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEvent()} />
            <button className="ch-btn" onClick={addEvent}><Plus size={13} /> Add event</button>
            <span className="ch-sub" style={{ alignSelf: 'center' }}>Use × on a pill to remove it.</span>
          </div>
        )}

        <div className="ch-tl-scroll">
          <div className="ch-tl">
            {hours.map((h) => (
              <React.Fragment key={h}>
                <span className="ch-tl-hour" style={{ left: pos(h) }}>{fmt(h).replace(':00 ', ' ')}</span>
                <span className="ch-tl-grid" style={{ left: pos(h) }} />
              </React.Fragment>
            ))}
            <div className="ch-tl-now" data-time={fmt(now)} style={{ left: pos(now) }} />
            {events.filter((e) => e.end > r0 && e.start < r1).map((e) => (
              <button
                key={e.id}
                className="ch-event"
                style={{ left: pos(Math.max(e.start, r0)), width: `calc(${((Math.min(e.end, r1) - Math.max(e.start, r0)) / span) * 100}% - 4px)`, top: 48 + e.lane * 52, background: e.bg, color: e.color }}
                title={`${e.label} · ${fmt(e.start)} – ${fmt(e.end)}`}
              >
                <span className="ic" style={{ color: e.color }}>{e.icon}</span>
                <span>{e.label}</span>
                <span className="t">{fmt(e.start)}</span>
                {edit && <X size={13} onClick={(ev) => { ev.stopPropagation(); setEvents((all) => all.filter((x) => x.id !== e.id)); }} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <div className="ch-row" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Lifestyle actions</h2>
          <span className="ch-chip gray">{ACTIONS.length - done.length} to do</span>
        </div>
        <div className="ch-actions-grid">
          {ACTIONS.map((a, i) => (
            <article className="ch-action" key={a.title} style={{ opacity: done.includes(i) ? 0.6 : 1 }}>
              <div className="ch-row">
                <div className="ic" style={{ background: a.bg, color: a.ic }}>{a.icon}</div>
                <span className={`ch-chip ${a.tone}`}>{a.tag}</span>
              </div>
              <h4>{a.title}</h4>
              <p>{a.text}</p>
              <div className="ch-row" style={{ marginTop: 'auto' }}>
                <span className="ch-chip teal">{a.impact}</span>
                <button className={`ch-btn ${done.includes(i) ? '' : 'ghost'}`} onClick={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}>
                  {done.includes(i) ? <><Check size={13} /> Added</> : 'Add to plan'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};
