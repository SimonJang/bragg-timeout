# bragg-timeout ![CI](https://github.com/SimonJang/bragg-timeout/workflows/CI/badge.svg)

> Timeout middleware for bragg framework

When AWS Lambda times out, a simple `Task timed out after x seconds` is logged. This is often overlooked when setting CloudWatch alarms or when investigating issues. This middleware tries to resolve this problem by allowing the consumer
of the middleware to perform an action at some point in time before the lambda reached the time out.


## Install

```
$ npm install bragg-timeout
```


## Usage

```js
const braggTimeout = require('bragg-timeout');
const app = require('bragg');

const app = bragg();

app.use(
	braggTimeout({
		threshold: 1000,
		cb: () => console.error('Error: Lambda timeout')
	})
);

export const handler = app.listen();
```


## API

### braggTimeout(input)

#### input

Type: `object`

Time out configuration options

#### input.threshold

Type: `number`

Time in **milliseconds** that is used a a threshold before the time out to execute the callback function.

Example:

> threshold: 1000 (1 second)
>
> Lambda time out: 10000 (10 seconds)
>
> With the above configuration, the middleware will trigger the callback function at +- 9000 ms (9 seconds) run time.
>
> Since the lambda time out is calculated using the `getRemainingTimeInMillis()`, this is not 100% accurate and might be a few milliseconds off the exact time out.
> It also depends on when the middleware is used

##### input.cb

Type: `function`

Callback function that is executed at the threshold time.
