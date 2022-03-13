/**
 * Test suit for testing HiBus class
 * 
 * @author aokihu <aokihu@gmail.com>
 * @date Fri Apr 23 00:30:16 CST 2021
 */

import { expect } from 'chai'
import HiBus from '../build/index';
const bus = HiBus.make();

describe("HiBus class test suit", () => {

  it("Test subscribe topic", function (done) {

    bus.subscribe("timeout", function () {
      done();
    })

    setTimeout(() => { bus.publish("timeout") });
  });

  it("Test pass data", function (done) {
    bus.subscribe("timeout1", function (data: any) {
      expect(data).to.eq("hello world");
      done();
    })

    bus.publish("timeout1", "hello world")
  })

  it("Test multi data pass", function (done) {
    bus.subscribe("timeout2", function (data1: any, data2: any) {
      expect(data1).to.eq("hello")
      expect(data2).to.eq("world")
      done()
    })

    bus.publish("timeout2", "hello", "world")
  })

  it("Test unsubscribe with ID", function (done) {

    this.timeout(300);
    let testVar = 1;
    let testVar2 = 1;

    const id = bus.subscribe("timeout3", function (num: number) { testVar = num; })
    bus.subscribe("timeout3", function (num: number) { testVar2 = num })

    bus.unsubscribe(id);

    setTimeout(() => {
      expect(testVar).to.eq(1);
      expect(testVar2).to.eq(2);
      done();
    }, 200)

    bus.publish("timeout3", 2);
  })

  it("Test unsubscribe with topic and function", function (done) {
    this.timeout(300);
    let testVar = 1;
    let testVar2 = 1;

    const func = (num: number) => { testVar = num }
    bus.subscribe("timeout4", func);
    bus.subscribe("timeout4", function (num: number) { testVar2 = num })

    bus.unsubscribe("timeout4", func);

    setTimeout(() => {
      expect(testVar).to.eq(1);
      expect(testVar2).to.eq(2);
      done();
    }, 200)

    bus.publish("timeout4", 2);
  })


  it("Test object data pass", function (done) {
    bus.subscribe("timeout5", function (data1: any) {
      expect(data1).to.deep.equal({ hello : 'world' });
      done()
    })

    bus.publish("timeout5", { hello : 'world' })
  })

  it("Test BusPayload data pass", function (done) {
    bus.subscribe("timeout6", function (data1: any) {
      expect(data1).to.eq('hello world');
      done()
    })

    bus.publish("timeout6", { data : [ 'hello world' ] })
  })

})
