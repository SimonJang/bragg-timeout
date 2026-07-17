'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const timeout = require('.');

const createContext = remainingTime => ({
	context: {
		getRemainingTimeInMillis: () => remainingTime
	}
});

const withFakeTimers = run => {
	const originalSetTimeout = global.setTimeout;
	const originalClearTimeout = global.clearTimeout;
	const scheduled = [];
	const cleared = [];

	global.setTimeout = (handler, delay) => {
		const handle = {handler, delay};
		scheduled.push(handle);
		return handle;
	};
	global.clearTimeout = handle => cleared.push(handle);

	try {
		return run({scheduled, cleared});
	} finally {
		global.setTimeout = originalSetTimeout;
		global.clearTimeout = originalClearTimeout;
	}
};

test('setTimer schedules the callback before the Lambda deadline', () => {
	withFakeTimers(({scheduled}) => {
		let callbackCalls = 0;
		const ctx = createContext(2500);
		const timer = timeout({
			threshold: 500,
			cb: () => {
				callbackCalls++;
			}
		})(ctx);

		timer.setTimer();

		assert.equal(scheduled.length, 1);
		assert.equal(scheduled[0].delay, 2000);
		assert.equal(ctx.context.timer, scheduled[0]);

		scheduled[0].handler();
		assert.equal(callbackCalls, 1);
	});
});

test('setTimer clears an existing timer before replacing it', () => {
	withFakeTimers(({scheduled, cleared}) => {
		const ctx = createContext(1500);
		const existingTimer = {id: 'existing'};
		Object.defineProperty(ctx.context, 'timer', {
			value: existingTimer,
			configurable: true
		});
		const timer = timeout({threshold: 250, cb: () => {}})(ctx);

		timer.setTimer();

		assert.deepEqual(cleared, [existingTimer]);
		assert.equal(scheduled.length, 1);
		assert.equal(scheduled[0].delay, 1250);
		assert.equal(ctx.context.timer, scheduled[0]);
	});
});

test('removeTimer clears and removes the active timer', () => {
	withFakeTimers(({scheduled, cleared}) => {
		const ctx = createContext(1000);
		const timer = timeout({threshold: 100, cb: () => {}})(ctx);
		timer.setTimer();

		timer.removeTimer();

		assert.deepEqual(cleared, [scheduled[0]]);
		assert.equal(Object.hasOwn(ctx.context, 'timer'), false);
	});
});

test('removeTimer is safe when no timer has been set', () => {
	withFakeTimers(({cleared}) => {
		const ctx = createContext(1000);
		const timer = timeout({threshold: 100, cb: () => {}})(ctx);

		assert.doesNotThrow(() => timer.removeTimer());
		assert.deepEqual(cleared, []);
	});
});
