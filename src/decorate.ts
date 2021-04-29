import HiBus from './lib';

/**
 * Define bus meta property name
 */
export const enum BusMeta {
  Subscrible = 'subscrible_topic',
  Session = 'session',
  SessionParamIndex = 'session_param_index',
}

/**
 * HiBus instance;
 */
const busInstance = HiBus.make();

/**
 * 
 * @decorate
 * 
 */
export const Bus = function (target: any) {

  // Get descriptiors of target's prototype
  const props = Object.getOwnPropertyDescriptors(target.prototype)

  // Create proxy class
  const proxy = new Proxy(target, {
    construct(C, args) {

      const instance = new C(...args);

      Object.values(props).forEach(prop => {
        const method = prop.value;

        // 检查是否有 [消息订阅] 和 [发布消息] 属性
        const topicSubscribe = Reflect.get(method, BusMeta.Subscrible);

        // 判断是否是订阅消息
        if (typeof topicSubscribe !== 'undefined') {
          const proxyMethod = new Proxy(method, {
            apply(_method, _this, args) {
              _method.apply(instance, args);
            }
          })
          busInstance.subscribe(topicSubscribe, proxyMethod);
        }
      })

      return instance;
    }
  })

  // 返回代理的实例对象
  return proxy;
}

/**
 * Subscribe message 
 * @decorate
 * @param topic Message topic
 */
export const Subscribe = (topic: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.set(descriptor.value, BusMeta.Subscrible, topic);
  }
}

/**
 * Publish topic
 * @param topic 订阅消息主题
 */
export function Publish(topic: any): MethodDecorator {
  return (target: Object, propertyKey: String | symbol, descriptor: TypedPropertyDescriptor<any>) => {

    const proxy = new Proxy(descriptor.value, {
      /* 
       * Apply() trap
       */
      apply(_target, _this, _args) {
        const result = _target.apply(_this, _args);

        /**
         * Session
         * Try get session data
         */
        const session = Reflect.get(_target, BusMeta.Session);

        /**
         * Pack data and session
         */
        if (typeof result !== 'undefined') {
          const payload = HiBus.packgePayload([result], session);
          busInstance.publish(topic, payload);
        }

        return result;
      }
    })

    descriptor.value = proxy;
  }
}

export const PublishParam: ParameterDecorator = (target: Object, propertyKey: string | Symbol, index: number) => {

}

/**
 * 为方法添加Session属性
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
export const Session: MethodDecorator = (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {

  const func = descriptor.value;
  const sessionParamIndex = Reflect.get(func, BusMeta.SessionParamIndex);

  /* 给目标函数对象创建一个代理 */
  const proxy = new Proxy(func, {
    apply(_target, _this, _args) {
      const sessionData = Reflect.get(_target, BusMeta.Session) ?? {};

      /* 将代理对象赋值到参数中 */
      if (sessionParamIndex !== undefined && sessionParamIndex !== null) {
        // _args[sessionParamIndex] = proxySessionData;
        _args[sessionParamIndex] = sessionData;
      } else {
        // _args.push(proxyParam);
        _args.push(sessionData);
      }

      /* 将Session数据附加到目标对象 */
      Reflect.defineProperty(_target, BusMeta.Session, {
        value: sessionData,
        writable: true,
      })

      /* 返回函数计算结果 */
      return _target.apply(_this, _args);
    }
  });

  descriptor.value = proxy;
}


/**
 * Alias @Session
 */
export const SessionThrough = Session;

/**
 * 设置属性成为session对象
 * @param target 
 * @param propertyKey 
 * @param index 
 */
export const SessionParam: ParameterDecorator = (target: Object, propertyKey: string | symbol, index: number) => {
  const key = propertyKey as unknown as string;
  // @ts-ignore
  const func = target[key]

  /* 添加session参数的索引号到目标对象的meta中 */
  Reflect.defineProperty(func, BusMeta.SessionParamIndex, { value: index, writable: false })
}