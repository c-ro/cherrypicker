 // #!/usr/bin/env node

//local dependencies
var twitter = require('./twitfuncs.js');
var reddit = require('./snoofuncs.js');
var twitter = require('./twitfuncs.js');
var display = require('./display.js');
var notify = require('./notify.js');
// TODO: Notify is kind of annoying now that we're doing interactive stuff in the terminal.  Maybe notify of edits with timestamp and new update?

// other node dependencies
var prompt = require('prompt');
var colors = require('colors');
var split = require('split');
var through = require('through2').obj;
var readline = require('readline');

var match = function(){

    var data = {};

    	data.home = {
	        team: "",
	        username: "",
	        score: 0
	    };

	    data.away = {
	        team: "",
	        username: "",
	        score: 0
	    };

	    data.time = "";

	    data.stream = "";

	    data.sub = "";

        data.xsub = "";

   	 	data.updates = ["0' - Get hyped."];

   	 	// script logs the id of the last tweet so it can check for missed updates after a disconnect
	    data.lastTweet = "";

	    // thread data returned from Reddit.
	    data.thread = {};

	var funcs = {};
	    funcs.input = function(input){
	    	data.home.team = input.homeTeam;
	    	data.home.username =  input.homeUsername.toLowerCase();
	    	data.away.team =  input.awayTeam;
	    	data.away.username =  input.awayUsername.toLowerCase();
	    	data.stream = input.stream;
	    	data.sub = input.targetSub.toLowerCase();
            data.xsub = input.xSub.toLowerCase();
	    	// console.log(colors.cyan("Match Thread starting with this data: \n"), data);
	    };

	    funcs.update = function(string, index){
	    	string = string.replace(/\n/g, ' ');

			if(index){
				data.updates.splice(index, 0, string);	
			} else {			
		    	data.updates.push(string);	
			}
			reddit.edit();
	    };

	    funcs.isUpdate = function(string) {
	    	// TODO: make these cases more clear, store in array?
			if (string.match(/(\d{1,2}[’'+:])/) || string.match(/^(FT)/) || string.match(/FULL*.TIME/) || string.match(/(XI)/)) {
				return true;
			} else {
				return false;
			}
		};

		funcs.missedUpdates = function(statuses){
			var newUpdates = [];

			for(var i = 0; i < statuses.length; i++){
				if(statuses[i].id > match.lastTweet && match.isUpdate(statuses[i].text)){
					newUpdates.push(statuses[i].text);
				}
			}
			
			return newUpdates;
		};

	return {
		data: data,
		funcs: funcs
	};

}();

(function cli(){

    var fs = require('fs'),
    obj;

    var rl = readline.createInterface(process.stdin, process.stdout);

    function getMatchData(string){
        // if function is called with no arguments query user for filename
        if(!string){
            rl.pause();
            rl.question('enter match file: ', (string) => {
                read(string);
            });
        } else {
            // if function is called with argument create read stream
            read(string);
        }

        function read(string){
            var stream = fs.createReadStream(string);

                stream.on('open', function(){
                    stream.pipe(through(handleFile));
                });

                stream.on('error', function(err){
                    console.log("bad filename or path".yellow);
                    getMatchData();
                });
             // .pipe(process.stdout);
        }

        // through2 function to  parse match data object
        function handleFile(buffer, _, next){
            obj = JSON.parse(buffer);
            notification = "Match Data Loaded for ".red + JSON.stringify(obj.homeTeam).cyan + " vs. ".cyan + JSON.stringify(obj.awayTeam).cyan;
            console.log(notification);
            match.funcs.input(obj);
            obj = match.data;
            this.push(buffer);
            next();
        }
    }

    if(process.argv[2]){
        getMatchData(process.argv[2]);
    }

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

    rl.setPrompt('cherry > ');
    rl.prompt();

    rl.on('line', (line) => {
        if(line.indexOf('load') > -1){
/// >load OR >load path/to/file.json
            var string;
            
            try {
                string = line.split(' ')[1];
            } catch (e) {
                return  getMatchData();
            }
            
            return  getMatchData(string);

        } else if (line.indexOf('edit update') > -1) {
/// >edit update [index] "string"
            var newString,
                index = line.split(' ')[2];

            try {
                newString = line.match(/"(.*?)"/)[1];
            } catch (e) {
                return console.log("Use 'edit update [index] \"string\"'".yellow);
            }

            obj.updates[index - 1] = newString;
            display.edits(obj.updates, index);
        	reddit.edit();

        } else if (line.indexOf('new update') > -1) {
/// >new update [index] "string" or new update "string"
            var index = obj.updates.length,
                newString;

            try {
                newString = line.match(/"(.*?)"/)[1];
            } catch (e) {
                return console.log("Use 'new update [index] \"string\"' or 'new update \"string\"'".yellow);
            }

            if(line.split(' ')[2].length === 1){
                index = line.split(' ')[2] - 1;
                match.funcs.update(newString, index);
            } else {
                match.funcs.update(newString);
            }

            display.new(obj.updates, (index + 1));
        
        } else if (line.indexOf('delete update') > -1) {
/// >delete update [index]
            var index = line.split(' ')[2];
            var removed = obj.updates.splice(index -1, 1);
            display.deleted(obj.updates, removed, index);
            reddit.edit();

        } else if (line.indexOf('updates') > -1) {
/// print >updates              
            display.print(obj.updates);

        } else if (line.indexOf('start') > -1) {
/// start stream/thread
		reddit.post(match.data);
		twitter.go(match);

        } else if (line.indexOf('match') > -1) {
        	console.log(match.data);
        } 

        // TODO: add/edit stream/time/other stuff
        // TODO: post edits (bottom of reddit edits)
        // TODO: print reddit post string in terminal

        else {
            console.log('UNKNOWN COMMAND: `' + line.trim() + '`');
        }
      rl.prompt();
    }).on('close', () => {
      console.log('Have a great day!');
      process.exit(0);
    });
})();

///// Get Input
// TODO: If `start` runs without data in the match object get user input