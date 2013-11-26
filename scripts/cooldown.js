'use strict';

/**
 * Values of important cooldowns in LoL.
 * @const
 * @type {Object}
 */
var COOLDOWNS = {
	blue: 300,
	red: 300,
	dragon: 360,
	nashor: 420
};

/**
 * Value used to generated unique ids for each cooldown.
 * @type {number}
 */
var nextId = 0;

/**
 * Lists current active cooldowns.
 * @type {Array}
 */
var activeCooldowns = [];

/**
 * Caches most used values from π.
 * @type {number}
 */
var π = Math.PI,
	π2 = π * 2,
	π_2 = π / 2;

/**
 * Cooldown widget.
 *
 * @param el Root ui element.
 * @returns {Cooldown}
 * @constructor
 */
function Cooldown(el) {
	el.prop('controller', this);

	this.id = nextId++;
	this.el = el;
	this.knobPathEl = el.find('path');
	this.timeEl = el.find('time');
	this.title = el.find('h2').text();
	this.color = el.css('border-color');
	this.type = el.attr('data-type');
	this.cooldown = COOLDOWNS[this.type];

	reset.call(this);
}

/**
 * Starts a given cooldown.
 *
 * @this Cooldown Cooldown to be started.
 * @private
 */
function start() {
	changeState.call(this, 'active');
	activeCooldowns[this.id] = this;
	this.startTime = Date.now();
}

/**
 * Resets a given cooldown.
 * Resets data & ui to initial state.
 *
 * @param fx Whether to apply an effect on the timer or not.
 * @this Cooldown Cooldown to be reset.
 * @private
 */
function reset(fx) {
	this.time = this.cooldown;
	this.startTime = Date.now();
	update.call(this, fx);
}

/**
 * Updates a given cooldown.
 * Updates ui's content, typically the timer.
 *
 * @param fx Whether to apply an effect on the timer or not.
 * @this Cooldown Cooldown to be updated.
 * @private
 */
function update(fx) {
	var t = this.time,
		display =
			t >= 60 ? Math.ceil(t / 60) :
			0 === t ? this.title : t;

	if (display == this.display) return;

	this.timeEl.text(display);

	if (false !== fx) {
		this.timeEl.css({
			transform: 'scale(1.5)',
			opacity: 0,
			transition: 'none'
		});
		this.timeEl[0].offsetWidth;
		this.timeEl.css({
			transform: 'none',
			opacity: 1,
			transition: 'all .5s'
		});
	}

	this.display = display;
}

/**
 * Reflows a given cooldown.
 * Re-layouts ui to reflect the current state, typically the pie.
 * @this Cooldown Cooldown to be reflowed.
 * @private
 */
function reflow() {
	var p = (Date.now() - this.startTime) / (this.cooldown * 1000),
		α = p * π2,
		x = Math.cos(α - π_2) * 100,
		y = Math.sin(α - π_2) * 100 + 100,
		dir = α < π ? 0 : 1;

	this.knobPathEl[0].setAttribute('d', 'M100,100 v-100 a100,100 1 ' + dir + ',1 ' + x + ',' + y + ' z');
}

/**
 * Changes the state of a given cooldown.
 *
 * @param state New state.
 * @this Cooldown Cooldown to be updated.
 * @private
 */
function changeState(state) {
	if (state == this.state) return;

	this.el.attr('data-state', state);
	this.state = state;
}

/** ----------------------------------------------------------------------- */

/**
 * Updates active cooldowns' content and its content.
 * Fired once per second.
 */
function tick() {
	activeCooldowns.forEach(function(cooldown) {
		if (!cooldown) return;

		var fx = true;

		cooldown.time--;

		if (0 === cooldown.time) {
			changeState.call(cooldown, 'end');
			activeCooldowns[cooldown.id] = null;
		}
		else if (cooldown.time < 60) {
			changeState.call(cooldown, 'soon');
			if (cooldown.time > 10 && 0 !== cooldown.time % 10) fx = false;
		}

		update.call(cooldown, fx);
	});
}

/**
 * Updates active cooldowns' layout.
 */
function frame() {
	requestAnimationFrame(frame);

	activeCooldowns.forEach(function(cooldown) {
		if (!cooldown) return;

		reflow.call(cooldown);
	});
}

/**
 * Exports.
 */
module.exports = Cooldown;

/** ----------------------------------------------------------------------- */

	// binds a global click event for all existing and future cooldowns.
$('.tile').on('click', function() {
	var el = $(this),
		controller = el.prop('controller');

	el.addClass('is-tapped').on('animationend webkitAnimationEnd', function() {
		el.removeClass('is-tapped');
	});

	reset.call(controller, false);
	if (!controller.state || 'end' == controller.state) {
		start.call(controller);
	}
});

// global set interval
setInterval(tick, 1000);
// global raf
requestAnimationFrame(frame);