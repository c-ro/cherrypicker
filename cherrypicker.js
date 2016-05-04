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

(function cli(){

    var fs = require('fs');
    var matchArray = []; //{name: filename, match: { ... }}
    var current = null; //TODO: used void current??

    var newMatch = function(filename, obj){
        var newMatch = new match();
        matchArray.push({name: filename.split('.')[0], match: newMatch}); //TODO: make filename the "name" property on the match object.

        newMatch.input(obj);
    };

    function getMatchData(string){
        var filename = "";
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
            filename = string; //hoist to getMatchData
            var stream = fs.createReadStream(string);

                stream.on('open', function(){
                    stream.pipe(through(handleFile));
                });
                
                stream.on('error', function(err){
                    console.log("bad filename or path".magenta);
                    getMatchData();
                });
             // .pipe(process.stdout);
        }

        // through2 function to  parse match data object
        function handleFile(buffer, _, next){
            obj = JSON.parse(buffer);
            console.log("Match Data Loaded for ".magenta + JSON.stringify(obj.homeTeam).green + " vs. ".green + JSON.stringify(obj.awayTeam).green);
            newMatch(filename, obj); //use filename variable hoisted from read
            this.push(buffer);
            next();
        }
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

// Start talking to the user
    var rl = readline.createInterface(process.stdin, process.stdout);

    if(process.argv[2]){
        getMatchData(process.argv[2]);
    }

    if(process.argv[3] === "start"){
        getMatchData(process.argv[2]);

    }

    rl.setPrompt('cherrypicker > ');
    rl.prompt();

    rl.on('line', (line) => {

/// >load OR >load path/to/file.json
        if(line.indexOf('load') > -1){
            var string;
            try {
                string = line.split(' ')[1];
            } catch (e) {
                return  getMatchData();
            }      
            return  getMatchData(string);
        }
// show match info/select match context
        else if (line.indexOf('match') > -1) {

            var matchNames = [],
                matchObjects = [];

            matchArray.forEach(function(object){
                matchNames.push(object.name);
                matchObjects.push(object.match);
            });

            if(line.split(' ').length < 2){
                if(current){
                    console.log(current);
                } else {
                    display.matches(matchArray); // if no current match display list 
                }
            } else {
                var argument = line.split(' ')[1];
                if (argument === 'list') {
                    display.matches(matchArray); // display list if explicitly asked for ignoring DRY for clarity
                }

                else if (Number(argument)){ // if argument is index of match
                    current = matchObjects[(Number(argument) - 1)];
                } 

                else if (matchNames.indexOf(argument) > -1){ // if argument is name of match
                    current = matchObjects[argument];
                } 

                else {
                    return console.log("Use 'match' to view list of matches. Use 'match [index]' or 'match [name]' to select".yellow);        
                }
            }
        }
// Otherwise. . .
        else {
            console.log('UNKNOWN COMMAND: `' + line.trim() + '`');
        }
      rl.prompt();
    }).on('close', () => {
      console.log('Have a great day!');
      process.exit(0);
    });
})();

// match.whateverFunction
// match.data.value.anotherValue

var match = function(){

    var match = {};
        
        match.data = {};
        var data = match.data;

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

        match.input = function(input){
            data.home.team = input.homeTeam;
            data.home.username =  input.homeUsername.toLowerCase();
            data.away.team =  input.awayTeam;
            data.away.username =  input.awayUsername.toLowerCase();
            data.stream = input.stream;
            data.sub = input.targetSub.toLowerCase();
            data.xsub = input.xSub ? input.xSub.toLowerCase() : null;
            // console.log(colors.cyan("Match Thread starting with this data: \n"), data);
        };

        //TODO: SHIT, should things like the match title be made here?

        match.deleteUpdate = function(index, callback){
            var removed = data.updates.splice(index -1, 1);
            callback(removed);
        };

        match.createUpdate = function(){
            console.log("edit");
        };

        match.editUpdate = function(){
            console.log("edit");
        };

        match.update = function(string, index){
            string = string.replace(/\n/g, ' ');

            if(index){
                data.updates.splice(index, 0, string);  
            } else {            
                data.updates.push(string);  
            }
            reddit.edit();
        };

        match.isUpdate = function(string) {
            // TODO: make these cases more clear, store in array?
            if (string.match(/(\d{1,2}[’'+:])/) || string.match(/^(FT)/) || string.match(/FULL*.TIME/) || string.match(/(XI)/)) {
                return true;
            } else {
                return false;
            }
        };

        match.missedUpdates = function(statuses){
            var newUpdates = [];

            for(var i = 0; i < statuses.length; i++){
                if(statuses[i].id > match.lastTweet && match.isUpdate(statuses[i].text)){
                    newUpdates.push(statuses[i].text);
                }
            }
            
            return newUpdates;
        }; 

    return match;

};

///// Get Input
// TODO: If `start` runs without data in the match object get user input