# Hi-Bus
Decorated message event bus system, You can Subscribe or Publish using typescript decorate.

**version: 1.0.0**

# Install

```bash
npm install hi-bus
```

# Usage

You can use decorate method to `subscribe`or`publish` event.

## Subscribe topic

```typescript
@Bus
class CompA {

  @Subscribe("topic")
  private doA(data: any, session?: any) {
    ...
  }
}
```

## Publish topic

```typescript
class CompA {

  @Publish("topic")
  public doA() {
    return "hello"
  }
}

const a = new CompA();
a.doA(); // publish "topic" and with "hello" as message data
```