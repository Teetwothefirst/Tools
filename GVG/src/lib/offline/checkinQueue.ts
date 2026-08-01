import { CheckIn, OfflineCheckInQueueItem } from '../../types/gvg';

const QUEUE_STORAGE_KEY = 'gvg_offline_checkin_queue';

export class OfflineCheckinQueue {
  private static instance: OfflineCheckinQueue;

  private constructor() {}

  public static getInstance(): OfflineCheckinQueue {
    if (!OfflineCheckinQueue.instance) {
      OfflineCheckinQueue.instance = new OfflineCheckinQueue();
    }
    return OfflineCheckinQueue.instance;
  }

  public getQueue(): OfflineCheckInQueueItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public enqueue(checkIn: CheckIn): void {
    if (typeof window === 'undefined') return;
    const queue = this.getQueue();
    const newItem: OfflineCheckInQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      checkIn: { ...checkIn, is_offline_queued: true },
      createdAt: new Date().toISOString(),
    };
    queue.push(newItem);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  public removeItem(queueId: string): void {
    if (typeof window === 'undefined') return;
    const queue = this.getQueue().filter((item) => item.id !== queueId);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  public clearQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }
}
