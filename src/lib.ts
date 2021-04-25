import { BusMeta } from './decorate'
/**
 * Callback function
 * @param data callback payload data
 * @param session session data
 */
interface EventCallbackFunc {
  (...args: any[]): void
}

/**
 * Item of queue
 * @field id 
 * @field ts timestamp
 * @filed cb callback function
 * @filed oc once
 * @filed ni nice
 */
type QueueItem = {
  id: string,
  ts: number,
  cb: EventCallbackFunc,
  oc: boolean,
  ni: number,
}

/**
 * Message payload
 * @field meta message meta data
 * @field meta.ts timestamp
 * @field meta.session session data
 * 
 */
type BusPayload = {
  meta: {
    ts: number,
    session?: any,
  },
  data: any,
};

/**
 * 消息优先级定义
 */
const enum Priority {
  HIGHER,
  LOWEST,
  LOWER,
  LOW,
  NORMAL,
  HIGH,
  HIGHEST,
}

/**
 * HiBus
 * @class
 */
class HiBus {

  static instance: HiBus | null;
  /** 
   * Message queue
   * @private
   */
  #queue = new Map<string, Set<QueueItem>>();

  /**
   * HiBus factory method
   * @returns HiBus instance
   */
  static make() {
    return HiBus.instance ?? (HiBus.instance = new HiBus());
  }

  /**
   * Pack message payload
   * @param data 
   * @param session 
   * @returns 
   */
  static packgePayload(data: any, session?: any) {
    return {
      meta: {
        ts: Date.now(),
        session,
      },
      data: data ?? [],
    }
  }

  /**
   * Publish topic
   * @param topic Message topic
   * @param payload Message payload
   */
  public publish(topic: string, payload: BusPayload): void {
    if (this.#queue.has(topic)) {
      const data = payload.data;
      const session = payload.meta?.session;

      /* Trigger callback function */
      this.#queue.get(topic)?.forEach((item, _, _set) => {
        const cb = item.cb;
        if (session) Reflect.defineProperty(cb, BusMeta.Session, { value: session, writable: true })
        cb.apply(cb, data);

        // delete item which was onced
        if (item.oc) { _set.delete(item); }
      });
    }
  }

  /**
   * Subscribe topic 
   * @param topic subscrible topic
   * @param cb callback function
   * @param options subscribe options
   */
  public subscribe(topic: string, cb: EventCallbackFunc, options?: any): string {
    // 获取对应消息主题的消息队列集合
    const queue = this.#queue.has(topic)
      ? this.#queue.get(topic)
      : new Set<QueueItem>();

    const item = this.makeQueueItem(cb, false)
    queue!.add(item);

    // 按照优先级从高到底排序
    const newQueue = new Set([...queue!].sort((a, b) => (b.ni - a.ni)));

    // push item into queue
    this.#queue.set(topic, newQueue);

    // return the id for unsubscribe
    return item.id;
  }

  /**
   * Ubsubscribe topic
   * @param flags topic or subscrible id
   */
  public unsubscribe(flag: string, callback?: Function) {
    if (arguments.length > 1) {
      const queue = this.#queue.get(flag);
      if (queue) {
        const item = [...queue].find(it => it.cb === callback)
        if (item) queue.delete(item);
      }
    }
    else {
      for (const queue of this.#queue.values()) {
        const item = [...queue].find(it => it.id === flag)
        if (item) { queue.delete(item) }
      }
    }
  }

  /**
   * 生成消息队列中的消息
   * @private
   * @param cb 回掉函数
   * @param once 是否是一次性监听
   */
  private makeQueueItem(cb: EventCallbackFunc, once?: boolean): QueueItem {
    return {
      id: Date.now().toString(),
      cb,
      ts: Date.now(),
      oc: once ?? false,
      ni: Priority.NORMAL
    }
  }
}

// Create the bus instance
HiBus.make();

// Export class
export default HiBus;