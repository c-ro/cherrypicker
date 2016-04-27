# CherryPicker 
Cherrypicker creates and maintains a match thread for a soccer game on the subreddit of your choice and automatically updates via the home team's twitter stream.

##Configuration:

1. Clone the repo, and created a file called keys.js in the main directory and insert the following template:  

````javascript
module.exports = {

	twit: {
		consumer_key: 'your key',
	    consumer_secret: 'your secret',
	    access_token: 'your token',
	    access_token_secret: 'your token secret'
	},

	snoo: {
		type: 'script',
		key:'xxxxx',
		secret:'xxxxx',
		username: 'username',
		useragent: '/u/username username',
		password: 'password',
		scope: ['identity','read','vote','submit', 'edit']
	}
};
````

2. Then, register an app with both Twitter and Reddit and place them in keys.js.
3. In a console, in the cherrypicker directory, run `npm install`.
4. Run `node cherrypicker.js'

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

###Start cherrypicking
Once your match object is loaded just run `start`

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
  4. create a new update either at the end of the current list:
    `new update "cool new update`
    or inserted at the index of your choice:
    `new update [index] "cool new update"`



That should be it!  If you have trouble just yell at me on Twitter: [@gnirtsmodnar](http://www.twitter.com/gnirtsmodnar)
