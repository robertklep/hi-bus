export declare const enum BusMeta {
    Subscrible = "subscrible_topic",
    Session = "session",
    SessionParamIndex = "session_param_index"
}
export declare const Bus: (target: any) => any;
export declare const Subscribe: (topic: string) => MethodDecorator;
export declare function Publish(topic: any): MethodDecorator;
export declare const Session: MethodDecorator;
export declare const SessionThrough: MethodDecorator;
export declare const SessionParam: ParameterDecorator;
