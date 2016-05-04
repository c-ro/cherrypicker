/// >edit update [index] "string"
else if (line.indexOf('edit update') > -1) {
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

        }
/// >new update [index] "string" or new update "string"
else if (line.indexOf('new update') > -1) {
            var index = obj.updates.length,
                newString;

            try {
                newString = line.match(/"(.*?)"/)[1];
            } catch (e) {
                return console.log("Use 'new update [index] \"string\"' or 'new update \"string\"'".yellow);
            }

            if(line.split(' ')[2].length === 1){
                index = line.split(' ')[2] - 1;
                match.update(newString, index);
            } else {
                match.update(newString);
            }

            display.new(obj.updates, (index + 1));
        
        }
/// >delete update [index]
// TODO:  match.deleteUpdate();
        else if (line.indexOf('delete update') > -1) {
            var index = line.split(' ')[2];
            
            match.deleteUpdate(index, function(removed){
                display.deleted(obj.updates, removed, index);
            });

        }
/// print >updates 
        else if (line.indexOf('updates') > -1) {             
            display.print(obj.updates);

        }
/// start stream/thread 
        else if (line.indexOf('start') > -1) {
            reddit.post(match.data);
            if(match.data.xsub){ setTimeout(reddit.xpost, 300000); }
            twitter.go(); // TODO: twitter.go(match);
        }

// TODO: add/edit stream/time/other stuff
// TODO: post edits (bottom of reddit edits)
// TODO: print reddit post string in terminal