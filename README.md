# Hi-Bus
> version: 0.1.0

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