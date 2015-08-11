var Twit = require('twit')

var T = new Twit({
    consumer_key: 'xxx'
  , consumer_secret: 'xxx'
  , access_token: 'xxx'
  , access_token_secret: 'xxx'
})

var stream = T.stream('user', {screen_name: 'gnirtsmodnar'})

stream.on('tweet', function (tweet) {

	console.log(tweet.user.screen_name);

	if(tweet.user.screen_name === "WRFLBot"){
  		console.log(tweet.text);
	}
})