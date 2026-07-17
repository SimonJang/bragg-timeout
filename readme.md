# bragg-timeout [![CI](https://github.com/SimonJang/bragg-timeout/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SimonJang/bragg-timeout/actions/workflows/ci.yml)

> Timeout middleware for bragg framework

When AWS Lambda times out, a simple `Task timed out after x seconds` is logged. This is often overlooked when setting CloudWatch alarms or when investigating issues. This middleware lets the consumer perform an action shortly before the Lambda reaches its timeout.


## Install

```sh
npm install bragg-timeout
```


## Usage

```js
const braggTimeout = require('bragg-timeout');
const bragg = require('bragg');
const app = bragg();

const timerMiddleware = braggTimeout({
	threshold: 1000,
	cb: () => console.error('error - timeout')
});

app.use(ctx => timerMiddleware(ctx).setTimer());

module.exports.handler = app.listen();
```


## API

### braggTimeout(input) => output

#### input

Type: `object`

Timeout configuration options.

#### input.threshold

Type: `number`

Time in **milliseconds** before the Lambda timeout at which the callback executes.

Example:

> threshold: 1000 (1 second)
>
> Lambda timeout: 10000 (10 seconds)
>
> With the above configuration, the middleware triggers the callback at approximately 9000 ms (9 seconds) of runtime.
>
> Since the Lambda timeout is calculated using `getRemainingTimeInMillis()`, it might be a few milliseconds off the exact timeout. It also depends on when the middleware is used.

#### input.cb

Type: `function`

Callback function that is executed at the threshold time.

#### output

Type: `function`

A function using the request context to set and clear a timer.

```javascript
const timerMiddleware = braggTimeout({
	threshold: 1000,
	cb: () => console.error('error - timeout')
});


app.use(ctx => {
	const timer = timerMiddleware(ctx);

	timer.setTimer(); // Set the timer
	timer.removeTimer(); // Remove the timer
});
```
