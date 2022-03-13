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
            data: data ?? [],
        };
    }
    publish(topic, payload, ...args) {
        if (this.#queue.has(topic)) {
            if (typeof payload === 'undefined') {
                payload = {};
            }
            else if (typeof payload !== 'object' || !('data' in payload)) {
                payload = { data: [payload] };
            }
            if (args.length) {
                payload.data = [...payload.data, ...args];
            }
            const data = payload.data;
            const session = payload.meta?.session;
            this.#queue.get(topic)?.forEach((item, _, _set) => {
                const cb = item.cb;
                if (session)
                    Reflect.defineProperty(cb, "session", { value: session, writable: true });
                cb.apply(cb, data);
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
        const item = this.makeQueueItem(cb, false);
        queue.add(item);
        const newQueue = new Set([...queue].sort((a, b) => (b.ni - a.ni)));
        this.#queue.set(topic, newQueue);
        return item.id;
    }
    unsubscribe(flag, callback) {
        if (arguments.length > 1) {
            const queue = this.#queue.get(flag);
            if (queue) {
                const item = [...queue].find(it => it.cb === callback);
                if (item)
                    queue.delete(item);
            }
        }
        else {
            for (const queue of this.#queue.values()) {
                const item = [...queue].find(it => it.id === flag);
                if (item) {
                    queue.delete(item);
                }
            }
        }
    }
    makeQueueItem(cb, once) {
        return {
            id: Date.now().toString(),
            cb,
            ts: Date.now(),
            oc: once ?? false,
            ni: 4
        };
    }
}
HiBus.make();
exports.default = HiBus;
