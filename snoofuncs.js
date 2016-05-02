//snoofuncs.js
var Snoocore = require('snoocore');
var keys = require('./keys.js');
var mrk = require('../markers/markers.js');
var colors = require('colors');
var notify = require('./notify.js');
var hrt = require('human-readable-time');
	var clock = new hrt('hh:mm');

module.exports = function(){
	////// Authenticate Reddit
	var snoo = new Snoocore({
		userAgent: keys.snoo.useragent,
		oauth: keys.snoo
	});

	var reddit = {};
	var match;

	function retry(fn, time){
		console.log("retrying in " + ((time + 10000)/1000) + " seconds.");
		setTimeout(fn, time + 10000);
	}

	reddit.xpost = function(){
		snoo('/api/submit').post({
		  api_type: "json",
		  kind: "link",
		  url: match.thread.url,
		  title: make.awaytitle(),
		  sr: match.xsub
		})

		.then(function(response){
			var xpost = response.json.data;
			process.stdout.write(colors.yellow("XPOST: " + " [" + xpost.id + "] " + xpost.url) + "\n");
		})

		.catch(function(error){
			var response = JSON.parse(error.body).json;
			if(response.ratelimit){
				retry(reddit.xpost, response.ratelimit * 1000);
			} else {
				console.log(colors.yellow(response));
			}
		});
	};

	///// Get/Store user data object
	reddit.login = function(){
		snoo('/api/v1/me').get().then(function(result){
			if (!result.id){
				console.log(colors.yellow("Reddit Connection Error"));
			} else {
				console.log(colors.yellow("Logged into reddit as " + result.name + " with id: " + result.id));
			}
		});
	};

	///// Post to Reddit 
	reddit.post = function(object){
		
		match = object; // hoist incoming match data to parent function
		
		reddit.login();

		snoo('/api/submit').post({
		  api_type: "json",
		  kind: "self",
		  text: make.post(), //raw markdown string
		  title: make.title(),
		  sr: match.sub
		})

		.then(function(response){

			match.thread = response.json.data;
			process.stdout.write(colors.yellow("THREAD ID/URL: " + " [" + match.thread.id + "] " + match.thread.url) + "\n");
		})

		.catch(function(error){
			var response = JSON.parse(error.body).json;
			if(response.ratelimit){
				retry(function(){ reddit.post(object); }, response.ratelimit * 1000);
			} else {
				console.log(response);
			}
		});
	};

	///// Edit a post
	reddit.edit = function(){
		if(match.thread.id){
			/// check post for manual edits
			snoo('/r/$subreddit/comments/$article').get({
				 $subreddit: match.sub,
				 $article: match.thread.id
			})

			.then(function(result){
				//// get edits and add to generated post string
				var post = result[0].data.children[0].data.selftext; // Get whole selftext
				var index = post.lastIndexOf("*****") + 5;  // Generated post must end with horizontal rule, cherrypicker uses this to find manual edits.
				var edits = post.slice(index, post.length); // Get the manually added edits
				string = make.post() + edits; // add the edits to the incoming generated markdown string
			})

			.then(function(){
				/// send the edit request to reddit
				snoo('/api/editusertext').post({
					api_type: 'json', //the string 'json'
					text: string, // incoming markdown string
					thing_id: match.thread.name // fullname of a thing created when the reddit post was made
			})

			.then(function(response){
						var title = response.json.data.things[0].data.title; // things is an array, wtf?
						notify.log("[ " + clock(new Date(0)) + "] UPDATE: " + title + "\r");
			})

			.catch(function(error){
				var response = JSON.parse(error.body).json;
					if(response.ratelimit){
						retry(reddit.edit, response.ratelimit * 1000);
					} else {
						console.log(colors.yellow(response));
					}
				});

			});
		}
	};

	// TEMPLATE HELPERS
	var make = function(){
		var make = {};

		make.title = function(){
			return "[Match Thread] " + match.home.team + " vs. " + match.away.team; // add match time
		};

		make.awaytitle = function(){
			return "[Match Thread] " + match.away.team + " @ " + match.home.team; // add match time
		};

		make.header = function(){
			return mrk.bold(match.home.team + " vs. " + match.away.team);
		};

		make.stream = function(){
		    return mrk.link("View Stream", match.stream);
		};

		make.score = function(){
			 var string = "\n*****\n\n**CURRENT SCORE:** (" + match.home.score + "--" + match.away.score +")\n\nLast Updated: " + date;
			 return string;
		};

		make.post = function(){
			return mrk.section(make.header()) + 
			mrk.section(make.stream()) + 
			mrk.section(
				"Updates via " + 
				mrk.link(match.home.username, "@") + 
				mrk.br() + 
				mrk.list(match.updates)
				);
		};

		return make;
	}();

	return reddit;
}();