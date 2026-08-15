import { describe, expect, it } from 'vitest';
import { calcRoute, canDeliver, createInitialGameState, launchDelivery } from '../shared/game.js';

const idFactory = (() => {
  let id = 0;
  return () => `test-${++id}`;
})();

describe('moon delivery rules', () => {
  it('makes heavier cargo consume more battery on comparable routes', () => {
    const state = createInitialGameState(idFactory);
    const rover = state.rovers[1];
    const light = state.orders[0];
    const heavy = { ...light, weight: light.weight + 40 };

    expect(calcRoute(heavy, rover).batteryCost).toBeGreaterThan(calcRoute(light, rover).batteryCost);
  });

  it('blocks delivery when cargo is above rover capacity', () => {
    const state = createInitialGameState(idFactory);
    const rover = state.rovers[0];
    const impossibleOrder = state.orders.find((order) => order.id === 'o-105');
    if (!impossibleOrder) throw new Error('fixture missing');

    const route = calcRoute(impossibleOrder, rover);

    expect(route.canCarry).toBe(false);
    expect(canDeliver(route)).toBe(false);
  });

  it('updates money, battery, order status and deliveries after a launch', () => {
    const state = createInitialGameState(idFactory);
    const rover = state.rovers[0];
    const order = state.orders[0];
    const route = calcRoute(order, rover);

    const next = launchDelivery(state, rover.id, order.id, idFactory);

    expect(next.money).toBe(state.money + route.expectedReward);
    expect(next.rovers.find((item) => item.id === rover.id)?.battery).toBe(rover.battery - route.batteryCost);
    expect(next.orders.find((item) => item.id === order.id)?.status).toBe('delivered');
    expect(next.deliveries).toHaveLength(1);
    expect(next.events[0].type).toBe('success');
  });
});
