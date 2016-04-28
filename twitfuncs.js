// twitfuncs.js
var Twit = require('twit');
var keys = require('./keys.js');
var notify = require('./notify.js');
var colors = require('colors');

module.exports = function(){
	///// Authenticate Twitter
	var twit = new Twit(keys.twit);
	var twitter = {};
	var match;
	////// start listening to twitter
	twitter.go = function(object){
		match = object;
		var stream = twit.stream('user', {screen_name: match.data.home.username});

		stream.on('error', function (error) {
		  console.log(error.message);
		});

		stream.on('connected', function (response) {
			console.log(colors.green("twitter stream connection. . ." + response.statusMessage));
		});

		stream.on('tweet', function (tweet) {

			var text = tweet.text;

			if(match.funcs.isUpdate(text) && text.indexOf('http:') === -1){
				
				text = text.replace(/\S*#(?:\[[^\]]+\]|\S+)/, '');
			  	
			  	match.funcs.update(text);
			  	match.data.lastTweet = tweet.id;

			} else {
				return;
				// console.log("non-minute tweet");
			}

		});

		stream.on('disconnect', function (disconnectMessage) {
			console.log(disconnectMessage);
			// setTimeout(twitter.go, 300000);
		});

		stream.on('reconnect', function(request, response, connectInterval){
			notify.log(colors.green("attempt reconnect in: " + connectInterval + "s"));
			console.log(response);
		});

		// var updates = match.funcs.missedUpdates(data.statuses.reverse());
		// 		if (updates){
		// 			match.data.updates = match.data.updates.concat(updates);
		// 			updates = [];
		// 		}


	};

	var checkConnection = function(){ 
		///// When not testing with poster() check every 5 mins
		twit.get('search/tweets', {q: 'from:' + match.data.home.username, count: 90}, function(error, data, response){
			if (error) {
				notify.log("error: " + error.errno);
			} else {
				var updates = match.funcs.missedUpdates(data.statuses.reverse());
				if (updates){
					match.data.updates = match.data.updates.concat(updates);
					updates = [];
				}
			}
		});
	};

	return twitter;
}();