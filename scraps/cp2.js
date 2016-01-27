"use strict";

var Thread = function (streamLocation){
		this.stream = streamLocation;
};

Thread.prototype.create = function(){
	console.log("created: " + this.stream);
}

var matchThread = new Thread("http://ewtubz.com");

matchThread.create;