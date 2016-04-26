#THIS.WHATEVER is a command line utility for cherrypicker

    THIS.WHATEVER allows you to start an instance of cherrypicker.js by loading a json file and make changes to the instance's data from the command line.

##Usage:
###Create a match file:
A match file is a json file with the following structure:
```json
{
    "homeTeam": "Home City",
    "homeUsername": "Home City FC",
    "awayTeam": "Awaysville",
    "awayUsername": "Terrible and Smelly Away Team",
    "date": "4/7/16",
    "time": "8:05",
    "stream": "http://www.youtube.com/orwhatever",
    "targetSub": "subreddit"
}
```

###Loading a match file:
You can load a file in three ways:
  1. as an argument when you call the script: `node loader.js yourfilename.json`
  2. after starting loader.js and passing the filename as an argument to the load command: `load yourfilename.json`
  3. by giving the load command and responding to the script's query:
```
    load
    enter match file: yourfilename.json
```

###Editing match updates:
You can interact with cherrypickers match update data in the following ways:
  1. show the list of updates `updates`
```
    1: indexed
    2: list
    3: of
    4: updates
```
  2. delete an update `delete update [index]`
  3. edit an update `edit update [index] "string"`

