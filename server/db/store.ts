import Database from 'better-sqlite3';
import { desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Delivery, EventType, GameState, Order, OrderStatus, Rover, RoverStatus } from '../../shared/game.js';
import { createInitialGameState } from '../../shared/game.js';
import { deliveries, events, gameMeta, orders, rovers } from './schema.js';

const DEFAULT_DB = './data/moon-delivery.sqlite';

export function createStore(databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DB) {
  const dbPath = resolve(databaseUrl);
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  const db = drizzle(sqlite);

  function migrate() {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS game_meta (
        id TEXT PRIMARY KEY,
        day INTEGER NOT NULL,
        max_days INTEGER NOT NULL,
        money INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        selected_rover_id TEXT NOT NULL,
        selected_order_id TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rovers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        battery INTEGER NOT NULL,
        max_battery INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        status TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        location TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        weight INTEGER NOT NULL,
        reward INTEGER NOT NULL,
        urgency INTEGER NOT NULL,
        zone_id TEXT NOT NULL,
        risk INTEGER NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id TEXT PRIMARY KEY,
        day INTEGER NOT NULL,
        rover_id TEXT NOT NULL,
        order_id TEXT NOT NULL,
        zone_id TEXT NOT NULL,
        battery_cost INTEGER NOT NULL,
        risk INTEGER NOT NULL,
        reward INTEGER NOT NULL,
        result TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        day INTEGER NOT NULL,
        type TEXT NOT NULL,
        text TEXT NOT NULL
      );
    `);
  }

  function read(): GameState {
    const [meta] = db.select().from(gameMeta).all();
    if (!meta) {
      const fresh = createInitialGameState();
      write(fresh);
      return fresh;
    }

    return {
      day: meta.day,
      maxDays: meta.maxDays,
      money: meta.money,
      rating: meta.rating,
      selectedRoverId: meta.selectedRoverId,
      selectedOrderId: meta.selectedOrderId,
      rovers: db.select().from(rovers).all().map(toRover),
      orders: db.select().from(orders).all().map(toOrder),
      deliveries: db.select().from(deliveries).orderBy(desc(deliveries.day)).all().map(toDelivery),
      events: db.select().from(events).orderBy(desc(events.day)).all().map(toEvent)
    };
  }

  function write(state: GameState) {
    sqlite.transaction(() => {
      db.delete(gameMeta).run();
      db.delete(rovers).run();
      db.delete(orders).run();
      db.delete(deliveries).run();
      db.delete(events).run();

      db.insert(gameMeta)
        .values({
          id: 'current',
          day: state.day,
          maxDays: state.maxDays,
          money: state.money,
          rating: state.rating,
          selectedRoverId: state.selectedRoverId,
          selectedOrderId: state.selectedOrderId
        })
        .run();
      db.insert(rovers).values(state.rovers).run();
      db.insert(orders).values(state.orders).run();
      if (state.deliveries.length) db.insert(deliveries).values(state.deliveries).run();
      if (state.events.length) db.insert(events).values(state.events).run();
    })();
  }

  function reset() {
    const fresh = createInitialGameState();
    write(fresh);
    return fresh;
  }

  migrate();

  return {
    read,
    write,
    reset,
    close: () => sqlite.close()
  };
}

function toRover(row: typeof rovers.$inferSelect): Rover {
  return { ...row, status: row.status as RoverStatus };
}

function toOrder(row: typeof orders.$inferSelect): Order {
  return { ...row, zoneId: row.zoneId, status: row.status as OrderStatus };
}

function toDelivery(row: typeof deliveries.$inferSelect): Delivery {
  return {
    id: row.id,
    day: row.day,
    roverId: row.roverId,
    orderId: row.orderId,
    zoneId: row.zoneId,
    batteryCost: row.batteryCost,
    risk: row.risk,
    reward: row.reward,
    result: row.result as Delivery['result']
  };
}

function toEvent(row: typeof events.$inferSelect) {
  return { ...row, type: row.type as EventType };
}
