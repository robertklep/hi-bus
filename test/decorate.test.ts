import { expect } from "chai";
import { Bus, Subscribe, Publish, SessionParam, Session, SessionThrough } from "../src/index";


describe("Decorate Test", function () {

  it("Test subscribe and publish", function (done) {

    @Bus
    class TestClass {
      @Subscribe("event1")
      event() { done() }

      @Publish("event1")
      emit() { return {} }
    }

    const test = new TestClass();
    test.emit();

  })


  it("Test publish data", function (done) {

    @Bus
    class TestClass2 {
      @Subscribe("event2")
      event(data: string) {
        expect(data).to.eq("hello")
        done()
      }

      @Publish("event2")
      emit(message: string) { return message }
    }

    const test = new TestClass2();
    test.emit("hello");

  })

  it("Test session", function (done) {
    @Bus
    class TestClass3 {
      @Subscribe("event3")
      @Session
      event(data: string, session?: any) {
        expect(session).to.property("message");
        expect(session.message).to.eq("world");
        expect(data).to.eq("hello")
        done()
      }

      @Publish("event3")
      @Session
      emit(message: string, @SessionParam session?: any) {
        session.message = "world"
        return message
      }
    }

    const test = new TestClass3();
    test.emit("hello");
  })


  it("Test session pass through", function (done) {
    @Bus
    class TestClass4 {


      @Subscribe('event4-1')
      @Session
      event2(data: any, session?: any) {
        expect(session).to.property("message");
        expect(session.message).to.eq("world");
        done();
      }

      @Publish("event4-1")
      @Subscribe("event4")
      @SessionThrough
      event(data: string) {
        return {}
      }

      @Publish("event4")
      @Session
      emit(message: string, @SessionParam session?: any) {
        session.message = "world"
        return message
      }
    }

    const test = new TestClass4();
    test.emit("hello");
  });



})