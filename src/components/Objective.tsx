import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { GameState } from '../../shared/game';

export function Objective({ game, activeOrders, gameOver }: { game: GameState; activeOrders: number; gameOver: boolean }) {
  const result =
    game.rating <= 0
      ? 'База потеряла доверие экипажей.'
      : game.day > game.maxDays
        ? `Смена завершена: ${game.money} cr и рейтинг ${game.rating}%.`
        : `Осталось дней: ${Math.max(0, game.maxDays - game.day + 1)}. Открытых заказов: ${activeOrders}.`;

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${gameOver ? 'border-amber-300 bg-amber-50' : 'border-white/80 bg-white'}`}>
      <div className="flex items-center gap-2 font-black">
        <ShieldAlert size={18} />
        Цель смены
      </div>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
        Заработать максимум за 7 дней, не уронив рейтинг базы до нуля. Срочные заказы портятся, тяжёлые грузы тратят больше батареи,
        опасные зоны могут сорвать рейс.
      </p>
      <div className="mt-3 rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white">{result}</div>
    </div>
  );
}
