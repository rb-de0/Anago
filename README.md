# Anago

Automated trading and backtesting tool for forex. Inspired by [jiji2](https://github.com/unageanu/jiji2)

## Installation

Install `Node` and `Yarn`.

### Package Install

```bash
$ yarn install
```

### Run

```bash
$ yarn start
```

### Lint

```bash
$ yarn lint
```

### Create User for DEBUG

```bash
$ yarn create_user ${ANAGO_USER} ${ANAGO_PASSWORD} ${OANDA_API_KEY} ${OANDA_API_TYPE}
```

## Docker support

```bash
$ export OANDA_API_KEY=xxxxxxxxxxxxxxxxxxxx
$ export OANDA_API_TYPE=Real or Practice
$ export ANAGO_USER=xxxx
$ export ANAGO_PASSWORD=xxxx
$ make run
```

or

Write environment variables into `.env`

```
ANAGO_USER=xxxx
ANAGO_PASSWORD=xxxx
OANDA_API_KEY=xxxxxxx-xxxxxxxx
OANDA_API_TYPE=Real
```
