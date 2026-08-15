import React from 'react';
import { Compass, Package, Rocket, Truck } from 'lucide-react';
import type { RouteEstimate, Zone } from '../../shared/game';
import { basePoint } from '../../shared/game';
import type { ApiGameState } from '../App';
import { MapMetric } from './ui/MapMetric';

const zoneStyles: Record<string, { style: React.CSSProperties; fill: string; stroke: string; badgeIdle: string }> = {
  mare: {
    style: { left: '9%', top: '13%', width: '36%', height: '32%' },
    fill: 'linear-gradient(155deg, rgba(203,213,225,.16), rgba(203,213,225,.03))',
    stroke: 'rgba(226,232,240,.28)',
    badgeIdle: 'bg-slate-200/90 text-slate-900'
  },
  craters: {
    style: { left: '41%', top: '10%', width: '45%', height: '38%' },
    fill: 'linear-gradient(155deg, rgba(168,140,120,.20), rgba(120,100,90,.04))',
    stroke: 'rgba(214,190,170,.26)',
    badgeIdle: 'bg-stone-200/90 text-stone-900'
  },
  ridge: {
    style: { left: '17%', top: '51%', width: '39%', height: '35%' },
    fill: 'linear-gradient(155deg, rgba(103,232,249,.14), rgba(34,211,238,.03))',
    stroke: 'rgba(165,243,252,.28)',
    badgeIdle: 'bg-cyan-200/90 text-cyan-950'
  },
  shadow: {
    style: { left: '57%', top: '50%', width: '34%', height: '36%' },
    fill: 'linear-gradient(155deg, rgba(24,24,27,.55), rgba(24,24,27,.15))',
    stroke: 'rgba(161,161,170,.22)',
    badgeIdle: 'bg-zinc-300/90 text-zinc-900'
  }
};

const moonCraters = [
  { id: 'c-1', cx: 18, cy: 18, rx: 4.6, tone: 'light' },
  { id: 'c-2', cx: 66, cy: 22, rx: 6.4, tone: 'mid' },
  { id: 'c-3', cx: 82, cy: 72, rx: 7.6, tone: 'dark' },
  { id: 'c-4', cx: 39, cy: 74, rx: 5.6, tone: 'mid' },
  { id: 'c-5', cx: 57, cy: 56, rx: 3.2, tone: 'dark' },
  { id: 'c-6', cx: 12, cy: 82, rx: 2.7, tone: 'light' },
  { id: 'c-7', cx: 91, cy: 18, rx: 2.4, tone: 'mid' },
  { id: 'c-8', cx: 49, cy: 38, rx: 2, tone: 'light' }
];

const starDust = [
  { x: 6, y: 8, r: 0.35, o: 0.55 }, { x: 14, y: 4, r: 0.22, o: 0.4 }, { x: 27, y: 9, r: 0.3, o: 0.5 },
  { x: 35, y: 3, r: 0.18, o: 0.35 }, { x: 5, y: 45, r: 0.25, o: 0.45 }, { x: 3, y: 66, r: 0.32, o: 0.5 },
  { x: 92, y: 6, r: 0.3, o: 0.5 }, { x: 96, y: 30, r: 0.22, o: 0.4 }, { x: 88, y: 55, r: 0.28, o: 0.45 },
  { x: 94, y: 88, r: 0.24, o: 0.4 }, { x: 62, y: 6, r: 0.2, o: 0.35 }, { x: 73, y: 4, r: 0.3, o: 0.5 },
  { x: 45, y: 92, r: 0.3, o: 0.5 }, { x: 28, y: 95, r: 0.22, o: 0.4 }, { x: 8, y: 93, r: 0.26, o: 0.42 },
  { x: 70, y: 90, r: 0.24, o: 0.4 }, { x: 55, y: 8, r: 0.2, o: 0.35 }, { x: 20, y: 62, r: 0.18, o: 0.3 }
];

export function MoonMap({
  game,
  route,
  onSelectOrder
}: {
  game: ApiGameState;
  route: RouteEstimate | null;
  onSelectOrder: (id: string) => void;
}) {
  const selectedOrder = game.orders.find((order) => order.id === game.selectedOrderId);
  const mapZones: Zone[] = game.zones ?? [];
  const selectedZone = selectedOrder ? mapZones.find((zone) => zone.id === selectedOrder.zoneId) : undefined;

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/80 bg-[#171d27] shadow-panel xl:h-[calc(100vh-142px)] xl:min-h-[640px]">
      <style>{`
        @keyframes moonmap-dash { to { stroke-dashoffset: -12; } }
        @keyframes moonmap-radar { to { transform: rotate(360deg); } }
        @keyframes moonmap-ring { 0% { transform: scale(0.85); opacity: .75; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes moonmap-twinkle { 0%, 100% { opacity: .25; } 50% { opacity: .9; } }
        .moonmap-route-dash { animation: moonmap-dash 1.1s linear infinite; }
        .moonmap-radar-sweep { animation: moonmap-radar 4.5s linear infinite; transform-origin: 50% 50%; }
        .moonmap-danger-ring { animation: moonmap-ring 2.2s ease-out infinite; }
        .moonmap-star { animation: moonmap-twinkle 3.6s ease-in-out infinite; }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 22% 28%, rgba(56,74,98,.55), transparent 60%), radial-gradient(90% 70% at 85% 80%, rgba(30,38,52,.6), transparent 55%), linear-gradient(160deg, #232c3a 0%, #171d27 55%, #10141c 100%)'
        }}
      />
      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="craterLight" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="rgba(255,255,255,.32)" />
            <stop offset="45%" stopColor="rgba(210,215,224,.08)" />
            <stop offset="100%" stopColor="rgba(10,14,20,.4)" />
          </radialGradient>
          <radialGradient id="craterMid" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="rgba(255,255,255,.2)" />
            <stop offset="45%" stopColor="rgba(160,168,182,.06)" />
            <stop offset="100%" stopColor="rgba(6,9,14,.48)" />
          </radialGradient>
          <radialGradient id="craterDark" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="rgba(255,255,255,.1)" />
            <stop offset="50%" stopColor="rgba(90,96,110,.05)" />
            <stop offset="100%" stopColor="rgba(3,5,8,.6)" />
          </radialGradient>
        </defs>
        <path d="M5 63 C20 52, 32 60, 46 48 S77 39, 95 47" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="0.3" />
        <path d="M14 29 C26 36, 36 34, 48 25 S74 17, 89 29" fill="none" stroke="rgba(4,7,12,.35)" strokeWidth="0.5" />
        <path d="M9 88 C24 80, 38 88, 55 78 S81 68, 96 77" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="0.3" />
        {starDust.map((star, i) => (
          <circle
            key={i}
            className="moonmap-star"
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="rgba(226,240,255,.9)"
            style={{ opacity: star.o, animationDelay: `${(i % 6) * 0.5}s` }}
          />
        ))}
        {moonCraters.map((crater) => (
          <ellipse
            key={crater.id}
            cx={crater.cx}
            cy={crater.cy}
            rx={crater.rx}
            ry={crater.rx * 0.82}
            fill={`url(#crater${crater.tone === 'light' ? 'Light' : crater.tone === 'mid' ? 'Mid' : 'Dark'})`}
            stroke="rgba(0,0,0,.25)"
            strokeWidth="0.15"
          />
        ))}
      </svg>

      <div className="absolute left-4 top-4 z-40 rounded-lg border border-white/15 bg-slate-950/62 px-3 py-2 text-white shadow-lg backdrop-blur">
        <div className="text-xs font-black uppercase text-cyan-200">Карта маршрутов</div>
        <div className="mt-1 text-[11px] font-semibold text-white/65">Зоны меняют скорость, расход и риск рейса</div>
      </div>
      {selectedOrder && selectedZone && route && (
        <div className="absolute right-4 top-4 z-40 w-[min(280px,calc(100%-32px))] rounded-lg border border-white/15 bg-slate-950/72 p-3 text-white shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase text-amber-200">Активная точка</div>
              <div className="mt-1 text-sm font-black leading-tight">{selectedOrder.title}</div>
            </div>
            <div className={`rounded px-2 py-1 text-[11px] font-black ${route.risk > 60 ? 'bg-rose-400 text-slate-950' : route.risk > 42 ? 'bg-amber-300 text-slate-950' : 'bg-cyan-200 text-cyan-950'}`}>
              {route.risk}%
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-white/70">
            <span>{selectedZone.name}</span>
            <span>{selectedOrder.weight} кг</span>
            <span>{route.batteryCost}%</span>
          </div>
        </div>
      )}

      <div className="absolute left-[24%] top-[34%] z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-[-34px] overflow-hidden rounded-full opacity-70">
          <div
            className="moonmap-radar-sweep h-full w-full"
            style={{ background: 'conic-gradient(from 0deg, rgba(103,232,249,.35), transparent 30%)' }}
          />
        </div>
        <div className="absolute inset-[-18px] rounded-full border border-cyan-200/35" />
        <div className="absolute inset-[-32px] rounded-full border border-cyan-200/15" />
        <div
          className="relative grid h-16 w-16 place-items-center rounded-full border-4 border-cyan-200 text-cyan-50 shadow-[0_0_32px_rgba(103,232,249,0.55)]"
          style={{ background: 'radial-gradient(circle at 35% 30%, #164e63, #05202c)' }}
        >
          <Rocket size={29} />
        </div>
        <div className="mt-2 rounded bg-gradient-to-b from-cyan-100 to-cyan-200 px-2 py-1 text-center text-xs font-black text-cyan-950 shadow">БАЗА</div>
      </div>

      {mapZones.map((zone) => {
        const visual = zoneStyles[zone.id] ?? zoneStyles.mare;
        return (
          <div
            key={zone.id}
            className="absolute rounded-lg border border-dashed p-3 shadow-[inset_0_0_40px_rgba(255,255,255,0.04)] backdrop-blur-[1px] transition"
            style={{ ...visual.style, background: visual.fill, borderColor: visual.stroke }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-white/85">
                <Compass size={12} className="opacity-70" />
                {zone.name}
              </div>
              <div className={`rounded px-2 py-1 text-[10px] font-black ${zone.risk > 30 ? 'bg-rose-400 text-slate-950' : zone.risk > 15 ? 'bg-amber-300 text-slate-950' : 'bg-cyan-200 text-cyan-950'}`}>
                {zone.risk}%
              </div>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-white/60">
              скорость x{zone.speed}
            </div>
          </div>
        );
      })}

      {selectedOrder && route && (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGlow" x1={basePoint.x} y1={basePoint.y} x2={selectedOrder.x} y2={selectedOrder.y} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(165,243,252,.95)" />
              <stop offset="100%" stopColor="rgba(251,191,36,.9)" />
            </linearGradient>
          </defs>
          {route.risk > 50 && (
            <line
              x1={basePoint.x}
              y1={basePoint.y}
              x2={selectedOrder.x}
              y2={selectedOrder.y}
              stroke="rgba(251,113,133,.3)"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          )}
          <line
            x1={basePoint.x}
            y1={basePoint.y}
            x2={selectedOrder.x}
            y2={selectedOrder.y}
            stroke="rgba(8,15,25,.85)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            className="moonmap-route-dash"
            x1={basePoint.x}
            y1={basePoint.y}
            x2={selectedOrder.x}
            y2={selectedOrder.y}
            stroke="url(#routeGlow)"
            strokeWidth="0.75"
            strokeDasharray="2.4 1.6"
            strokeLinecap="round"
          />
          <circle cx={basePoint.x} cy={basePoint.y} r="1.1" fill="rgba(165,243,252,.95)" />
          <circle cx={selectedOrder.x} cy={selectedOrder.y} r="1.05" fill="rgba(251,191,36,.95)" />
        </svg>
      )}

      {game.orders.map((order) => (
        <div key={order.id} className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${order.x}%`, top: `${order.y}%` }}>
          {order.status === 'open' && order.risk > 35 && (
            <div className="moonmap-danger-ring pointer-events-none absolute inset-[-9px] rounded-full border border-rose-300/70" />
          )}
          {order.id === game.selectedOrderId && <div className="absolute inset-[-10px] rounded-full border-2 border-amber-200/70 shadow-[0_0_26px_rgba(251,191,36,0.65)]" />}
          <button
            type="button"
            className={`relative rounded-full border-2 p-2 text-left shadow-lg transition hover:scale-105 ${
              order.id === game.selectedOrderId
                ? 'border-amber-200 bg-amber-400 text-slate-950'
                : order.status === 'open'
                  ? 'border-white/80 bg-white text-slate-950'
                  : order.status === 'delivered'
                    ? 'border-emerald-200 bg-emerald-500 text-white'
                    : 'border-rose-200 bg-rose-600 text-white'
            }`}
            onClick={() => onSelectOrder(order.id)}
            aria-label={order.title}
            title={order.title}
          >
            <Package size={18} />
          </button>
          {order.status === 'open' && (
            <div className={`absolute -right-3 -top-3 rounded px-1.5 py-0.5 text-[10px] font-black shadow ${order.risk > 35 ? 'bg-rose-400 text-slate-950' : order.risk > 18 ? 'bg-amber-300 text-slate-950' : 'bg-cyan-200 text-cyan-950'}`}>
              {order.risk}
            </div>
          )}
          {order.id === game.selectedOrderId && (
            <div className="absolute left-1/2 top-10 w-40 -translate-x-1/2 rounded-md border border-amber-200/50 bg-slate-950/82 px-2 py-1 text-center text-[11px] font-black leading-tight text-white shadow-lg backdrop-blur">
              {order.weight} кг | {order.reward} cr | риск {order.risk}%
            </div>
          )}
        </div>
      ))}

      {game.rovers.map((rover) => (
        <div
          key={rover.id}
          className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-xs font-black shadow-lg ${
            rover.id === game.selectedRoverId ? 'border-lime-200 bg-lime-300 text-slate-950' : 'border-white/60 bg-slate-950/85 text-white'
          }`}
          style={{ left: `${rover.x}%`, top: `${rover.y + 7}%` }}
        >
          <span className="inline-flex items-center gap-1">
            <Truck size={13} />
            {rover.name}
          </span>
          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/25">
            <span
              className={`block h-full rounded-full bg-gradient-to-r ${
                rover.battery < 25 ? 'from-rose-500 to-rose-300' : rover.battery < 55 ? 'from-amber-500 to-amber-300' : 'from-lime-500 to-lime-300'
              }`}
              style={{ width: `${Math.max(6, rover.battery)}%` }}
            />
          </span>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 z-40 grid gap-2 rounded-lg border border-white/20 bg-slate-950/72 p-3 text-white shadow-lg backdrop-blur md:grid-cols-3">
        <MapMetric label="Маршрут" value={route ? `${route.distance} км / ${route.tripHours} ч` : 'выберите заказ'} />
        <MapMetric label="Расход" value={route ? `${route.batteryCost}% батареи` : '-'} />
        <MapMetric label="Итоговый риск" value={route ? `${route.risk}%` : '-'} warn={Boolean(route && route.risk > 55)} />
      </div>
    </div>
  );
}
