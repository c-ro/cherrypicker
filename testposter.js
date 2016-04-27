//// Test Posts -- REPLACE checkConnection(); in production
var poster = function (){ //TODO: Should poster(), missedUpdates(), and checkConnection() be separated/modulized??
	
	var minute =  1;

	var test = function(){ // recursive loop
		// checkConnection(); // runs a twitter.get // REPLACE THIS IN PROD
		var date = new Date(); // just for some arbitrary data

		var tweet = minute + "' - " + date.getTime();

		twitter.post('statuses/update', { status: tweet }, function(err, data, response){
			if(err){
				notify.log("post error: " + err.errno);
			} else {
				// notify.log("post! - " + tweet);
			}	
		});
			if(minute === 90){ // go up to 90' then start over.
				minute = 1;
			} else {
				minute++;
			}
		setTimeout(test, 60000); // loop back
	};

	setTimeout(test, 5000); //start the loop
};