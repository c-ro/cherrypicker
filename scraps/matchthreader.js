var Twit = require('twit')

var T = new Twit({
    consumer_key: 'PwFp8lfHGQzMOrtovLeHO83oE'
  , consumer_secret: 'rYlRxNV3lwNUBqorfbQz5up2yunGjG8s1dLYRu1RwAgajpHmgL'
  , access_token: '2378057094-r9uya9WBPOoE7N42HCmb0GKzHqm2DH3CipahuVU'
  , access_token_secret: 'EUnsQNPuWpfOFixqrNdqHVd1vGzvSXiuLVZAqzdjCXs8B'
})

var stream = T.stream('user', {screen_name: 'gnirtsmodnar'})

stream.on('tweet', function (tweet) {
	if(tweet.user.screen_name === "wrflbot"){
  		console.log(tweet.text);
	}
})