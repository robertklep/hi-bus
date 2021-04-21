import HiBus from './lib';

/**
 * Define bus meta property name
 */
const enum BusMeta {
  Subscrible = 'subscrible',
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
export const Bus = (target: any) => {

  /* Get all prototypes */
  const props = Object.getOwnPropertyDescriptors(target);

  /* Create a proxy object, instead raw target object */
  const proxyTarget = new Proxy(target, {

    /* Redefine the constructor of raw class */
    construct(RawConstructor, args) {

      /* Create the instance from raw constructor function */
      const instance = new RawConstructor(...args);

      for (const prop of Object.values(props)) {
        const method = prop.value;

        const topic = Reflect.get(method, BusMeta.Subscrible);

        if (topic !== undefined && topic !== null) {
          const proxiedMethod = new Proxy(method, {
            apply(_m, _this, _args) {
              _m.apply(instance, args);
            }
          })

          /* Add the callback into bus queue */
          busInstance.subscribe(topic, proxiedMethod, {});
        }
      }


      /* Return the instance */
      return instance;
    }
  });


  /* Return the proxied object */
  return proxyTarget
}

/**
 * Subscribe message 
 * @decorate
 * @param topic Message topic
 */
export const Subscribe = (topic: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.set(target, BusMeta.Subscrible, topic);
  }
}

export const Publish = (topic: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const proxy = new Proxy(descriptor.value, {
      apply(_t, _this, _args) {
        const result = _t.apply(_this, _args);

        /* session data is empty now! */
        /* I want add session data    */
        busInstance.publish(topic, HiBus.packgePayload(result, {}));

        return result;
      }
    })
  }
}