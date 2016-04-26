// Declare variables
//fancify it
var colors = require('colors');
//get down to business
var split = require('split');
var through = require('through2').obj;
var readline = require('readline');
var fs = require('fs'),
    obj;

// deal with the incoming file
function handleFile(buffer, _, next){
    obj = JSON.parse(buffer);
    obj.updates = ["test", "these", "updates"];
    notification = "Begin cherrypicking: ".red + JSON.stringify(obj.homeTeam).cyan + " vs. ".cyan + JSON.stringify(obj.awayTeam).cyan;
    console.log(notification);
    this.push(buffer);
    next();
}

var rl = readline.createInterface(process.stdin, process.stdout);

function getMatchData(string){
    // if function is called with no arguments query user for filename
    if(!string){
        rl.pause();
        rl.question('enter match file: ', (string) => {
            read(string);
        });
    } else {
        // if function is cal,led with argument create read stream
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
}

var display = function(){
    var handler = {};

    handler.print = function(array){
        for(var i = 0; i < array.length; i++){
            console.log((i + 1) + ": " + array[i]);
        }
    };

    handler.edits = function(array, highlightIndex){
        for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.green((i + 1) + ": " + array[i]) + " " + "EDITED".inverse);
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }};

    handler.new = function(array, highlightIndex){
        for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.green((i + 1) + ": " + array[i]) + " " + "NEW".inverse);
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }};

    handler.deleted = function(array, removedUpdate, highlightIndex){
        for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.red((i + 1) + ": " + removedUpdate) + " " + "DELETED".inverse);
            console.log((i + 1) + ": " + array[i]);
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }};


    return handler;
}();

(function cli(){

    if(process.argv[2]){
        getMatchData(process.argv[2]);
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
                obj.updates.splice(index, 0, newString);
            } else {
                obj.updates.push(newString);
            }

            display.new(obj.updates, (index + 1));
        
        } else if (line.indexOf('delete update') > -1) {
/// >delete update [index]
            var index = line.split(' ')[2];
            var removed = obj.updates.splice(index -1, 1);
            display.deleted(obj.updates, removed, index);
        } else if (line.indexOf('updates') > -1) {
/// print >updates              
            display.print(obj.updates);

        } else {
            console.log('UNKNOWN COMMAND: `' + line.trim() + '`');
        }
      rl.prompt();
    }).on('close', () => {
      console.log('Have a great day!');
      process.exit(0);
    });
})();



//// OLD CRAP

// process.stdin
//     .pipe(file)
//     .pipe(through(handleFile))
//     .pipe(process.stdout);

