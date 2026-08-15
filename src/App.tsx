import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, CircleDollarSign, Gauge, RadioTower } from 'lucide-react';
import type { GameState, Zone } from '../shared/game';
import { calcRoute, getImpossibleReason } from '../shared/game';
import { MoonMap } from './components/MoonMap';
import { ControlPanel } from './components/ControlPanel';
import { Objective } from './components/Objective';
import { EventLog } from './components/EventLog';
import { Stat } from './components/ui/Stat';

export type ApiGameState = GameState & { zones: Zone[] };

export function App() {
  const [game, setGame] = useState<ApiGameState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadGame();
  }, []);

  async function loadGame() {
    setError('');
    const response = await fetch('/api/game');
    if (!response.ok) {
      setError('Сервер игры недоступен');
      return;
    }
    setGame(await response.json());
  }

  async function postState(path: string, body?: unknown) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? 'Команда не выполнена');
        return;
      }
      setGame(payload.state ?? payload);
    } finally {
      setBusy(false);
    }
  }

  const selectedRover = game?.rovers.find((rover) => rover.id === game.selectedRoverId) ?? game?.rovers[0];
  const selectedOrder = game?.orders.find((order) => order.id === game.selectedOrderId) ?? game?.orders[0];
  const route = useMemo(
    () => (selectedRover && selectedOrder ? calcRoute(selectedOrder, selectedRover) : null),
    [selectedOrder, selectedRover]
  );

  if (!game) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef2f3] px-4 text-slate-950">
        <div className="rounded-lg border border-white bg-white p-6 text-center shadow-panel">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cyan-100 text-cyan-800">
            <RadioTower />
          </div>
          <h1 className="mt-4 text-2xl font-black">Moon Delivery Ops</h1>
          <p className="mt-2 font-semibold text-slate-600">{error || 'Подключаемся к базе Луны...'}</p>
          <button type="button" onClick={loadGame} className="mt-4 rounded-lg bg-cyan-700 px-4 py-2 font-black text-white">
            Повторить
          </button>
        </div>
      </main>
    );
  }

  const completedCount = game.orders.filter((order) => order.status === 'delivered').length;
  const activeOrders = game.orders.filter((order) => order.status === 'open');
  const gameOver = game.day > game.maxDays || game.rating <= 0;
  const impossibleReason = route ? getImpossibleReason(route) : '';

  return (
    <main className="min-h-screen overflow-y-auto bg-[#eef2f3] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col gap-5 px-4 py-4 lg:px-6 lg:py-5">
        <header className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-700">
              <RadioTower size={17} />
              Moon Delivery Ops
            </div>
            <h1 className="mt-1 text-2xl font-black sm:text-4xl">Лунная доставка пайков</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={<CalendarDays size={18} />} label="День" value={`${Math.min(game.day, game.maxDays)}/${game.maxDays}`} />
            <Stat icon={<CircleDollarSign size={18} />} label="Кредиты" value={game.money} />
            <Stat icon={<Gauge size={18} />} label="Рейтинг" value={`${game.rating}%`} />
            <Stat icon={<CheckCircle2 size={18} />} label="Доставки" value={completedCount} />
          </div>
        </header>

        <section className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_440px]">
          <div className="grid gap-4">
            <MoonMap
              game={game}
              route={route}
              onSelectOrder={(id) => postState('/api/select', { orderId: id })}
            />
            <EventLog events={game.events} />
          </div>

          <aside className="grid gap-4 pb-8 xl:sticky xl:top-5">
            <ControlPanel
              rovers={game.rovers}
              orders={game.orders}
              selectedRoverId={game.selectedRoverId}
              selectedOrderId={game.selectedOrderId}
              route={route}
              impossibleReason={impossibleReason}
              busy={busy}
              gameOver={gameOver}
              error={error}
              onSelectRover={(id) => postState('/api/select', { roverId: id })}
              onSelectOrder={(id) => postState('/api/select', { orderId: id })}
              onLaunch={() => postState('/api/deliveries', { roverId: game.selectedRoverId, orderId: game.selectedOrderId })}
              onNextDay={() => postState('/api/day')}
              onReset={() => postState('/api/reset')}
            />
            <Objective game={game} activeOrders={activeOrders.length} gameOver={gameOver} />
          </aside>
        </section>
      </div>
    </main>
  );
}
