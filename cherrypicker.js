#!/usr/bin/env node

//local dependencies
var keys = require('./keys');
var mrk = require('../markers/markers.js');

// other node dependencies
var Twit = require('twit');
var Snoocore = require('snoocore');
var colors = require("colors/safe");
var prompt = require('prompt');

//////  All the info here, ok?

	// data: {

 //    	home: {
	//         team: "HOME",
	//         username: "cherrypickerusl",
	//         score: 0
	//     },

	//     away: {
	//         team: "AWAY",
	//         username: "AWAY",
	//         score: 0
	//     },

	//     stream: {
	//         url: "http://stream.com"
	//     },

	//     sub: "ncisfanclub",

 //   	 	updates: []
 //    },

var match = {
    
    // user input data
	data: {

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

   	 	updates: []
    },

    input: function(result){
    	this.data.home.team = result.homeTeam;
    	this.data.home.username = result.homeUsername;
    	this.data.away.team = result.awayTeam;
    	this.data.away.username = result.awayUsername;
    	this.data.stream.url = result.stream;
    	this.data.sub = result.targetSub;
    	console.log("Match Thread starting with this data: \n", this.data);
    },

    update: function(string){
    	this.updates.push(string);
    },

    // script logs the id of the last tweet so it can check for missed updates after a disconnect
    lastTweet: null,

    // thread data returned from Reddit.
    thread: {}
};

///// Get/Store user data object  
function cherrypicker(){
	reddit('/api/v1/me').get().then(function(result){
		if (!result.id){
			console.log("Reddit Connection Error");
		} else {
			console.log("Logged into reddit as " + result.name + " with id: " + result.id);
			getUserInput();
			// stream();
			// poster();
			//postThread(title, body)
		    //postThread(makeTitle(), makePost()); ///// MAKE A POST	
		}
	});
}

///// Get Input
function getUserInput(){
	prompt.message = colors.green(">");
	prompt.delimiter = colors.green("");

	prompt.start();

	prompt.get({

		properties: {
			targetSub: {
				description: colors.green("Target Sub:")
			},
			homeTeam: {
				description: colors.green("Home Team Name:")
			},
			awayTeam: {
				description: colors.green("Away Team Name:")
			},
			homeUsername: {
				description: colors.green("Home Team Username: @")
			},
			awayUsername: {
				description: colors.green("Away Team Username: @")
			},
			stream: {
				description: colors.green("Stream URL:")
			},
		}

		}, function (err, result) { 
		// 'targetSub', 'homeTeam', 'homeUsername', 'awayTeam', 'awayUsername', 'stream']
		if (err) { return onErr(err); }

	/// This should be a single function call to the match object
		match.input(result);
		// match.data.sub = result.targetSub;
		// match.add("home", result.homeTeam, result.homeUsername);
		// match.add("away", result.awayTeam, result.awayUsername);
		// match.data.stream.url = result.stream;

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

		var text = tweet.text;

		if(tweet.user.screen_name.toLowerCase() === match.data.home.username && isMatchUpdate(text) && text.indexOf('http:') === -1){ //tweet.user.screen_name.toLowerCase() === match.data.home.username && isMatchUpdate(update)
			text = text.replace(/\S*#(?:\[[^\]]+\]|\S+)/, '');
		  	
		  	match.update(text);
		  	
		  	editPost(makePost());

		  	match.lastTweet = tweet.id;
		} else {
			return;
			// console.log("non-minute tweet");
		}

	});
}
///// Is that tweet a match update?
function isMatchUpdate(string) {
	if (string.match(/(\d{1,2}[’'+:])/) || string.match(/^(FT)/) || string.match(/FULL*.TIME/) || string.match(/(XI)/)) {
		return true;
	} else {
		return false;
	}
}

///// Post to Reddit 
function postThread(title, body){

	reddit('/api/submit').post({
	  api_type: "json",
	  kind: "self",
	  text: body, //raw markdown string
	  title: title, // regular string
	  sr: match.data.sub
	}).then(function(response){
		
		if(response.errors){
			console.log("ERROR postThread: " + response.errors);
		}

		match.thread = response.json.data;

		console.log("CREATED THREAD: " + match.thread.url);
		console.log("POST ID:" + match.thread.id);
	});
}

///// Edit a post
function editPost(string){
	/// check post for manual edits
	reddit('/r/$subreddit/comments/$article').get({
		 $subreddit: match.data.sub,
		 $article: match.thread.id
	}).then(function(result){
		//// get edits and add to generated post string
		var post = result[0].data.children[0].data.selftext;
		var index = post.lastIndexOf("*****") + 5;
		var edits = post.slice(index, post.length);
		string = string + edits;
	}).then(function(){
		/// edit the post
		reddit('/api/editusertext').post({
			api_type: 'json', //the string json
			text: string,	//raw markdown text
			thing_id: match.thread.name //fullname of a thing created by the user
		}).then(function(response){
			if (response.json.errors.length > 0){
				console.log("EDIT ERROR", response);
			} else {
				var title = response.json.data.things[0].data.title; // things is an array, wtf?
					process.stdout.clearLine();  					 // clear current text
  					process.stdout.cursorTo(0); 					 // move cursor back to left
  					process.stdout.write("EDITED: " + title + "\r"); // write to console
			}	
		});

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
	return "[Match Thread] " + match.data.home.team + " vs. " + match.data.away.team; // add match time
}

function makeHeader(){
	return mrk.bold(match.data.home.team + " vs. " + match.data.away.team);
}

function makeStream(){
    return mrk.bold("Stream: " + mrk.link("youtube", match.data.stream.url));
}    

function makeScore(){
 var string = "\n*****\n\n**CURRENT SCORE:** (" + match.data.home.score + "--" + match.data.away.score +")\n\nLast Updated: " + date;
 return string;
}

function makeUsernameLink(username){
    var link = "[" + username + "]" + "(http://www.twitter.com/" + username.slice(0) + ")";
    return link;
}

function makePost(){
	return mrk.section(makeHeader()) + mrk.section(makeStream()) + mrk.section(mrk.list(match.data.updates));
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
		if(statuses[i].id > match.lastTweet && isMatchUpdate(statuses[i].text)){
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
	twitter.get('search/tweets', {q: 'from:' + match.data.home.username, count: 90}, function(error, data, response){
		if (error) {
			console.log("error:", error);
		} else {
			var updates = tweetsSinceDisconnect(data.statuses.reverse());
			if (updates){
				match.data.updates = match.data.updates.concat(updates);
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