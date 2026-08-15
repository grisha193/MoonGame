import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gameMeta = sqliteTable('game_meta', {
  id: text('id').primaryKey(),
  day: integer('day').notNull(),
  maxDays: integer('max_days').notNull(),
  money: integer('money').notNull(),
  rating: integer('rating').notNull(),
  selectedRoverId: text('selected_rover_id').notNull(),
  selectedOrderId: text('selected_order_id').notNull()
});

export const rovers = sqliteTable('rovers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  battery: integer('battery').notNull(),
  maxBattery: integer('max_battery').notNull(),
  capacity: integer('capacity').notNull(),
  status: text('status').notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  location: text('location').notNull()
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  weight: integer('weight').notNull(),
  reward: integer('reward').notNull(),
  urgency: integer('urgency').notNull(),
  zoneId: text('zone_id').notNull(),
  risk: integer('risk').notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  status: text('status').notNull()
});

export const deliveries = sqliteTable('deliveries', {
  id: text('id').primaryKey(),
  day: integer('day').notNull(),
  roverId: text('rover_id').notNull(),
  orderId: text('order_id').notNull(),
  zoneId: text('zone_id').notNull(),
  batteryCost: integer('battery_cost').notNull(),
  risk: integer('risk').notNull(),
  reward: integer('reward').notNull(),
  result: text('result').notNull()
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  day: integer('day').notNull(),
  type: text('type').notNull(),
  text: text('text').notNull()
});
