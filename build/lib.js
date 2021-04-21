"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HiBus {
    constructor() {
        this.#queue = new Map();
    }
    #queue;
    static make() {
        return HiBus.instance ?? (HiBus.instance = new HiBus());
    }
    static packgePayload(data, session) {
        return {
            meta: {
                ts: Date.now(),
                session,
            },
            data,
        };
    }
    publish(topic, payload) {
        if (this.#queue.has(topic)) {
            this.#queue.get(topic)?.forEach((item, _, _set) => {
                const data = payload?.data;
                const meta = payload?.meta;
                const cb = item.cb;
                cb.apply(cb, [data]);
                if (item.oc) {
                    _set.delete(item);
                }
            });
        }
    }
    subscribe(topic, cb, options) {
        const queue = this.#queue.has(topic)
            ? this.#queue.get(topic)
            : new Set();
        queue.add(this.makeQueueItem(cb, false));
        const newQueue = new Set([...queue].sort((a, b) => (b.ni - a.ni)));
        this.#queue.set(topic, newQueue);
    }
    makeQueueItem(cb, once) {
        return {
            id: Date.now().toString(),
            cb,
            ts: Date.now(),
            oc: once ?? false,
            ni: 3
        };
    }
}
exports.default = HiBus;
