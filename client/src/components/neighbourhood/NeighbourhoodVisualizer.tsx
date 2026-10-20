import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { HouseEnergyState, NeighbourhoodState, UserProfile } from '../../types';

// ─── Constants ───────────────────────────────────────────────────────────────
const COLOR = {
  surplus: '#10b981',
  deficit: '#f43f5e',
  balanced: '#f59e0b',
  hub: '#06b6d4',
};

const GLOW = {
  surplus: '0 0 12px 4px rgba(16,185,129,0.55)',
  deficit: '0 0 12px 4px rgba(244,63,94,0.55)',
  balanced: '0 0 12px 4px rgba(245,158,11,0.55)',
  hub: '0 0 24px 8px rgba(6,182,212,0.45)',
};

// ─── Utility ─────────────────────────────────────────────────────────────────
function getNodePositions(
  count: number,
  cx: number,
  cy: number,
  radius: number,
  startAngle = -Math.PI / 2
) {
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (i / count) * 2 * Math.PI;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

// ─── SVG House Icon ───────────────────────────────────────────────────────────
const HouseSVG: React.FC<{ status: string; size?: number }> = ({ status, size = 64 }) => {
  const borderColor =
    status === 'surplus' ? COLOR.surplus : status === 'deficit' ? COLOR.deficit : COLOR.balanced;
  const roofColor =
    status === 'surplus' ? '#064e3b' : status === 'deficit' ? '#4c0519' : '#451a03';
  const wallColor = status === 'surplus' ? '#ecfdf5' : status === 'deficit' ? '#fff1f2' : '#fffbeb';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 6px ${borderColor}aa)` }}
    >
      {/* House body */}
      <rect x="8" y="32" width="48" height="28" rx="3" fill={wallColor} stroke={borderColor} strokeWidth="1.5" />
      {/* Roof */}
      <polygon points="4,34 32,10 60,34" fill={roofColor} stroke={borderColor} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Door */}
      <rect x="26" y="46" width="12" height="14" rx="2" fill={borderColor} opacity="0.8" />
      {/* Door knob */}
      <circle cx="36" cy="53" r="1.2" fill="#fff" />
      {/* Left window */}
      <rect x="12" y="38" width="10" height="8" rx="1.5" fill="#bfdbfe" stroke={borderColor} strokeWidth="1" />
      <line x1="17" y1="38" x2="17" y2="46" stroke={borderColor} strokeWidth="0.8" />
      <line x1="12" y1="42" x2="22" y2="42" stroke={borderColor} strokeWidth="0.8" />
      {/* Right window */}
      <rect x="42" y="38" width="10" height="8" rx="1.5" fill="#bfdbfe" stroke={borderColor} strokeWidth="1" />
      <line x1="47" y1="38" x2="47" y2="46" stroke={borderColor} strokeWidth="0.8" />
      <line x1="42" y1="42" x2="52" y2="42" stroke={borderColor} strokeWidth="0.8" />
      {/* Solar panels on roof */}
      <g opacity="0.92">
        <rect x="14" y="22" width="10" height="6" rx="1" fill="#1e40af" stroke="#60a5fa" strokeWidth="0.8" />
        <line x1="19" y1="22" x2="19" y2="28" stroke="#60a5fa" strokeWidth="0.6" />
        <line x1="14" y1="25" x2="24" y2="25" stroke="#60a5fa" strokeWidth="0.6" />
        <rect x="27" y="18" width="10" height="6" rx="1" fill="#1e40af" stroke="#60a5fa" strokeWidth="0.8" />
        <line x1="32" y1="18" x2="32" y2="24" stroke="#60a5fa" strokeWidth="0.6" />
        <line x1="27" y1="21" x2="37" y2="21" stroke="#60a5fa" strokeWidth="0.6" />
        <rect x="40" y="22" width="10" height="6" rx="1" fill="#1e40af" stroke="#60a5fa" strokeWidth="0.8" />
        <line x1="45" y1="22" x2="45" y2="28" stroke="#60a5fa" strokeWidth="0.6" />
        <line x1="40" y1="25" x2="50" y2="25" stroke="#60a5fa" strokeWidth="0.6" />
      </g>
      {/* Chimney */}
      <rect x="46" y="12" width="5" height="10" rx="1" fill={roofColor} stroke={borderColor} strokeWidth="1" />
    </svg>
  );
};

// ─── Central Hub SVG ──────────────────────────────────────────────────────────
const CentralHub: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <div
      className="absolute rounded-full animate-ping"
      style={{
        width: size + 24,
        height: size + 24,
        background: 'rgba(6,182,212,0.18)',
        border: '1.5px solid rgba(6,182,212,0.35)',
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        width: size + 8,
        height: size + 8,
        background: 'rgba(6,182,212,0.10)',
        border: '1.5px solid rgba(6,182,212,0.5)',
        boxShadow: GLOW.hub,
      }}
    />
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#164e63" />
          <stop offset="100%" stopColor="#0c1a2e" />
        </radialGradient>
      </defs>
      <polygon
        points="40,4 72,22 72,58 40,76 8,58 8,22"
        fill="url(#hubGrad)"
        stroke="#06b6d4"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.7))' }}
      />
      <polygon points="40,12 64,26 64,54 40,68 16,54 16,26" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
      <path d="M44 22 L34 42 H42 L36 58 L52 36 H44 Z" fill="#06b6d4" style={{ filter: 'drop-shadow(0 0 4px #06b6d4)' }} />
    </svg>
  </div>
);

// ─── Floating Metadata Badge ──────────────────────────────────────────────────
const MetadataBadge: React.FC<{
  houseState: HouseEnergyState;
  isCurrentUser: boolean;
  visible: boolean;
}> = ({ houseState, isCurrentUser, visible }) => {
  const { house, owner, latest_reading, status, surplus_kwh, deficit_kwh } = houseState;

  const badgeColor =
    status === 'surplus'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : status === 'deficit'
      ? 'text-rose-600 bg-rose-50 border-rose-200'
      : 'text-amber-600 bg-amber-50 border-amber-200';

  const netColor =
    status === 'surplus' ? 'text-emerald-600' : status === 'deficit' ? 'text-rose-600' : 'text-amber-600';

  return (
    <div
      className="absolute pointer-events-none select-none transition-all duration-300"
      style={{
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 10,
        opacity: visible ? 1 : 0,
        zIndex: 30,
        minWidth: 160,
      }}
    >
      <div
        className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-2.5 text-[11px]"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.22)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-bold text-slate-900 text-[12px] truncate">
            {house.house_name}
            {isCurrentUser && <span className="ml-1 text-[10px] font-semibold text-cyan-600">(You)</span>}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${badgeColor}`}>
            {status}
          </span>
        </div>
        <p className="text-slate-400 text-[10px] mb-2 truncate">{owner.full_name}</p>
        <div className="space-y-1 border-t border-slate-100 pt-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Generated</span>
            <span className="font-semibold text-slate-800">{latest_reading.generation_kwh} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consumed</span>
            <span className="font-semibold text-slate-800">{latest_reading.consumption_kwh} kWh</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-100 pt-1">
            <span className="text-slate-600">
              {status === 'surplus' ? 'Surplus' : status === 'deficit' ? 'Deficit' : 'Balance'}
            </span>
            <span className={netColor}>
              {status === 'surplus' ? `+${surplus_kwh}` : status === 'deficit' ? `-${deficit_kwh}` : latest_reading.net_energy_kwh} kWh
            </span>
          </div>
        </div>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '7px solid white',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
        }}
      />
    </div>
  );
};

// ─── Energy Flow Lines (SVG overlay) ─────────────────────────────────────────
const EnergyFlowLines: React.FC<{
  positions: { x: number; y: number }[];
  houses: HouseEnergyState[];
  cx: number;
  cy: number;
  width: number;
  height: number;
}> = ({ positions, houses, cx, cy, width, height }) => {
  if (!width || !height) return null;
  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height} style={{ zIndex: 5 }}>
      <defs>
        <filter id="glow-surplus" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-deficit" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-balanced" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {positions.map((pos, i) => {
        const house = houses[i];
        if (!house) return null;
        const { status } = house;
        const color = status === 'surplus' ? COLOR.surplus : status === 'deficit' ? COLOR.deficit : COLOR.balanced;
        const filterId = `glow-${status}`;
        const animClass = status === 'surplus' ? 'energy-flow-surplus' : status === 'deficit' ? 'energy-flow-deficit' : 'energy-flow-balanced';
        const midX = (pos.x + cx) / 2;
        const midY = (pos.y + cy) / 2;
        const dx = cx - pos.x;
        const dy = cy - pos.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const perpX = (-dy / len) * 20;
        const perpY = (dx / len) * 20;
        const d = `M ${pos.x} ${pos.y} Q ${midX + perpX} ${midY + perpY} ${cx} ${cy}`;
        return (
          <g key={house.house.id}>
            <path d={d} stroke={color} strokeWidth="3" fill="none" opacity="0.18" strokeLinecap="round" />
            <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="8 5" filter={`url(#${filterId})`} className={animClass} opacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{
  totalGen: number;
  totalCons: number;
  netSurplus: number;
  netDeficit: number;
  houseCount: number;
  timeLabel: string;
}> = ({ totalGen, totalCons, netSurplus, netDeficit, houseCount, timeLabel }) => (
  <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10">
    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
      <ArrowUpRight className="w-4 h-4" />
      <span>Gen: {totalGen} kWh</span>
    </div>
    <div className="w-px h-4 bg-white/10" />
    <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
      <ArrowDownRight className="w-4 h-4" />
      <span>Load: {totalCons} kWh</span>
    </div>
    <div className="w-px h-4 bg-white/10" />
    <div className="text-xs text-slate-400 font-mono">
      {netSurplus > 0
        ? <span className="text-emerald-400">+{netSurplus} kWh net surplus</span>
        : <span className="text-rose-400">-{netDeficit} kWh net deficit</span>}
    </div>
    <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500 font-mono">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
      {houseCount} nodes · {timeLabel}
    </div>
  </div>
);

// ─── Legend Bar ───────────────────────────────────────────────────────────────
const LegendBar: React.FC = () => (
  <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-3 border-t border-white/10 text-[11px] font-semibold">
    <div className="flex items-center gap-2">
      <svg width="32" height="10"><line x1="0" y1="5" x2="32" y2="5" stroke={COLOR.surplus} strokeWidth="2.5" strokeDasharray="6 3" /></svg>
      <span className="text-emerald-400">Surplus Flow</span>
    </div>
    <div className="flex items-center gap-2">
      <svg width="32" height="10"><line x1="0" y1="5" x2="32" y2="5" stroke={COLOR.deficit} strokeWidth="2.5" strokeDasharray="6 3" /></svg>
      <span className="text-rose-400">Deficit Flow</span>
    </div>
    <div className="flex items-center gap-2">
      <svg width="32" height="10"><line x1="0" y1="5" x2="32" y2="5" stroke={COLOR.balanced} strokeWidth="2.5" strokeDasharray="6 3" /></svg>
      <span className="text-amber-400">Balanced Flow</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 rounded border-2 border-cyan-400 bg-cyan-950 inline-flex items-center justify-center">
        <Zap className="w-2.5 h-2.5 text-cyan-400" />
      </span>
      <span className="text-cyan-400">Microgrid Hub</span>
    </div>
  </div>
);

// ─── Props Interface ──────────────────────────────────────────────────────────
interface NeighbourhoodVisualizerProps {
  neighbourhoodState: NeighbourhoodState | null;
  onSelectHouse?: (houseState: HouseEnergyState) => void;
  currentUser?: UserProfile | null;
}

export const NeighbourhoodVisualizer: React.FC<NeighbourhoodVisualizerProps> = ({
  neighbourhoodState,
  onSelectHouse,
  currentUser,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const measure = useCallback((el: HTMLDivElement) => {
    setDims({ width: el.clientWidth, height: el.clientHeight });
  }, []);

  // Callback ref: fires every time the canvas div mounts or unmounts
  const canvasRef = useCallback(
    (el: HTMLDivElement | null) => {
      // Cleanup old observer
      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }
      containerRef.current = el;
      if (!el) return;
      // Immediately measure
      measure(el);
      // Watch for resizes
      const ro = new ResizeObserver(() => measure(el));
      ro.observe(el);
      roRef.current = ro;
    },
    [measure]
  );

  // Cleanup on unmount
  useEffect(() => () => { roRef.current?.disconnect(); }, []);


  if (!neighbourhoodState) {
    return (
      <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800">
        <div className="h-[580px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-700 border-t-cyan-400 animate-spin" />
            <span className="text-sm font-mono tracking-wide">Loading neighbourhood topology...</span>
          </div>
        </div>
      </div>
    );
  }

  const {
    houses,
    total_generation_kwh,
    total_consumption_kwh,
    net_surplus_kwh,
    net_deficit_kwh,
    time_label,
  } = neighbourhoodState;

  const { width, height } = dims;
  const cx = width / 2;
  const cy = height / 2;
  const radius = width < 500 ? 140 : width < 768 ? 190 : width < 1100 ? 235 : 275;
  const hubSize = width < 500 ? 64 : width < 768 ? 72 : 84;
  const houseSize = width < 500 ? 48 : width < 768 ? 56 : 64;
  const positions = getNodePositions(houses.length, cx, cy, radius);

  return (
    <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* Stats Header */}
      <StatsBar
        totalGen={total_generation_kwh}
        totalCons={total_consumption_kwh}
        netSurplus={net_surplus_kwh}
        netDeficit={net_deficit_kwh}
        houseCount={houses.length}
        timeLabel={time_label}
      />

      {/* Topology Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full"
        style={{ minHeight: 520, height: 'clamp(480px, 55vw, 640px)' }}
      >
        {/* Radial grid background */}
        {width > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={width}
            height={height}
            style={{ zIndex: 0 }}
          >
            {[0.3, 0.55, 0.8, 1.0].map((r) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={radius * r}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            ))}
            {positions.map((pos, i) => (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={pos.x}
                y2={pos.y}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            ))}
          </svg>
        )}

        {/* Energy Flow Lines */}
        {width > 0 && (
          <EnergyFlowLines
            positions={positions}
            houses={houses}
            cx={cx}
            cy={cy}
            width={width}
            height={height}
          />
        )}

        {/* Central Hub */}
        {width > 0 && (
          <div
            className="absolute flex flex-col items-center gap-1"
            style={{ left: cx, top: cy, transform: 'translate(-50%, -50%)', zIndex: 20 }}
          >
            <CentralHub size={hubSize} />
            <span
              className="text-[10px] font-bold text-cyan-400 tracking-widest font-mono"
              style={{ textShadow: '0 0 8px rgba(6,182,212,0.8)' }}
            >
              MICROGRID HUB
            </span>
          </div>
        )}

        {/* House Nodes */}
        {width > 0 &&
          positions.map((pos, i) => {
            const houseState = houses[i];
            if (!houseState) return null;
            const { house, status } = houseState;
            const isCurrentUser = !!(currentUser && currentUser.id === house.owner_id);
            const isHovered = hoveredId === house.id;
            const borderColor =
              status === 'surplus' ? COLOR.surplus : status === 'deficit' ? COLOR.deficit : COLOR.balanced;
            const glowShadow =
              status === 'surplus' ? GLOW.surplus : status === 'deficit' ? GLOW.deficit : GLOW.balanced;

            return (
              <div
                key={house.id}
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered ? 40 : 15,
                }}
                onClick={() => onSelectHouse && onSelectHouse(houseState)}
                onMouseEnter={() => setHoveredId(house.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <MetadataBadge
                  houseState={houseState}
                  isCurrentUser={isCurrentUser}
                  visible={isHovered}
                />
                <div
                  className="relative transition-transform duration-200 group-hover:scale-110"
                  style={{
                    borderRadius: 16,
                    border: `2px solid ${borderColor}`,
                    boxShadow: isHovered ? glowShadow : `0 0 6px 2px ${borderColor}33`,
                    background: 'rgba(15,23,42,0.85)',
                    padding: 6,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <HouseSVG status={status} size={houseSize} />
                  <span
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900"
                    style={{ background: borderColor, boxShadow: `0 0 6px ${borderColor}` }}
                  />
                </div>
                <div
                  className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                  style={{
                    background: 'rgba(15,23,42,0.8)',
                    border: `1px solid ${borderColor}55`,
                    color: borderColor,
                    textShadow: `0 0 6px ${borderColor}`,
                    backdropFilter: 'blur(4px)',
                    whiteSpace: 'nowrap',
                    maxWidth: 110,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {house.house_name}
                  {isCurrentUser && ' (You)'}
                </div>
              </div>
            );
          })}
      </div>

      {/* Legend Bar */}
      <LegendBar />
    </div>
  );
};
