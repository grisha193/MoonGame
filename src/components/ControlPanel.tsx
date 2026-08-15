import React from 'react';
import { AlertTriangle, Battery, CheckCircle2, Package, Play, RefreshCcw, Truck, Weight } from 'lucide-react';
import type { Order, RouteEstimate, Rover } from '../../shared/game';
import { canDeliver } from '../../shared/game';
import { orderClass, orderName, statusClass, statusName } from '../utils/status';
import { SectionLabel } from './ui/SectionLabel';
import { MiniDark } from './ui/MiniDark';

export function ControlPanel(props: {
  rovers: Rover[];
  orders: Order[];
  selectedRoverId: string;
  selectedOrderId: string;
  route: RouteEstimate | null;
  impossibleReason: string;
  busy: boolean;
  gameOver: boolean;
  error: string;
  onSelectRover: (id: string) => void;
  onSelectOrder: (id: string) => void;
  onLaunch: () => void;
  onNextDay: () => void;
  onReset: () => void;
}) {
  const selectedRover = props.rovers.find((rover) => rover.id === props.selectedRoverId);
  const selectedOrder = props.orders.find((order) => order.id === props.selectedOrderId);

  return (
    <div className="rounded-lg border border-white/80 bg-white p-3 shadow-panel sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">Центр управления</h2>
        <button
          type="button"
          onClick={props.onReset}
          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          title="Новая игра"
        >
          <RefreshCcw size={17} />
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-950 p-3 text-white shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md bg-white/8 px-3 py-2">
            <div className="text-[11px] font-black uppercase text-cyan-200">Ровер</div>
            <div className="mt-1 truncate text-sm font-black">{selectedRover?.name ?? '-'}</div>
          </div>
          <div className="rounded-md bg-white/8 px-3 py-2">
            <div className="text-[11px] font-black uppercase text-amber-200">Заказ</div>
            <div className="mt-1 truncate text-sm font-black">{selectedOrder?.title ?? '-'}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <MiniDark label="Награда" value={props.route ? `${props.route.expectedReward} cr` : '-'} />
          <MiniDark label="Батарея" value={props.route ? `${props.route.batteryCost}%` : '-'} />
          <MiniDark label="Риск" value={props.route ? `${props.route.risk}%` : '-'} warn={Boolean(props.route && props.route.risk > 55)} />
        </div>

        {props.impossibleReason ? (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-rose-300/30 bg-rose-400/15 px-3 py-2 text-sm font-bold text-rose-100">
            <AlertTriangle size={17} />
            {props.impossibleReason}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-400/15 px-3 py-2 text-sm font-bold text-emerald-100">
            <CheckCircle2 size={17} />
            Рейс возможен
          </div>
        )}
        {props.error && (
          <div className="mt-2 rounded-md border border-rose-300/30 bg-rose-400/15 px-3 py-2 text-sm font-bold text-rose-100">
            {props.error}
          </div>
        )}

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={props.onLaunch}
            disabled={props.gameOver || props.busy || !props.route || !canDeliver(props.route)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 font-black text-slate-950 shadow-sm hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Play size={18} />
            Запустить
          </button>
          <button
            type="button"
            onClick={props.onNextDay}
            disabled={props.gameOver || props.busy}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 font-black text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            День
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <SectionLabel icon={<Truck size={16} />} text="Ровер" />
          <div className="mt-2 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            {props.rovers.map((rover) => (
              <button
                key={rover.id}
                type="button"
                onClick={() => props.onSelectRover(rover.id)}
                className={`rounded-lg border p-2.5 text-left transition ${
                  rover.id === props.selectedRoverId ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black">{rover.name}</span>
                  <span className={`rounded px-2 py-1 text-xs font-black ${statusClass(rover.status)}`}>{statusName(rover.status)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Battery size={15} /> {rover.battery}/{rover.maxBattery}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Weight size={15} /> {rover.capacity} кг
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel icon={<Package size={16} />} text="Заказ" />
          <div className="mt-2 grid max-h-[360px] gap-2 overflow-auto pr-1">
            {props.orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => props.onSelectOrder(order.id)}
                className={`rounded-lg border p-2.5 text-left transition ${
                  order.id === props.selectedOrderId ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-black leading-tight">{order.title}</span>
                  <span className={`rounded px-2 py-1 text-xs font-black ${orderClass(order.status)}`}>{orderName(order.status)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                  <span>{order.weight} кг</span>
                  <span>{order.reward} cr</span>
                  <span>срочность {order.urgency}</span>
                  <span>риск {order.risk}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
