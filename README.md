Hi-Bus is a new event bus module for Typescript, it is used *decorate* to **publish** and **subscribe** event. 

*Lastest version: 1.0.5*
## Install

This module only work on *Typescript* now, because it use *decorate* which is supported only with *Typescript*, maybe *JavaScript* will support *Decorate* in the future.

```bash
# NPM package manager
npm install hi-bus

# Yarn package manager
yarn add hi-bus
```

## Sample

Let’s take a sample to show the power of Hi-Bus!

```javascript
// Import Hi-Bus, you can use any word instead 'HiBus'
import HiBus, {Bus, Publish, Subscribe} from 'hi-bus'

// First we must create a class with decorate ‘@Bus'
// decorate '@Bus’ is used to collect subscribe functions
// it will not work without '@Bus’ when you subscribe message in class

@Bus
class Test {  

  // Subscribe topic “handshake” with doctorate @Subscribe
  // You only focus the function logic
  @Subscribe("handshake")
  handshake() {
    console.log(“Handshake”);
  }

  // when you call function ‘pulbishHandshake’
  // it will publish topic ‘handshake’ automatic
  // the function must return something to trigger publish
  // if return nothing or return void, it will not trigger publish
  @Publish("handshake")
  publishHandshake() {
    return {};
  }

}

const test = new Test();

test.publishHandshake();
// console output: Handshake
```

## Decorate

Please enable *decorate* in your `tsconfig.json`.

```json
{
  ...
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true,
}
```

### Decorate list

* *Class Decorate*
  * [@Bus](#@Bus)
* *Function Decorate*
  * [@Publish](#@Publish)
  * [@Subscribe](#@Subscribe)
  * [@Session](#@Session)
* *Parameter Decorate*
  * @SessionParam

#### @Bus

This is class decorate, you just put it at head of class. It was use to collect function which wac decorate `@Sucscribe`. Without `@Bus`, the calss can *publish* topic and **not subscribe** topic

*Sample*

```typescript
import {Bus} from 'hi-bus'

@Bus
class Test {
  ...
}
```

### @Publish

> @Publish(topic: string)

This decorate was used to pulbish *topic*, like `bus.publish(topic, data)`, the decorate catch the result of function to be the topic data, In the decorate, @Publish create a proxied function, and the proxied function's `this` is always point your class prototype;

You must return any result to trigger @Publish, if return `void` the @Publish will not work;

there is not have to add `@Bus` at head of class, `@Publish` can work isolate with `@Bus`.

*Sample*

```typescript
import { Publish } from 'hi-bus'

class Person {

  @Publish("hello")
  hello(name) {
    return name
  }

  @Publish("bye")
  bye() {
    return null;
  }

  @Publis("nothing")
  nothing(){}

}

const person = new Person();
// like <bus.publish('hello', 'world')>
person.hello('world') 

// like <bus.publish('bye', null)>
person.bye();

// Don't publish anything, because the function is result is void
person.nothing();

```

#### @Subscribe
> @Subscribe(topic: string, options?:{})

The decorate was used to *subscribe* topic like `bus.subscribe(topic, callbackFunction)`, you have to add `@Bus` at head of class, or `@Subscribe` will not work without `@Bus`.

*Sample*

```typescript
import {Bus, Publish, Subscribe} from 'hi-bus'

@Bus
class Customer {

  @Subscribe("coffe")
  getCoffe(){
    console.log("get coffe");
  }

  @Subscribe("food")
  getFood(foodName) {
    console.log("get " + foodName);
  }

}

@Bus
class Shopper {

  @Publish('coffe')
  sendCoffe() {return null;}

  @Publish("food")
  sendFood(foodName) {return foodName}
}

const customer = new Customer();
const shopper = new Shopper();

shopper.sendCoffe();
// console.log output
// 'get coffe'

shopper.sendFood("bread")
// console.log output
// 'get bread'
```

#### @Session
> @Session

Sometime we need pass data through one more functions, like`A->B->C->D`. We don't return the same data one after one, like `id` or `soket object`, so you can use `@Session` to pass the session data through some functions.

Using `@Session` you must add `@SessionParam` decorate, which was used to set `session data`

*Sample*

```typescript
import {Bus, Session, Subscribe, Publish, SessionParam} from 'hi-bus'

@Bus
class Customer {

  @Subscribe("coffe")
  @Session
  getCoffe(@SessionParam session){
    console.log("id:" + session.id);
    console.log("get coffe");
  }

  @Subscribe("food")
  @Session(@SessionParam session)
  getFood(foodName) {
    console.log("id:" + session.id)
    console.log("get " + foodName);
  }

  @Publish("reply")
  @Subscribe("anything")
  @Session
  relay() {return null;}

}

@Bus
class Shopper {

  @Publish('coffe')
  @Session
  sendCoffe(@SessionParam session) {
    session.id = 1234;
    return null;
  }

  @Publish("food")
  @Session
  sendFood(foodName, @SessionParam session) {
    session.id = 4567;
    return foodName
  }

  @Publish("anything")
  @Session
  sendAnything(@SessionParam session) {
    session.id = 123456789;
    return null;
  }

  @Subscribe("reply")
  @Session
  receiveReplay(@SessionParam session) {
    console.log("reply id:" + session.id);
  }
}

shopper.sendCoffe();
// console.log output
// id: 1234
// get coffe

shopper.sendFood("bread")
// console.log output
// id: 4567
// get bread

shopper.sendAnything()
// console.log output
// reply id: 123456789

```