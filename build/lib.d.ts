interface EventCallbackFunc {
    (...args: any[]): void;
}
declare type BusPayload = {
    meta: {
        ts: number;
        session?: any;
    };
    data: any;
};
declare class HiBus {
    #private;
    static instance: HiBus | null;
    static make(): HiBus;
    static packgePayload(data: any, session?: any): {
        meta: {
            ts: number;
            session: any;
        };
        data: any;
    };
    publish(topic: string, payload: BusPayload): void;
    subscribe(topic: string, cb: EventCallbackFunc, options?: any): string;
    unsubscribe(flag: string, callback?: Function): void;
    private makeQueueItem;
}
export default HiBus;
