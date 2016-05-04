else if (line.indexOf('match') > -1) {

    var matchNames,
        matchObjects;

    matchArray.forEach(function(object){
        matchNames.push(object.name);
        matchObjects.push(object.match);
    });

    if(line.split(' ').length < 2){
        if(current){
            console.log(JSON.stringify(current));
        } else {
            display.matches(matchArray); // if no current match display list 
        }
    } else {
        var argument = line.split(' ')[1];
        if (argument === 'list') {
            display.matches(matchArray); // display list if explicitly asked for ignoring DRY for clarity
        }

        else if (Number(argument)){
            current = matchObjects[Number(argument)];
        } 

        else if (matchNames.indexOf(argument) > -1){
            current = matchObjects[argument];
        } 

        else {
            return console.log("Use 'match' to view list of matches. Use 'match [index]' or 'match [name]' to select".yellow);        
        }
    }
}
