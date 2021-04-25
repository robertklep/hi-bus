"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionParam = exports.SessionThrough = exports.Session = exports.Publish = exports.Subscribe = exports.Bus = void 0;
const lib_1 = __importDefault(require("./lib"));
const busInstance = lib_1.default.make();
const Bus = function (target) {
    const props = Object.getOwnPropertyDescriptors(target.prototype);
    const proxy = new Proxy(target, {
        construct(C, args) {
            const instance = new C(...args);
            Object.values(props).forEach(prop => {
                const method = prop.value;
                const topicSubscribe = Reflect.get(method, "subscrible_topic");
                if (typeof topicSubscribe !== 'undefined') {
                    const proxyMethod = new Proxy(method, {
                        apply(_method, _this, args) {
                            _method.apply(instance, args);
                        }
                    });
                    busInstance.subscribe(topicSubscribe, proxyMethod);
                }
            });
            return instance;
        }
    });
    return proxy;
};
exports.Bus = Bus;
const Subscribe = (topic) => {
    return (target, propertyKey, descriptor) => {
        Reflect.set(descriptor.value, "subscrible_topic", topic);
    };
};
exports.Subscribe = Subscribe;
function Publish(topic) {
    return (target, propertyKey, descriptor) => {
        const proxy = new Proxy(descriptor.value, {
            apply(_target, _this, _args) {
                const result = _target.apply(_this, _args);
                const session = Reflect.get(_target, "session");
                if (typeof result !== 'undefined') {
                    const payload = lib_1.default.packgePayload([result], session);
                    busInstance.publish(topic, payload);
                }
                return result;
            }
        });
        descriptor.value = proxy;
    };
}
exports.Publish = Publish;
const Session = (target, propertyKey, descriptor) => {
    const func = descriptor.value;
    const sessionParamIndex = Reflect.get(func, "session_param_index");
    const proxy = new Proxy(func, {
        apply(_target, _this, _args) {
            const sessionData = Reflect.get(_target, "session") ?? {};
            if (sessionParamIndex !== undefined && sessionParamIndex !== null) {
                _args[sessionParamIndex] = sessionData;
            }
            else {
                _args.push(sessionData);
            }
            Reflect.defineProperty(_target, "session", {
                value: sessionData,
                writable: true,
            });
            return _target.apply(_this, _args);
        }
    });
    descriptor.value = proxy;
};
exports.Session = Session;
exports.SessionThrough = exports.Session;
const SessionParam = (target, propertyKey, index) => {
    const key = propertyKey;
    const func = target[key];
    Reflect.defineProperty(func, "session_param_index", { value: index, writable: false });
};
exports.SessionParam = SessionParam;
