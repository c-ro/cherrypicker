var Twit = require('twit');
var Snoocore = require('snoocore');
var user;
var threadData;
var data;

///// Authenticate Twitter
///// eow-title

var twitter = new Twit({
    consumer_key: 'PwFp8lfHGQzMOrtovLeHO83oE'
  , consumer_secret: 'rYlRxNV3lwNUBqorfbQz5up2yunGjG8s1dLYRu1RwAgajpHmgL'
  , access_token: '2378057094-r9uya9WBPOoE7N42HCmb0GKzHqm2DH3CipahuVU'
  , access_token_secret: 'EUnsQNPuWpfOFixqrNdqHVd1vGzvSXiuLVZAqzdjCXs8B'
})

////// Authenticate Reddit

var reddit = new Snoocore({
	userAgent: '/u/dicklangly tapi',
	oauth: {
		type: 'script',
		key:'xxx',
		secret:'xxx',
		username: 'xxx',
		password: 'xxx',
		scope: ['identity','read','vote','submit', 'edit']
	}
});

///// Get user data object

reddit('/api/v1/me').get().then(function(result){
	console.log(result);
});

//// start listening to Twitter

var stream = twitter.stream('user', {screen_name: 'gnirtsmodnar'})

stream.on('tweet', function (tweet) {

	// console.log(tweet.user.screen_name + ":  " + tweet.text);
	// console.log("match: " + tweet.text.match(/^\d{1,2}'/)); // ’ or ' ? 
	console.log(tweet.text);
	if(tweet.user.screen_name === "gnirtsmodnar" && matchMinutes(tweet.text)) {  // .match(/^\d{1,2}’/) && tweet.user.screen_name === "CLTIndependence"
  		editPost(tweet.text);
	}
})

function matchMinutes(string) {
	if (string.match(/^\d{1,2}’/) || string.match(/^\d{1,2}'/)) {
		return true;
	} else {
		return false;
	}
}

///// Post to Reddit 

function postPost(titleText, textText){

	reddit('/api/submit').post({
	  api_type: "json",
	  kind: "self",
	  text: textText, //raw markdown
	  title: titleText,
	  sr: "ncisfanclub"
	}).then(function(response){
		
		if(response.errors){
			console.log("ERROR: " + response.errors);
		}

		threadData = response.json.data;
		console.log("THREAD DATA: " + threadData.url);

	});
}

///// Edit a post

function editPost(string){

	console.log("editing. . .");
	reddit('/api/editusertext').post({
		api_type: 'json', //the string json
		text: string,	//raw markdown text
		thing_id: threadData.name //fullname of a thing created by the user
	}).then(function(response){

		if (response.json.errors){
			console.log(response.json.errors);
		} else {
			var permalink = response.json.data.things.permalink;
			console.log("EDITED: " + permalink);
			}	
		});
}


///// Fetch current markdown and append.

postPost("NEW FUCKING TITLES", "BEGIN END");	  


// var responseData = JSON.stringify(response, null, 4);
//     console.log('stringify' + stringyThingy);

// 	})

// let's upvote every comment, DELETE THIS ALL CAPS STUFF WHEN YOU'RE DONE
 // function vote(direction, element){
	//   return reddit('/api/vote').post({
	//    	 dir: direction, // up: 1 down: -1
	//    	 id: element.kind + '_' + element.data.id// e.g. t3_345jur
	//   }).then(function() {
	//    	 console.log('voted.');
	// });
	// }
//
//
//
//
//
// { json:
//    { errors: [],
//      data:
//       { url: 'https://www.reddit.com/r/ncisfanclub/comments/3f8n6q/title_goes_here/',
//         id: '3f8n6q',
//         name: 't3_3f8n6q' } } }