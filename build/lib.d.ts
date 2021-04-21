declare type HiBusCallback = (payload: any, session?: any) => void;
declare type HiBusPayload = {
    meta: {
        ts: number;
        session?: any;
    };
    data: any;
};
export default class HiBus {
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
    publish(topic: string, payload: HiBusPayload): void;
    subscribe(topic: string, cb: HiBusCallback, options: any): void;
    private makeQueueItem;
}
export {};
