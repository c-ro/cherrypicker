// notify.js
// npm human-readable-time is a dependency
// for now, use '+ "\n"' to pad lines that shouldn't be overwritten
var hrt = require('human-readable-time');

var notify = function(){
	"use strict";
	var notify = {};

	notify.log = function(string){

		var time = function(){
			return hrt(new Date(), '%hh%:%mm%') + " ";
		};

		process.stdout.clearLine();   // clear current text
		process.stdout.cursorTo(0);   // move cursor back to left

		// write
		if(string.indexOf("error") > -1){
			process.stdout.write("+ " + colors.red(time() + string)); // write to console
		} else {
			process.stdout.write("+ " + time() + string);
		}
	};

	return notify;
};

module.exports = notify();