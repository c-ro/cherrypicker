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
		//TODO:  will need to figure out logic for using multiple match objects inside one instance of Twit
		// Perhaps send match object with every request but twitter.go?
		match = object;
		var stream = twit.stream('user', {screen_name: match.data.home.username}); //TODO: test twit.username

		stream.on('error', function (error) {
		  console.log(error.message);
		});

		stream.on('connected', function (response) {
			console.log(colors.cyan("twitter stream connection. . ." + response.statusMessage));

			// Check to see if we'be missed any tweets
			twit.get('search/tweets', {q: 'from:' + match.data.home.username, count: 90}, function(error, data, response){
				if (error) {
					notify.log("error: " + error.errno);
				} else {
					// TODO: incorrent header check [TypeError: Cannot read property 'missedUpdates' of undefined]
					var updates = match.funcs.missedUpdates(data.statuses.reverse());
					if (updates){
						match.data.updates = match.data.updates.concat(updates);
						updates = [];
					 }
				}
			});
		});

		stream.on('tweet', function (tweet) {

			var text = tweet.text;

			if(tweet.user.screen_name.toLowerCase() === match.data.home.username && match.funcs.isUpdate(text) && text.indexOf('http:') === -1){
				
				text = text.replace(/\S*#(?:\[[^\]]+\]|\S+)/, '');
			  	
			  	match.funcs.update(text);
			  	match.data.lastTweet = tweet.id;

			} else {
				return;
				// console.log("non-minute tweet");
			}

		});

		stream.on('disconnect', function (disconnectMessage) {
			console.log("disconnected");
			// setTimeout(twitter.go, 300000);
		});

		var lastInterval;
		stream.on('reconnect', function(request, response, connectInterval){
			if(lastInterval === 0 && connectInterval === 0){
				stream.stop();
				twitter.go(match);
			} else {
				console.log(colors.cyan("will attempt reconnect: " + connectInterval));
				lastInterval = connectInterval;
			}
		});
	};

	return twitter;
}();