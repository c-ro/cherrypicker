#!/usr/bin/env node

//local dependencies
var keys = require('./keys');
var mrk = require('../markers/markers.js');
var notify = require('./notify.js'); 

// other node dependencies
var Twit = require('twit');
var Snoocore = require('snoocore');
var colors = require("colors/safe");
var prompt = require('prompt');

var match = { //TODO: Should this be an immediately invoked module?
    
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

	    stream: "",

	    sub: "",

   	 	updates: ["0' - Get hyped."]
    },

    input: function(input){
    	this.data.home.team = input.homeTeam;
    	this.data.home.username =  input.homeUsername.toLowerCase();
    	this.data.away.team =  input.awayTeam;
    	this.data.away.username =  input.awayUsername.toLowerCase();
    	this.data.stream = input.stream;
    	this.data.sub = input.targetSub.toLowerCase();
    	console.log(colors.cyan("Match Thread starting with this data: \n"), this.data);
    },

    update: function(string){
    	this.data.updates.push(string);
    },

    isUpdate: function(string) {
    	// TODO: make these cases more clear, store in array?
		if (string.match(/(\d{1,2}[’'+:])/) || string.match(/^(FT)/) || string.match(/FULL*.TIME/) || string.match(/(XI)/)) {
			return true;
		} else {
			return false;
		}
	},

	missedUpdates: function(statuses){
		var newUpdates = [];

		for(var i = 0; i < statuses.length; i++){
			if(statuses[i].id > match.lastTweet && match.isUpdate(statuses[i].text)){
				newUpdates.push(statuses[i].text);
			}
		}
		
		return newUpdates;
	},

    // script logs the id of the last tweet so it can check for missed updates after a disconnect
    lastTweet: "",

    // thread data returned from Reddit.
    thread: {}
};

///// Get Input
function getUserInput(callback){
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
			homeUsername: {
				description: colors.green("Home Team Username: @")
			},
			awayTeam: {
				description: colors.green("Away Team Name:")
			},
			awayUsername: {
				description: colors.green("Away Team Username: @")
			},
			stream: {
				description: colors.green("Stream URL:")
			},
		}

		}, function (err, result) { 
		
		if (err) { return onErr(err); }
		
		// Send the result object back and process elsewhere
		callback(result);
	});

	function onErr(err) {
		console.log(err);
		return 1;
	}	
}

///// Post to Reddit 
function postThread(title, body){ // TODO: Should this be a method on the match object?
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

		process.stdout.write(colors.cyan("THREAD ID/URL: " + " [" + match.thread.id + "] " + match.thread.url) + "\n");

	});
}

///// Edit a post
function editPost(string){ // TODO: Should this be a method on the match object?
	/// check post for manual edits
	reddit('/r/$subreddit/comments/$article').get({
		 $subreddit: match.data.sub,
		 $article: match.thread.id
	}).then(function(result){
		//// get edits and add to generated post string
		var post = result[0].data.children[0].data.selftext; // Get whole selftext
		var index = post.lastIndexOf("*****") + 5;  // Generated post must end with horizontal rule, cherrypicker uses this to find manual edits.
		var edits = post.slice(index, post.length); // Get the manually added edits
		string = string + edits; // add the edits to the incoming generated markdown string
	}).then(function(){
		/// send the edit request to reddit
		reddit('/api/editusertext').post({
			api_type: 'json', //the string 'json'
			text: string, // incoming markdown string
			thing_id: match.thread.name // fullname of a thing created when the reddit post was made
		}).then(function(response){
			if (response.json.errors.length > 0){
				console.log("EDIT ERROR", response);
			} else {
				var title = response.json.data.things[0].data.title; // things is an array, wtf?
				notify.log("EDITED: " + title + "\r");
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
var make = function(){
	/// TODO: Are these functions too dependent on the match object?
	//  Leaving this in cherrypicker.js for the time being due to dependency.
	var make = {};

	make.title = function(){
		return "[Match Thread] " + match.data.home.team + " vs. " + match.data.away.team; // add match time
	};

	make.header = function(){
		return mrk.bold(match.data.home.team + " vs. " + match.data.away.team);
	};

	make.stream = function(){
	    return mrk.link("View Stream", match.data.stream);
	};

	make.score = function(){
		 var string = "\n*****\n\n**CURRENT SCORE:** (" + match.data.home.score + "--" + match.data.away.score +")\n\nLast Updated: " + date;
		 return string;
	};

	make.post = function(){
		return mrk.section(make.header()) + mrk.section(make.stream()) + mrk.section(mrk.list(match.data.updates));
	};

	return make;

}();

////// start listening to Twitter
function stream(){
	var stream = twitter.stream('user', {screen_name: 'cherrypickerusl'});

	stream.on('error', function (error) {
	  console.log(error.message);
	});

	stream.on('connected', function (response) {
		notify.log(colors.green("twitter stream connection. . ." + response.statusMessage));
	});

	stream.on('tweet', function (tweet) {

		var text = tweet.text;

		if(tweet.user.screen_name.toLowerCase() === match.data.home.username && match.isUpdate(text) && text.indexOf('http:') === -1){ //tweet.user.screen_name.toLowerCase() === match.data.home.username && match.isUpdate(update)
			
			text = text.replace(/\S*#(?:\[[^\]]+\]|\S+)/, '');
		  	
		  	match.update(text);
		  	
		  	editPost(make.post());

		  	match.lastTweet = tweet.id;

		} else {
			return;
			// console.log("non-minute tweet");
		}

	});

	stream.on('reconnect', function (request, response, connectInterval) {
		notify.log(colors.green("attempt reconnect in: " + connectInterval + "s"));
	});
}

////// Test Posts -- REPLACE checkConnection(); in production
// var poster = function (){ //TODO: Should poster(), missedUpdates(), and checkConnection() be separated/modulized??
	
// 	var minute =  1;

// 	var test = function(){ // recursive loop
// 		// checkConnection(); // runs a twitter.get // REPLACE THIS IN PROD
// 		var date = new Date(); // just for some arbitrary data

// 		var tweet = minute + "' - " + date.getTime();

// 		twitter.post('statuses/update', { status: tweet }, function(err, data, response){
// 			if(err){
// 				notify.log("post error: " + err.errno);
// 			} else {
// 				// notify.log("post! - " + tweet);
// 			}	
// 		});
// 			if(minute === 90){ // go up to 90' then start over.
// 				minute = 1;
// 			} else {
// 				minute++;
// 			}
// 		setTimeout(test, 60000); // loop back
// 	};

// 	setTimeout(test, 5000); //start the loop
// };

var checkConnection = function(){ 
	///// When not testing with poster() check every 5 mins
	twitter.get('search/tweets', {q: 'from:' + match.data.home.username, count: 90}, function(error, data, response){
		if (error) {
			notify.log("error: " + error.errno);
		} else {
			var updates = match.missedUpdates(data.statuses.reverse());
			if (updates){
				match.data.updates = match.data.updates.concat(updates);
				updates = [];
			}
		}
	});
};

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

///// Get/Store user data object and initiate process
function cherrypicker(){
	reddit('/api/v1/me').get().then(function(result){
		if (!result.id){
			console.log("Reddit Connection Error");
		} else {
			console.log(colors.magenta("Logged into reddit as " + result.name + " with id: " + result.id));
			getUserInput(function(userInput){
				match.input(userInput);
				stream();
				// poster();
			    postThread(make.title(), make.post()); ///// MAKE A POST	
			});

		}
	});
}

cherrypicker();
// setTimeout(checkConnection, 5000);

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