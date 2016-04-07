// test.js

var connection = function(){
	var connection = {};

	var missedUpdates = function(statuses){
		var newUpdates = [];
		for(var i = 0; i < statuses.length; i++){
			if(statuses[i].id > match.lastTweet && isMatchUpdate(statuses[i].text)){
				newUpdates.push(statuses[i].text);
			}
		}
		return newUpdates;
	};

	connection.check = function(){ 
		twitter.get('search/tweets', {q: 'from:' + match.data.home.username, count: 90}, function(error, data, response){
			if (error) {
				notify.log("error: " + error.errno);
			} else {
				var updates = missedUpdates(data.statuses.reverse());
				if (updates){
					match.data.updates = match.data.updates.concat(updates);
					updates = [];
				}
			}
		});
	};

	return connection;
};