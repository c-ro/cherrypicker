//snoofuncs.js
var Snoocore = require('snoocore');
var keys = require('./keys.js');
var mrk = require('../markers/markers.js');
var colors = require('colors');
var notify = require('./notify.js');

module.exports = function(){
	////// Authenticate Reddit
	var snoo = new Snoocore({
		userAgent: keys.snoo.useragent,
		oauth: keys.snoo
	});

	var reddit = {};
	var match;

	xpost = function(){
		setTimeout(
			snoo('/api/submit').post({
			  api_type: "json",
			  kind: "link",
			  url: match.thread.url,
			  title: make.title(),
			  sr: match.xsub
			}).then(function(response){
				
				if(response.errors){
					console.log("ERROR snoo.post: " + response.errors);
				}

				var xpost = response.json.data;
				process.stdout.write(colors.cyan("XPOST: " + " [" + xpost.id + "] " + xpost.url) + "\n");
			}), 300000);
	};

	///// Get/Store user data object
	reddit.login = function(){
		snoo('/api/v1/me').get().then(function(result){
			if (!result.id){
				console.log("Reddit Connection Error");
			} else {
				console.log(colors.magenta("Logged into reddit as " + result.name + " with id: " + result.id));
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
		}).then(function(response){
			
			if(response.errors){
				console.log("ERROR snoo.post: " + response.errors);
			}

			match.thread = response.json.data;
			process.stdout.write(colors.cyan("THREAD ID/URL: " + " [" + match.thread.id + "] " + match.thread.url) + "\n");
			xpost();
		});
	};

	///// Edit a post
	reddit.edit = function(){
		/// check post for manual edits
		snoo('/r/$subreddit/comments/$article').get({
			 $subreddit: match.sub,
			 $article: match.thread.id
		}).then(function(result){
			//// get edits and add to generated post string
			var post = result[0].data.children[0].data.selftext; // Get whole selftext
			var index = post.lastIndexOf("*****") + 5;  // Generated post must end with horizontal rule, cherrypicker uses this to find manual edits.
			var edits = post.slice(index, post.length); // Get the manually added edits
			string = make.post() + edits; // add the edits to the incoming generated markdown string
		}).then(function(){
			/// send the edit request to reddit
			snoo('/api/editusertext').post({
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
	};

	// TEMPLATE HELPERS
	var make = function(){
		var make = {};

		make.title = function(){
			return "[Match Thread] " + match.home.team + " vs. " + match.away.team; // add match time
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