# A3C ([Asynchronous Advantage Actor-Critic](https://naifmehanna.com/2019-02-27-scaling-a3c-multiple-machines-tensorflowjs/)) RL API (BUN Runtime w Hono Router)

## Status

Bun does not yet work with tensorflow.js; accordingly, this package is not currently being developed, but used to test Bun's compatibility with the logic contained in [packages/tf-neat](../packages/tf-neat/)

## Getting Started

### Install Bun CLI v0.1.4 (beta)
**(Required if not previously installed Bun)**

macOS x64 & Silicon, Linux x64, Windows Subsystem for Linux
```bash
curl https://bun.sh/install | bash
```

### Cloning the repo

```sh
git clone git@github.com:cryptodeal/BallerAnalytics.git
cd BallerAnalytics/Bun_A3C

```

**Ensure you have installed Bun CLI as detailed above**
```sh
bun install
```

### Development
```
bun run src/index.ts
```

Open http://localhost:3000 with your browser to see the result.

**N.B. The client side logic (API, Agent/Critic, etc.) has moved to [Client](/src/Client/)**
