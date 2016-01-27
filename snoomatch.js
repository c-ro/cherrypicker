var Snoocore = require('snoocore');

//// these right here are your search terms
// var searches = ["rent", "apartments for", "for roomates", "apartments", "for a roomate"]
var user;
var threadData;
var data;

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

reddit('/api/v1/me').get().then(function(result){
	console.log(result);
});
	// /api/submit
	// /api/editusertext

function logthread(threadData){
	data = threadData; // [url, id, name]
}

reddit('/api/submit').post({
  api_type: "json",
  kind: "self",
  text: "TEXT GOES HERE",//raw markdown
  title: "TITLE GOES HERE",
  sr: "ncisfanclub" //SubReddit, get it?  cool.
}).then(function(response){
	
	if(response.errors){
		console.log("ERROR: " + response.errors);
	}

	threadData = response.json.data;
	logthread(threadData);

});

function editPost(string){
	console.log("editing. . .");
	reddit('/api/editusertext').post({
		api_type: 'json', //the string json
		text: string,	//raw markdown text
		thing_id: threadData.name //fullname of a thing created by the user
	});
}

if editPost("farts")
	  

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
