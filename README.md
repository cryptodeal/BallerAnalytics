# READ THIS FIRST!

BallerAnalytics.ai is still under development. Expect bugs!

## Documentation

TODO

## Packages

| Package                                                                     | Changelog                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [@balleranalytics/nba-api-ts](packages/nba-api-ts)                          | |
| [@balleranalytics/tf-neat](packages/tf-neat)                                | |
| [balleranalytics frontend](web)                                             | |
| [@balleranalytics/Bun_A3C (API Server)](Bun_A3C)                            | |



## Bug reporting

TODO

## Developing

This is a monorepo, meaning the repo holds multiple packages. It requires the use of [pnpm](https://pnpm.js.org/en/). You can [install pnpm](https://pnpm.io/installation) with:

```bash
npm i -g pnpm
```

`pnpm` commands run in the project's root directory will run on all sub-projects. You can checkout the code and build all sub-projects with:

```bash
git clone git@github.com:cryptodeal/BallerAnalytics.git
cd BallerAnalytics
pnpm install
pnpm build
```

You should now be able to run [balleranalytics.ai locally](web) with:

```bash
cd web
pnpm dev
```

## Developing Bun_A3C

Bun is a new javascript/typescript runtime, with awesome performance optimizations built in; as such, it's fun to experiment with it in a project such as this.

### Install Bun CLI v0.1.4 (beta)
**(Required if not previously installed Bun)**

macOS x64 & Silicon, Linux x64, Windows Subsystem for Linux
```bash
curl https://bun.sh/install | bash
```

**See [Bun_A3C](/Bun_A3C/README.md) for more information on developing**

### Coding style

### Generating changelogs

### Testing

TODO

### Documentation

TODO

### Releases

## Code structure

