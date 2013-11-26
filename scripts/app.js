'use strict';

var Cooldown = require('./cooldown');

var cooldowns = [];

$('.tile').each(function() {
	cooldowns.push(new Cooldown($(this)));
});