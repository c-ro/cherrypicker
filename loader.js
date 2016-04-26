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
                console.log("bad filename or path".red);
                getMatchData();
            });
         // .pipe(process.stdout);
    }
}

function displayArray(array, highlightIndex){
    for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.green((i + 1) + ": " + array[i]));
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }
}

function removeFromArray(index, array){
    array.splice(index, 1);
}

(function cli(){

    if(process.argv[2]){
        getMatchData(process.argv[2]);
    }

    rl.setPrompt('cherry > ');
    rl.prompt();

    rl.on('line', (line) => {
        if(line.indexOf('load') > -1){
/// load OR load path/to/file.json
            var string;
            
            try {
                string = line.split(' ')[1];
            } catch (e) {
                return  getMatchData();
            }
            
            return  getMatchData(string);

        } else if (line.indexOf('edit update') > -1) {
/// edit update [index] "string"
            var newString,
                index = line.split(' ')[2];

            try {
                newString = line.match(/"(.*?)"/)[1];
            } catch (e) {
                return console.log("Use 'edit update [index] \"string\"'".yellow);
            }

            obj.updates[index - 1] = newString;
            displayArray(obj.updates, index);
        
        } else if (line.indexOf('delete update') > -1) {
            var index = line.split(' ')[2];
            removeFromArray(index - 1, obj.updates);
            displayArray(obj.updates);

        } else if (line.indexOf('updates') > -1) {
            displayArray(obj.updates);

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

