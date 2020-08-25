'use strict';

/**
 * Remove timer
 *
 * @param {Object} ctx - Context of the request
 */
const clearTimer = ctx => {
	if (ctx.context.timer) {
		clearTimeout(ctx.context.timer);
	}
};

/**
 * Create timer
 *
 * @param {Object} ctx - Context of the request
 * @param {number} threshold - Treshold when to execute the handler when nearing timeout
 * @param {Function} handler - Callback function to execute when the timeout has been reached
 */
const createTimer = (ctx, threshold, handler) => {
	const timer = setTimeout(handler, ctx.context.getRemainingTimeInMillis() - threshold);

	Object.defineProperty(ctx.context, 'timer', {value: timer, configurable: true});
};

/**
 * @param {Object} ctx - Configuration of the timer
 *
 * @returns {Function} - Middleware function
 */
module.exports = ({threshold, cb}) => ctx => {
	return {
		setTimer: () => {
			clearTimer(ctx);
			createTimer(ctx, threshold, cb);
		},
		removeTimer: () => clearTimer(ctx)
	};
};
