export type RoverStatus = 'ready' | 'charging' | 'maintenance';
export type OrderStatus = 'open' | 'delivered' | 'failed' | 'expired';
export type EventType = 'system' | 'success' | 'danger';
export type DeliveryResult = 'success' | 'failed';

export type Zone = {
  id: string;
  name: string;
  speed: number;
  risk: number;
};

export type Rover = {
  id: string;
  name: string;
  battery: number;
  maxBattery: number;
  capacity: number;
  status: RoverStatus;
  x: number;
  y: number;
  location: string;
};

export type Order = {
  id: string;
  title: string;
  weight: number;
  reward: number;
  urgency: number;
  zoneId: string;
  risk: number;
  x: number;
  y: number;
  status: OrderStatus;
};

export type Delivery = {
  id: string;
  day: number;
  roverId: string;
  orderId: string;
  zoneId: string;
  batteryCost: number;
  risk: number;
  reward: number;
  result: DeliveryResult;
};

export type GameEvent = {
  id: string;
  day: number;
  type: EventType;
  text: string;
};

export type GameState = {
  day: number;
  maxDays: number;
  money: number;
  rating: number;
  selectedRoverId: string;
  selectedOrderId: string;
  rovers: Rover[];
  orders: Order[];
  deliveries: Delivery[];
  events: GameEvent[];
};

export type RouteEstimate = {
  zone: Zone;
  distance: number;
  batteryCost: number;
  tripHours: number;
  risk: number;
  expectedReward: number;
  canCarry: boolean;
  hasBattery: boolean;
  isReady: boolean;
};

export const basePoint = { x: 24, y: 34 };

export const zones: Zone[] = [
  { id: 'mare', name: 'Море Спокойствия', speed: 1, risk: 8 },
  { id: 'craters', name: 'Кратерный пояс', speed: 0.62, risk: 24 },
  { id: 'ridge', name: 'Хребет Артемиды', speed: 0.72, risk: 18 },
  { id: 'shadow', name: 'Теневая низина', speed: 0.48, risk: 34 }
];

export const initialRovers: Rover[] = [
  { id: 'r-1', name: 'Selena-3', battery: 92, maxBattery: 100, capacity: 42, status: 'ready', x: 24, y: 34, location: 'base' },
  { id: 'r-2', name: 'Borey-7', battery: 63, maxBattery: 90, capacity: 68, status: 'ready', x: 24, y: 34, location: 'base' },
  { id: 'r-3', name: 'Luna Mule', battery: 38, maxBattery: 80, capacity: 115, status: 'maintenance', x: 24, y: 34, location: 'base' }
];

export const initialOrders: Order[] = [
  { id: 'o-101', title: 'Пайки для купола Геологов', weight: 24, reward: 210, urgency: 3, zoneId: 'mare', risk: 8, x: 32, y: 24, status: 'open' },
  { id: 'o-102', title: 'Запас воды на буровую', weight: 54, reward: 430, urgency: 2, zoneId: 'craters', risk: 26, x: 71, y: 27, status: 'open' },
  { id: 'o-103', title: 'Термоконтейнер в ущелье', weight: 38, reward: 380, urgency: 1, zoneId: 'ridge', risk: 20, x: 42, y: 69, status: 'open' },
  { id: 'o-104', title: 'Экстренный набор для ночной станции', weight: 71, reward: 720, urgency: 1, zoneId: 'shadow', risk: 38, x: 76, y: 71, status: 'open' },
  { id: 'o-105', title: 'Сверхтяжёлый модуль пайков', weight: 128, reward: 960, urgency: 2, zoneId: 'shadow', risk: 42, x: 87, y: 59, status: 'open' }
];

export function createInitialGameState(idFactory: () => string = cryptoId): GameState {
  return {
    day: 1,
    maxDays: 7,
    money: 500,
    rating: 84,
    selectedRoverId: 'r-1',
    selectedOrderId: 'o-101',
    rovers: structuredClone(initialRovers),
    orders: structuredClone(initialOrders),
    deliveries: [],
    events: [
      {
        id: idFactory(),
        day: 1,
        type: 'system',
        text: 'База открыла смену. Цель: продержаться 7 дней и заработать как можно больше кредитов.'
      }
    ]
  };
}

export function calcRoute(order: Order, rover: Rover): RouteEstimate {
  const zone = zones.find((item) => item.id === order.zoneId);
  if (!zone) throw new Error(`Unknown zone: ${order.zoneId}`);

  const dx = order.x - basePoint.x;
  const dy = order.y - basePoint.y;
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
  const weightPenalty = order.weight * 0.34;
  const terrainPenalty = Math.round(distance * (1 / zone.speed - 1) * 0.5);
  const batteryCost = Math.ceil(distance * 0.95 + weightPenalty + terrainPenalty);
  const tripHours = Math.max(2, Math.ceil(distance / (10 * zone.speed) + order.weight / 36));
  const risk = Math.min(78, order.risk + zone.risk + Math.round(order.weight / 8));
  const urgencyPenalty = Math.max(0, order.urgency - 1) * 25;

  return {
    zone,
    distance,
    batteryCost,
    tripHours,
    risk,
    expectedReward: Math.max(0, order.reward - urgencyPenalty),
    canCarry: rover.capacity >= order.weight,
    hasBattery: rover.battery >= batteryCost,
    isReady: rover.status === 'ready'
  };
}

export function canDeliver(route: RouteEstimate): boolean {
  return route.canCarry && route.hasBattery && route.isReady;
}

export function getImpossibleReason(route: RouteEstimate): string {
  if (!route.isReady) return 'Ровер не готов к рейсу';
  if (!route.canCarry) return 'Груз тяжелее грузоподъёмности';
  if (!route.hasBattery) return 'Не хватает батареи на маршрут';
  return '';
}

export function launchDelivery(state: GameState, roverId: string, orderId: string, idFactory: () => string = cryptoId): GameState {
  const rover = state.rovers.find((item) => item.id === roverId);
  const order = state.orders.find((item) => item.id === orderId);
  if (!rover || !order || order.status !== 'open') {
    throw new Error('Ровер или активный заказ не найден');
  }

  const route = calcRoute(order, rover);
  if (!canDeliver(route)) {
    throw new Error(getImpossibleReason(route));
  }

  const successScore = 100 - route.risk + state.rating * 0.12 + order.urgency * 4;
  const success = successScore >= 46;
  const batteryAfter = Math.max(0, rover.battery - route.batteryCost);
  const ratingDelta = success ? Math.max(2, 8 - order.urgency) : -Math.ceil(route.risk / 7);
  const moneyDelta = success ? route.expectedReward : -Math.min(180, Math.ceil(order.reward * 0.18));
  const delivery: Delivery = {
    id: idFactory(),
    day: state.day,
    roverId: rover.id,
    orderId: order.id,
    zoneId: order.zoneId,
    batteryCost: route.batteryCost,
    risk: route.risk,
    reward: success ? route.expectedReward : 0,
    result: success ? 'success' : 'failed'
  };

  const next: GameState = {
    ...state,
    money: Math.max(0, state.money + moneyDelta),
    rating: Math.max(0, Math.min(100, state.rating + ratingDelta)),
    rovers: state.rovers.map((item) =>
      item.id === rover.id
        ? {
            ...item,
            battery: batteryAfter,
            status: batteryAfter < 18 ? 'charging' : 'ready',
            x: success ? order.x : Math.round((order.x + basePoint.x) / 2),
            y: success ? order.y : Math.round((order.y + basePoint.y) / 2),
            location: success ? order.zoneId : 'route'
          }
        : item
    ),
    orders: state.orders.map((item) => (item.id === order.id ? { ...item, status: success ? 'delivered' : 'failed' } : item)),
    deliveries: [delivery, ...state.deliveries],
    events: [
      {
        id: idFactory(),
        day: state.day,
        type: success ? 'success' : 'danger',
        text: success
          ? `${rover.name} доставил "${order.title}". +${route.expectedReward} cr, батарея -${route.batteryCost}%.`
          : `${rover.name} сорвал рейс к "${order.title}" из-за риска маршрута. Штраф ${Math.abs(moneyDelta)} cr.`
      },
      ...state.events
    ]
  };

  return {
    ...next,
    selectedRoverId: rover.id,
    selectedOrderId: next.orders.find((item) => item.status === 'open')?.id ?? order.id
  };
}

export function advanceDay(state: GameState, idFactory: () => string = cryptoId): GameState {
  if (state.day > state.maxDays) return state;

  const expired = state.orders.filter((order) => order.status === 'open' && order.urgency <= 1);
  const expiryEvent: GameEvent | undefined = expired.length
    ? {
        id: idFactory(),
        day: state.day,
        type: 'danger',
        text: `${expired.length} срочн. заказ(ов) просрочены. Рейтинг базы снизился.`
      }
    : undefined;

  const events: GameEvent[] = [
    {
      id: idFactory(),
      day: state.day,
      type: 'system',
      text: `Настал день ${state.day + 1}. Зарядка роверов завершена, содержание базы -35 cr.`
    },
    ...(expiryEvent ? [expiryEvent] : []),
    ...state.events
  ];

  return {
    ...state,
    day: state.day + 1,
    money: Math.max(0, state.money - 35),
    rating: Math.max(0, state.rating - expired.length * 6),
    rovers: state.rovers.map((rover) => ({
      ...rover,
      battery: Math.min(rover.maxBattery, rover.battery + (rover.status === 'charging' ? 42 : 26)),
      status: rover.status === 'maintenance' && state.day >= 2 ? 'ready' : rover.status === 'charging' ? 'ready' : rover.status,
      x: basePoint.x,
      y: basePoint.y,
      location: 'base'
    })),
    orders: state.orders.map((order) =>
      order.status === 'open'
        ? {
            ...order,
            urgency: Math.max(0, order.urgency - 1),
            status: order.urgency <= 1 ? 'expired' : order.status
          }
        : order
    ),
    events
  };
}

function cryptoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
