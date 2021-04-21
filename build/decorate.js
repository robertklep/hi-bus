"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publish = exports.Subscribe = exports.Bus = void 0;
const lib_1 = __importDefault(require("./lib"));
const busInstance = lib_1.default.make();
const Bus = (target) => {
    const props = Object.getOwnPropertyDescriptors(target);
    const proxyTarget = new Proxy(target, {
        construct(RawConstructor, args) {
            const instance = new RawConstructor(...args);
            for (const prop of Object.values(props)) {
                const method = prop.value;
                const topic = Reflect.get(method, "subscrible");
                if (topic !== undefined && topic !== null) {
                    const proxiedMethod = new Proxy(method, {
                        apply(_m, _this, _args) {
                            _m.apply(instance, args);
                        }
                    });
                    busInstance.subscribe(topic, proxiedMethod, {});
                }
            }
            return instance;
        }
    });
    return proxyTarget;
};
exports.Bus = Bus;
const Subscribe = (topic) => {
    return (target, propertyKey, descriptor) => {
        Reflect.set(target, "subscrible", topic);
    };
};
exports.Subscribe = Subscribe;
const Publish = (topic) => {
    return (target, propertyKey, descriptor) => {
        const proxy = new Proxy(descriptor.value, {
            apply(_t, _this, _args) {
                const result = _t.apply(_this, _args);
                busInstance.publish(topic, lib_1.default.packgePayload(result, {}));
                return result;
            }
        });
    };
};
exports.Publish = Publish;
