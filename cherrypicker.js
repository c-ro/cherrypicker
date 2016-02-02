#!/usr/bin/env node
var Twit = require('twit');
var Snoocore = require('snoocore');
var user;
var threadData;
var data;
var matchUpdates = ["0': Nothing has happened."];
var keys = require('./keys');
var lastTweet;

//////  All the info here, ok?
// var matchData = {
//     home: {
//         team: "",
//         username: "",
//         score: 0
//     },
    
//     away: {
//         team: "",
//         username: "",
//         score: 0
//     },

//     stream: {
//         url: ""
//     },

//     sub: ""
// };

var matchData = {
    home: {
        team: "HOME",
        username: "cherrypickerusl",
        score: 0
    },
    
    away: {
        team: "AWAY",
        username: "AWAY",
        score: 0
    },

    stream: {
        url: "stream.com"
    },

    sub: "ncisfanclub",
   	edits: []
};

var printUpdates = function(){
	console.log(updates);
};

///// Get/Store user data object  
function cherrypicker(){
	reddit('/api/v1/me').get().then(function(result){
		// if (result.json.errors.length > 0){
		// 	console.log("INIT ERROR");
		// 	console.log(response);
		// } else {
			console.log("Logged in " + result.name + " with id: " + result.id);
			// getUserInput();
			stream();
			poster();
		    postPost(makeTitle(),makePost()); ///// MAKE A POST	
		});
}

///// Get Input
function getUserInput(){
	var prompt = require('prompt');

	  prompt.start();

	  prompt.get(['targetSub', 'homeTeam', 'homeUsername', 'awayTeam', 'awayUsername', 'stream'], function (err, result) {
	    if (err) { return onErr(err); }
	    
	    console.log('Enter Match Data:');
	    
		console.log('  Target Subreddit:' + result.targetSub);
			matchData.sub = result.targetSub;

	    console.log('  Home Team Name:' + result.homeTeam);
	    console.log('  Home Team Username:' + result.homeUsername);
	      matchData.home.team = result.homeTeam;
	      matchData.home.username = result.homeUsername;
	    
	    console.log('  Away Team Name: ' + result.awayTeam);
	    console.log('  Away Team Username: ' + result.awayUsername);
	      matchData.away.team = result.awayTeam;
	      matchData.away.username = result.awayUsername;

	    console.log('  Stream URL: ' + result.stream);
	      matchData.stream.url = result.stream;

	    console.log(matchData);
	    // postPost(makeTitle(),makePost()); ///// MAKE A POST	
	  });

	  function onErr(err) {
	    console.log(err);
	    return 1;
	  }		
}

////// start listening to Twitter
function stream(){
	var stream = twitter.stream('user', {screen_name: 'cherrypickerusl'});

	stream.on('tweet', function (tweet) {

		var update = tweet.text;

		if(tweet.user.screen_name.toLowerCase() === matchData.home.username && isMatchUpdate(update) && tweet.text.indexOf('http:') === -1){ //tweet.user.screen_name.toLowerCase() === matchData.home.username && isMatchUpdate(update)
			update = update.replace(/\S*#(?:\[[^\]]+\]|\S+)/, '');
			// update = update.boldAllCaps();
		  	matchUpdates.push(update);
		  	editPost(makePost());
		  	lastTweet = tweet.id;
		} else {
			// console.log("non-minute tweet");
		}

	});
}
///// Is that tweet a match update?
function isMatchUpdate(string) {
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
	  sr: matchData.sub
	}).then(function(response){
		
		if(response.errors){
			console.log("ERROR postPost: " + response.errors);
		}

		threadData = response.json.data;

		console.log("CREATED THREAD: " + threadData.url);
		console.log("POST ID:" + threadData.id);
	});
}

///// Edit a post
function editPost(string){
	fetchEdits(function(){
		reddit('/api/editusertext').post({
			api_type: 'json', //the string json
			text: string,	//raw markdown text
			thing_id: threadData.name //fullname of a thing created by the user
		}).then(function(response){
			if (response.json.errors.length > 0){
				console.log("EDIT ERROR", response);
			} else {
				var title = response.json.data.things[0].data.title; // things is an array, wtf?
				console.log("EDITED: " + title);
			}	
		});
	});
}

///// Read a post 
function readPost(id, subreddit, callback){
	var post;
		reddit('/r/$subreddit/comments/$article').get({
			 $subreddit: subreddit,
			 $article: id
		}).then(function(result){
			post = result[0].data.children[0].data.selftext;
		}).then(function(){
			callback(post);
		});
}	

///// Store Edits 
function fetchEdits(callback){
	var post = readPost(threadData.id, matchData.sub, function(post){
		var edits = post.match(/edit:.*/g);
		if(edits){
			edits.forEach(function(edit){
				if(matchData.edits.indexOf(edit) === -1){
					matchData.edits = matchData.edits.concat(edits);
					console.log(matchData.edits);
				}
			});
		}
	});
	callback();
}

// TEMPLATE FUNCTIONS
////////////////////
////////////////
////////////
////////
////
//

String.prototype.boldAllCaps = function() {
    var update = this;
    var caps = update.match(/[A-Z]+/);
    var bold = "**" + caps[0] + "**";
    var output = update.replace(/[A-Z]+/, bold);
    return output;
};

function makeTitle(){
	return "[Match Thread] " + matchData.home.team + " vs. " + matchData.away.team; // add match time
}

function makeHeader(){
    var string = "**" + matchData.home.team + " vs. " + matchData.away.team + "**";
    return string;
}

function makeFooter(){
    // var string = "^" + matchData.home.team + " vs. " + matchData.away.team + "**"; 
    var string = '';
    if(matchData.edits){ string = "\n\n*****\n" + matchData.edits; }
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
    var link = "[" + username + "]" + "(http://www.twitter.com/" + username.slice(0) + ")";
    return link;
}

function makePost(){
	return makeHeader() + makeStream() + makeUpdates() + makeFooter(); // score();
}

//START DOING THINGS
////////////////////
////////////////
////////////
////////
////
//

///// Authenticate Twitter

var twitter = new Twit(keys.twit);

////// Authenticate Reddit

var reddit = new Snoocore({
	userAgent: '/u/cherrypicker_usl cherrypicker',
	oauth: keys.snoo
});

////// Test Posts -- REPLACE checkConnection(); in production
var poster = function (){
	
	var minute =  1;
	var test = function(){
		checkConnection(); // REPLACE THIS IN PROD
		var date = new Date();

		tweet = minute + "' - " + date.getTime();
		twitter.post('statuses/update', { status: tweet }, function(err, data, response){});
		if(minute === 90){
			minute = 1;
		} else {
			minute++;
		}
		setTimeout(test, 60000);
	};

	setTimeout(test, 5000);
};

var tweetsSinceDisconnect = function(statuses){
	var newUpdates = [];
	for(var i = 0; i < statuses.length; i++){
		if(statuses[i].id > lastTweet && isMatchUpdate(statuses[i].text)){
			newUpdates.push(statuses[i].text);
		}
	}
	return newUpdates;
};

var checkConnection = function(){ 
	///// When not testing with poster() check every 5 mins
	////
	///
	//
	twitter.get('search/tweets', {q: 'from:' + matchData.home.username, count: 90}, function(error, data, response){
		if (error) {
			console.log("error:", error);
		} else {
			var updates = tweetsSinceDisconnect(data.statuses.reverse());
			if (updates){
				matchUpdates = matchUpdates.concat(updates);
				updates = [];
			}
		}
	});
};

cherrypicker();
/////// Do this later
// function findStream(){
    
// }

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