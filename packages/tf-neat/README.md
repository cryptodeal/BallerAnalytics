# A3C ([Asynchronous Advantage Actor-Critic](https://naifmehanna.com/2019-02-27-scaling-a3c-multiple-machines-tensorflowjs/)) RL API

## Getting Started

### Run Server Only
```bash
pnpm host:server
```

### Run Server & Worker(s) (Host:All)
```bash
pnpm host:all
```

**Host:All CLI FLAG Options**
| Arg                                                                     | Changelog                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| --spawnCount or --c                                                         | | number of workers spawned on local machine


### Run Worker
```bash
pnpm host:worker
```

**Run Worker CLI FLAG Options**
| Arg                                                                     | Changelog                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| --host or -h                                                            | | network address of server hosting global state
