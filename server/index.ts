import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import Fastify from 'fastify';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { advanceDay, calcRoute, canDeliver, getImpossibleReason, launchDelivery, zones } from '../shared/game.js';
import { createStore } from './db/store.js';

const app = Fastify({ logger: true });
const store = createStore();

function withZones(state: ReturnType<typeof store.read>) {
  return {
    ...state,
    zones
  };
}

await app.register(cors, {
  origin: true
});

const staticRoot = resolve('dist');
if (existsSync(staticRoot)) {
  await app.register(staticFiles, {
    root: staticRoot,
    wildcard: false
  });
}

app.get('/api/game', async () => {
  return withZones(store.read());
});

app.post('/api/select', async (request, reply) => {
  const schema = z.object({
    roverId: z.string().optional(),
    orderId: z.string().optional()
  });
  const body = schema.parse(request.body);
  const current = store.read();
  const next = {
    ...current,
    selectedRoverId: body.roverId ?? current.selectedRoverId,
    selectedOrderId: body.orderId ?? current.selectedOrderId
  };
  store.write(next);
  return withZones(next);
});

app.post('/api/deliveries', async (request, reply) => {
  const schema = z.object({
    roverId: z.string(),
    orderId: z.string()
  });
  const body = schema.parse(request.body);

  try {
    const next = launchDelivery(store.read(), body.roverId, body.orderId);
    store.write(next);
    return { ok: true, state: withZones(next) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Доставка невозможна';
    return reply.code(409).send({ ok: false, message });
  }
});

app.post('/api/day', async () => {
  const next = advanceDay(store.read());
  store.write(next);
  return withZones(next);
});

app.post('/api/reset', async () => {
  return withZones(store.reset());
});

app.get('/api/route/:roverId/:orderId', async (request, reply) => {
  const params = z.object({ roverId: z.string(), orderId: z.string() }).parse(request.params);
  const state = store.read();
  const rover = state.rovers.find((item) => item.id === params.roverId);
  const order = state.orders.find((item) => item.id === params.orderId);
  if (!rover || !order) return reply.code(404).send({ message: 'Ровер или заказ не найден' });
  const route = calcRoute(order, rover);
  return {
    ...route,
    possible: canDeliver(route),
    impossibleReason: getImpossibleReason(route)
  };
});

if (existsSync(staticRoot)) {
  app.get('*', async (_request, reply) => reply.sendFile('index.html'));
}

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
