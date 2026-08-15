import type { OrderStatus, RoverStatus } from '../../shared/game';

export function statusName(status: RoverStatus) {
  return {
    ready: 'готов',
    charging: 'зарядка',
    maintenance: 'ремонт'
  }[status];
}

export function statusClass(status: RoverStatus) {
  return {
    ready: 'bg-emerald-100 text-emerald-800',
    charging: 'bg-cyan-100 text-cyan-800',
    maintenance: 'bg-amber-100 text-amber-800'
  }[status];
}

export function orderName(status: OrderStatus) {
  return {
    open: 'активен',
    delivered: 'доставлен',
    failed: 'срыв',
    expired: 'просрочен'
  }[status];
}

export function orderClass(status: OrderStatus) {
  return {
    open: 'bg-slate-200 text-slate-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-rose-100 text-rose-800',
    expired: 'bg-amber-100 text-amber-800'
  }[status];
}
