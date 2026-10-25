# CA_ParcelServ

A Node.js parcel-delivery simulation using a shared event pool.

Implemented: vendor pickup requests, driver delivery simulation, customer
confirmation, timestamped logging through a shared event pool, and automated tests.

GitHub Actions run successful.

Pending: final submission.

## Setup and Usage

Requires Node.js and npm.  
Local verification used Node.js 20.20.2.

Install dependencies and run the simulation:

```bash
npm ci
npm start
```

Each run creates one order, logs its delivery states, thanks the customer,
and exits.

## Testing

Run the handler tests with coverage:

```bash
npm test -- --runInBand
```

Unit tests check vendor payloads and customer confirmation, driver logs
and state emissions, and timestamped global logging. A connected-flow
test checks the registered modules together.

GitHub Actions is configured to run the suite on pushes and pull requests.

## UML

### FlowChart

```mermaid
flowchart TD
    V["Vendor Client"]
    EP["Global Event Pool<br/>(eventPool.js)"]
    H["Event Logger<br/>(hub.js)"]
    D["Driver Client"]

    V -->|"1. emit: pickup"| EP
    EP -->|"2. pickup event"| D
    EP -->|"log: pickup"| H
    D -->|"3. emit: in-transit"| EP
    EP -->|"log: in-transit"| H
    D -->|"4. emit: delivered"| EP
    EP -->|"log: delivered"| H
    EP -->|"5. delivered event"| V

    classDef emitter fill:#dbeafe,stroke:#3b82f6,color:#1e40af
    classDef hub fill:#ccfbf1,stroke:#0d9488,color:#115e59
    class V,D emitter
    class EP,H hub
```

**Diagram Walkthrough** 

1. **Vendor**: Simulates a customer's order and emits `pickup`, supplying the order's information.
2. **Event Pool**: Receives the event and notifies subscribed listeners, including the driver and logger.
3. **Driver**: Responds to `pickup` and emits `in-transit`, followed by `delivered`, using the same order payload.
4. **Event Logger**: Listens for all three event types and logs the event name, ISO timestamp, and order payload.
5. **Vendor**: Receives the `delivered` notification and thanks the customer.

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Vendor
    participant Pool as Shared Event Pool
    participant Logger as Global Logger
    participant Driver

    Note over Vendor,Driver: All listeners are registered before the first pickup

    Vendor->>Pool: emit pickup(order)
    Pool->>Logger: log pickup, timestamp, order
    Pool->>Driver: handle pickup(order)

    Driver->>Driver: log picked up orderId
    Driver->>Pool: emit in-transit(order)
    Pool->>Logger: log in-transit, timestamp, order

    Driver->>Driver: log delivered orderId
    Driver->>Pool: emit delivered(order)
    Pool->>Logger: log delivered, timestamp, order
    Pool->>Vendor: handle delivered(order)
    Vendor->>Vendor: thank customer by name
```

Top to bottom  

1. **Vendor creates the order**. Its store name comes from a function parameter. The payload contains `store`, `orderId`, `customer`, and `address`.
2. **The event pool announces `pickup`**. The logger and driver each respond through their registered listeners.
3. **The driver advances the delivery**. It emits `in-transit`, then `delivered`, passing along the same order payload.
4. **The vendor responds to delivery**. It thanks the customer named in that payload.

## Changelog

- created assignment branch; `events`.
- added UMLs
- installed jest
- `package.json`;
  - ran `npm init -y`,
  - installed and configured `jest` as dev dependency and application scripts -> `package-lock.json`,
  - updated `main`, `script.start`, and `.test`, as well as `description`,
- added shared event pool and timestamped package logging; `eventPool.js`, `hub.js`.
- connected vendor pickup requests, driver delivery, and customer confirmation; `vendor/`, `driver/`, `hub.js`.
- added vendor, driver, and logger unit tests with application coverage reporting; `vendor/vendor-handler.test.js`, `driver/driver-handler.test.js`, `hub.test.js`, `jest.config.js`.
- verified connected vendor-to-driver delivery and customer confirmation; `delivery-flow.test.js`.
- configured automated tests for pushes and pull requests; `.github/workflows/node.yml`.
  
## AI Assistance

- Codex supplied UML drafts, architecture review, setup guidance, application code, unit and connected-flow tests, coverage configuration, and the GitHub Actions workflow.