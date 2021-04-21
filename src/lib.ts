
/**
 * Callback
 * @version 1.0
 * @param payload 消息中所负载的数据包
 * @param session 消息包中的session会话数据
 */
type HiBusCallback = (payload: any, session?: any) => void

/**
 * 消息负载数据包格式
 * 
 * @field meta 消息报元数据
 * @field meta.ts 产生负载数据包的时间戳
 * @field meta.session 消息包的会话数据
 * 
 */
declare type HiBusPayload = {
  meta: {
    ts: number,
    session?: any,
  },
  data: any,
};

/**
 * Item of queue
 * @field id 
 * @field ts timestamp
 * @filed cb callback function
 * @filed oc once
 * @filed ni nice
 */
type HiBusQueueItem = {
  id: string,
  ts: number,
  cb: HiBusCallback,
  oc: boolean,
  ni: number,
}

/**
 * 消息优先级定义
 */
const enum HiBusPriority {
  LOWEST,
  LOWER,
  LOW,
  NORMAL,
  HIGH,
  HIGHER,
  HIGHEST,
}

/**
 * HiBus
 * @class
 */
export default class HiBus {

  static instance: HiBus | null;

  /** 
   * Message queue
   * @private
   */
  #queue = new Map<string, Set<HiBusQueueItem>>();

  /**
   * HiBus factory method
   * @returns HiBus instance
   */
  static make() {
    return HiBus.instance ?? (HiBus.instance = new HiBus());
  }

  static packgePayload(data: any, session?: any) {
    return {
      meta: {
        ts: Date.now(),
        session,
      },
      data,
    }
  }

  /**
   * Publish topic
   * @param topic Message topic
   * @param payload Message payload
   */
  public publish(topic: string, payload: HiBusPayload): void {
    if (this.#queue.has(topic)) {
      this.#queue.get(topic)?.forEach((item, _, _set) => {
        const data = payload?.data
        const meta = payload?.meta;
        const cb = item.cb;

        cb.apply(cb, [data]);

        // 执行一次的消息，执行完毕后删除
        if (item.oc) { _set.delete(item); }
      });
    }
  }

  public subscribe(topic: string, cb: HiBusCallback, options: any): void {
    // 获取对应消息主题的消息队列集合
    const queue = this.#queue.has(topic)
      ? this.#queue.get(topic)
      : new Set<HiBusQueueItem>();

    queue!.add(this.makeQueueItem(cb, false));

    // 按照优先级从高到底排序
    const newQueue = new Set([...queue!].sort((a, b) => (b.ni - a.ni)));

    // 保存到订阅主题
    this.#queue.set(topic, newQueue);
  }

  /**
   * 生成消息队列中的消息
   * @private
   * @param cb 回掉函数
   * @param once 是否是一次性监听
   */
  private makeQueueItem(cb: HiBusCallback, once?: boolean): HiBusQueueItem {
    return {
      id: Date.now().toString(),
      cb,
      ts: Date.now(),
      oc: once ?? false,
      ni: HiBusPriority.NORMAL
    }
  }
}