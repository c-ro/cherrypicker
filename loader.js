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
    if(!string){
        rl.pause();

        rl.question('enter match file: ', (string) => {
            read(string);
        });
    } else {
        read(string);
    }

    function read(string){
        fs.createReadStream(string)
            .pipe(through(handleFile));
         // .pipe(process.stdout);
    }
}

function displayArray(array){
    for(var i = 0; i < array.length; i++){
        console.log((i + 1) + ": " + array[i]);
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

            return getMatchData();
        
        } else if (line.indexOf('edit update') > -1) {

            var i = line.split(' ')[2];
            //should capture anything in quotes
            obj.updates[i - 1] = line.split(' ')[3];
            console.log(obj.updates[i - 1]);
        
        } else if (line.indexOf('delete update') > -1) {

            var i = line.split(' ')[2];
            removeFromArray(i - 1, obj.updates);
            displayArray(obj.updates);
        
        } else if (line.indexOf('updates') > -1) {
            displayArray(obj.updates);

        } else {
            console.log('UNKNOWN COMMAND: `' + line.trim() + '`');
        }

      // switch(line.trim()) {
      //   case 'load':
      //       getMatchData();
      //       break;
      //   case 'updates':
      //       displayArray(obj.updates);
      //       break;
      //   case (line.indexOf("edit updates") > -1):
      //       console.log(line.split(' ')[2]);
      //       break;
      //   default:
      //       console.log('Say what? I might have heard `' + line.trim() + '`');
      //       break;
      //}
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

