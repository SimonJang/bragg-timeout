import test from 'ava';
import delay from 'delay';
import * as sinon from 'sinon';
import middleware from '.';

const createContext = () => {
	const ctx = {};
	const lambdaContext = {
		getRemainingTimeInMillis: () => 2500
	};

	Object.defineProperty(ctx, 'context', {enumerable: true, value: lambdaContext});

	return ctx;
};

let sandbox;

test.before(() => {
	sandbox = sinon.createSandbox();
	sandbox.spy(console, 'log');
});

test.beforeEach(() => {
	sandbox.reset();
});

test.serial('should run callback function on timeout', async t => {
	const configuration = {
		threshold: 2000,
		cb: () => console.log('Timeout test 1')
	};

	const timer = middleware(configuration)(createContext());
	timer.setTimer();

	await delay(2000);

	t.is(console.log.callCount, 1);
	t.true(console.log.calledWith('Timeout test 1'));
});

test.serial('should not run callback function on timeout', async t => {
	const configuration = {
		threshold: 2000,
		cb: () => console.log('Timeout test 2')
	};

	const timer = middleware(configuration)(createContext());

	timer.setTimer();
	timer.removeTimer();
	await delay(2000);

	t.is(console.log.callCount, 0);
});

test.serial('should be able to delete existing timer and create a new timer', async t => {
	const handler = () => console.log('Timeout test 3');
	const threshold = 1000;

	const configuration = {
		threshold,
		cb: handler
	};

	const ctx = createContext();
	const configuredTimer = setTimeout(handler, ctx.context.getRemainingTimeInMillis() - threshold);
	Object.defineProperty(ctx.context, 'timer', {value: configuredTimer, configurable: true});

	const timer = middleware(configuration)(ctx);

	timer.setTimer();

	await delay(2000);

	t.is(console.log.callCount, 1);
	t.true(console.log.calledWith('Timeout test 3'));
});

test.serial('should be able to delete existing timer and create a new timer that will not log', async t => {
	const handler = () => console.log('Timeout test 4');
	const threshold = 50;

	const configuration = {
		threshold,
		cb: handler
	};

	const ctx = createContext();
	const configuredTimer = setTimeout(handler, ctx.context.getRemainingTimeInMillis() - threshold);
	Object.defineProperty(ctx.context, 'timer', {value: configuredTimer, configurable: true});

	const timer = middleware(configuration)(ctx);

	timer.setTimer();

	await delay(2000);

	t.is(console.log.callCount, 0);
});
