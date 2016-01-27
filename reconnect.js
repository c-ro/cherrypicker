var Twit = require('twit');
var Snoocore = require('snoocore');
var user;
var threadData;
var data;
var matchUpdates = [""];

//////  All the info here, ok?
var matchData = {
    home: {
        team: "",
        username: "",
        score: 0
    },
    
    away: {
        team: "",
        username: "",
        score: 0
    },

    stream: {
        url: ""
    },

    sub: "",

    id: ""
};

///// Get/Store user data object  
function cherrypicker(){
	reddit('/api/v1/me').get().then(function(result){
		console.log("Logged in " + result.name + " with id: " + result.id);
		getUserInput();
		stream();		
	});
}

///// Get Input
function getUserInput(){
	var prompt = require('prompt');

	  prompt.start();

	  prompt.get(['match'], function (err, result) {
	    if (err) { return onErr(err); }
	    
		console.log('  ENTER matchData Object:' + result.match);
			matchData = result.match;
	  	
	  	getPost(re); ///// GET THE POST

	  });

	  function onErr(err) {
	    console.log(err);
	    return 1;
	  }
};

////// start listening to Twitter
function stream(){
	var stream = twitter.stream('user', {screen_name: 'gnirtsmodnar'})

	stream.on('tweet', function (tweet) {
		if(tweet.user.screen_name === matchData.home.username && matchMinutes(tweet.text)) {
	  	matchUpdates.push(tweet.text);
	  	editPost(makePost);
		}
	})
}

///// Is that tweet a match update?
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
	  sr: "louisvillecityfc"
	}).then(function(response){
		
		if(response.errors){
			console.log("ERROR postPost: " + response.errors);
		}

		threadData = response.json.data;

		console.log("THREAD DATA: " + threadData.url);
		console.log("POST ID:" + threadData.id)

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

		if (response.json.errors.length > 0){
			console.log("EDIT ERROR");
			console.log(response);
		} else {
			// var responseData = JSON.stringify(response, null, 4); //this works
			var permalink = response.json.data.things.data.permalink; // this maybe not
			console.log("EDITED: " + permalink);
			}	
		});
}

// TEMPLATE FUNCTIONS
////////////////////
////////////////
////////////
////////
////
//

function makeTitle(){
	return "[Match Thread] " + matchData.home.team + " vs. " + matchData.away.team;
};

function makeHeader(){
    var string = "**" + matchData.home.team + " vs. " + matchData.away.team + "**";
    return string;
}

function makeStream(){
    var string = "\n*****\n**Stream:** " + matchData.stream.url;
    return string;
}    

function makeUpdates(){
    var string = "\n*****\n**Match Updates via " + makeUsernameLink(matchData.home.username) + "**\n\n* " + matchUpdates.join('\n*  ');
    return string;
}

function makeScore(){
 var string = "\n*****\n\n**CURRENT SCORE:** (" + matchData.home.score + "--" + matchData.away.score +")\n\nLast Updated: " + date;
 return string;
}

function makeUsernameLink(username){
    var link = "[" + username + "]" + "(http://www.twitter.com/" + username.slice(1) + ")";
    return link;
}

function makePost(){
	return makeHeader() + makeStream() + makeUpdates(); // score();
}

//START DOING THINGS
////////////////////
////////////////
////////////
////////
////
//

///// Authenticate Twitter

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
		key:'PmwZVwGqsKLKiQ',
		secret:'bYT5TYJYS0YXrsxdfNl5MzFngIg',
		username: 'dicklangly',
		password: '1005simon',
		scope: ['identity','read','vote','submit', 'edit']
	}
});

cherrypicker();


  





/////// Do this later
// function findStream(){
    
// }

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
// { json:
//    { errors: [],
//      data:
//       { url: 'https://www.reddit.com/r/ncisfanclub/comments/3f8n6q/title_goes_here/',
//         id: '3f8n6q',
//         name: 't3_3f8n6q' } } }