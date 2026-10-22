import React from 'react';

export type SystemKey = 'respiratory' | 'cardiovascular' | 'endocrine' | 'nervous' | 'digestive';
export type ViewKey = 'body' | 'skeleton' | 'vessels';

export const SYSTEMS: Record<SystemKey, { label: string; color: string; tag: string; x: number; y: number }> = {
  respiratory: { label: 'Respiratory', color: '#14b8d6', tag: 'Lungs · SpO₂ 98%', x: 66, y: 34 },
  cardiovascular: { label: 'Cardiovascular', color: '#f0627f', tag: 'Heart · 62 bpm', x: 70, y: 43 },
  endocrine: { label: 'Endocrine', color: '#f5a524', tag: 'Thyroid · Pancreas', x: 66, y: 25 },
  nervous: { label: 'Nervous', color: '#8b7cf6', tag: 'Brain · Spine', x: 68, y: 9 },
  digestive: { label: 'Digestive', color: '#22c08a', tag: 'Stomach · Liver', x: 68, y: 55 },
};

interface Props {
  system: SystemKey;
  view: ViewKey;
  zoom: boolean;
  rotated: boolean;
}

export const AnatomyFigure: React.FC<Props> = ({ system, view, zoom, rotated }) => {
  const c = SYSTEMS[system].color;
  const on = (k: SystemKey) => system === k;
  const glow = (k: SystemKey) => (on(k) ? `url(#glow-${k})` : undefined);
  const op = (k: SystemKey) => (on(k) ? 0.95 : 0.28);

  const zoomY = system === 'nervous' ? 60 : system === 'digestive' ? 330 : system === 'endocrine' ? 160 : 220;

  return (
    <svg
      viewBox="0 0 300 640"
      role="img"
      aria-label={`Translucent human anatomy highlighting ${SYSTEMS[system].label} system`}
      style={{
        transform: `${rotated ? 'scaleX(-1)' : ''} ${zoom ? `scale(1.7) translateY(${200 - zoomY}px)` : ''}`,
        transition: 'transform .7s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dfeafe" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#c6dafa" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b6cdf4" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9db9e6" />
        </linearGradient>
        <radialGradient id="organ-lung" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#bfeaf5" />
          <stop offset="1" stopColor="#5fb6cf" />
        </radialGradient>
        <radialGradient id="organ-heart" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#ff9db1" />
          <stop offset="1" stopColor="#d8334f" />
        </radialGradient>
        {(Object.keys(SYSTEMS) as SystemKey[]).map((k) => (
          <filter key={k} id={`glow-${k}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feFlood floodColor={SYSTEMS[k].color} floodOpacity="0.9" />
            <feComposite in2="b" operator="in" result="g" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <clipPath id="body-clip">
          <path d="M150 18c-22 0-34 17-34 38 0 14 5 25 12 32l-2 16c-30 6-62 14-72 26-8 10-12 40-18 78l-10 72c-2 14 14 16 18 4l16-70 10-44 4 70c0 36-6 70-4 110l4 110c2 30-4 62-2 88 0 16 24 16 24 0l8-84 10-120 14 0 10 120 8 84c0 16 24 16 24 0 2-26-4-58-2-88l4-110c2-40-4-74-4-110l4-70 10 44 16 70c4 12 20 10 18-4l-10-72c-6-38-10-68-18-78-10-12-42-20-72-26l-2-16c7-7 12-18 12-32 0-21-12-38-34-38z" transform="translate(0 0) scale(1)" />
        </clipPath>
      </defs>

      {/* ground glow */}
      <ellipse cx="150" cy="620" rx="90" ry="10" fill={c} opacity="0.25" filter="url(#soft)" className="ch-pulse-ring" />

      <g className="ch-float">
        {/* Body shell */}
        <path
          d="M150 18c-22 0-34 17-34 38 0 14 5 25 12 32l-2 16c-30 6-62 14-72 26-8 10-12 40-18 78l-10 72c-2 14 14 16 18 4l16-70 10-44 4 70c0 36-6 70-4 110l4 110c2 30-4 62-2 88 0 16 24 16 24 0l8-84 10-120 14 0 10 120 8 84c0 16 24 16 24 0 2-26-4-58-2-88l4-110c2-40-4-74-4-110l4-70 10 44 16 70c4 12 20 10 18-4l-10-72c-6-38-10-68-18-78-10-12-42-20-72-26l-2-16c7-7 12-18 12-32 0-21-12-38-34-38z"
          fill="url(#skin)"
          stroke="url(#rim)"
          strokeWidth="2"
          opacity={view === 'skeleton' ? 0.45 : 0.9}
        />
        {/* inner sheen */}
        <path d="M128 40c4-14 14-20 22-20" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M96 130c-10 8-24 16-34 40" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />

        <g clipPath="url(#body-clip)">
          {/* Skeleton layer */}
          <g opacity={view === 'skeleton' ? 0.95 : 0.22} stroke="#eaf1ff" strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M150 92v250" strokeWidth="5" opacity="0.8" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <path d={`M150 ${120 + i * 17}c-22 -2 -38 6 -44 ${14 + i * 2}`} />
                <path d={`M150 ${120 + i * 17}c22 -2 38 6 44 ${14 + i * 2}`} />
              </g>
            ))}
            <path d="M88 106c24 6 48 8 62 8s38-2 62-8" />
            <path d="M120 350c-14 8-22 26-16 40M180 350c14 8 22 26 16 40" />
            <path d="M138 350h24" strokeWidth="4" />
            <circle cx="150" cy="54" r="20" opacity="0.7" />
            <path d="M118 380v200M182 380v200" opacity="0.5" />
          </g>

          {/* Vessel layer */}
          <g opacity={view === 'vessels' ? 1 : on('cardiovascular') ? 0.8 : 0.3} fill="none" strokeLinecap="round">
            <path d="M150 190c-6 40-8 100 0 160" stroke="#f0627f" strokeWidth="3.5" />
            <path d="M150 200c-30 6-58 26-78 60M150 200c30 6 58 26 78 60" stroke="#f0627f" strokeWidth="2.2" />
            <path d="M150 340c-20 40-30 120-34 230M150 340c20 40 30 120 34 230" stroke="#f0627f" strokeWidth="2.4" />
            <path d="M144 190c-8 40-10 100-2 160" stroke="#5b8def" strokeWidth="2.2" />
            <path d="M150 340c-8 50-20 130-22 230M150 340c8 50 20 130 22 230" stroke="#5b8def" strokeWidth="1.8" />
            <path d="M150 90c-10 30-12 60-6 100" stroke="#f0627f" strokeWidth="2" />
          </g>

          {/* Digestive */}
          <g opacity={op('digestive')} filter={glow('digestive')}>
            <path d="M168 232c22-6 44 4 40 22-4 16-26 24-44 18-14-6-12-34 4-40z" fill="#8fe0bc" />
            <path d="M104 236c-8 14-8 30 2 38 14 6 36 2 52-8l-4-26c-18-10-40-12-50-4z" fill="#59c796" />
            <path d="M118 296c-6 10 0 22 12 22s12 10 24 10 20-8 20-20-10-14-18-10c-10 4-14-6-26-4-6 1-10 0-12 2z" fill="#a4f0cd" stroke="#22c08a" strokeWidth="2" />
            <path d="M112 322c10-6 26-4 38 4 12-8 28-10 40-2 8 8 4 22-4 28-16 8-30 2-36-4-8 8-26 12-38 4-8-8-8-24 0-30z" fill="none" stroke="#22c08a" strokeWidth="5" strokeLinecap="round" />
          </g>

          {/* Endocrine */}
          <g opacity={op('endocrine')} filter={glow('endocrine')}>
            <path d="M138 98c4 6 8 8 12 8s8-2 12-8c4 2 6 8 2 14-6 6-12 6-14 6s-8 0-14-6c-4-6-2-12 2-14z" fill="#ffc861" stroke="#f5a524" strokeWidth="2" />
            <path d="M140 262c20-4 44 0 60 6 6 4 4 10-4 10-20 2-40 2-58-2-8-4-6-12 2-14z" fill="#ffd98a" stroke="#f5a524" strokeWidth="1.8" />
            <circle cx="120" cy="244" r="6" fill="#ffc861" />
            <circle cx="180" cy="244" r="6" fill="#ffc861" />
          </g>

          {/* Respiratory */}
          <g opacity={op('respiratory')} filter={glow('respiratory')}>
            <path d="M148 126c-6 0-8 6-8 14v10c-8 2-12 4-14 10-2 6-2 12-2 20l-8 4c-10 10-18 32-8 56 4 8 16 10 26 6 12-6 18-22 14-44z" fill="url(#organ-lung)" stroke="#2aa0be" strokeWidth="2" />
            <path d="M152 126c6 0 8 6 8 14v10c8 2 12 4 14 10 2 6 2 12 2 20l8 4c10 10 18 32 8 56-4 8-16 10-26 6-12-6-18-22-14-44z" fill="url(#organ-lung)" stroke="#2aa0be" strokeWidth="2" />
            <path d="M150 112v38M150 150c-14 6-24 14-28 28M150 150c14 6 24 14 28 28" stroke="#e8fbff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            {[0, 1, 2].map((i) => (
              <g key={i} stroke="#e8fbff" strokeWidth="1.4" fill="none" opacity="0.8">
                <path d={`M${126 - i * 2} ${182 + i * 14}c8 4 14 2 20-4`} />
                <path d={`M${174 + i * 2} ${182 + i * 14}c-8 4 -14 2 -20 -4`} />
              </g>
            ))}
          </g>

          {/* Heart */}
          <g opacity={op('cardiovascular')} filter={glow('cardiovascular')}>
            <g className={on('cardiovascular') ? 'ch-pulse-ring' : ''}>
              <path d="M152 170c-4-12-24-12-26 4-2 20 22 36 30 46 8-10 32-26 30-46-2-16-22-16-26-4z" fill="url(#organ-heart)" stroke="#c22a47" strokeWidth="2" />
              <path d="M150 168c0-10 6-18 12-22M162 172c10-4 16-10 20-18" stroke="#ff7b93" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
          </g>

          {/* Nervous */}
          <g opacity={op('nervous')} filter={glow('nervous')}>
            <path d="M128 52c-4-14 6-28 22-28s26 14 22 28c2 10-6 20-22 20s-24-10-22-20z" fill="#cfc7ff" stroke="#8b7cf6" strokeWidth="2" />
            <path d="M136 40c6 4 8 10 14 8s8-8 14-8M134 54c8 2 10 8 16 6s8-6 16-6" stroke="#8b7cf6" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M150 72v20M150 92c-2 60-2 160 0 250" stroke="#b8acff" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M150 110c-30 4-54 16-66 30M150 110c30 4 54 16 66 30" stroke="#b8acff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
};
