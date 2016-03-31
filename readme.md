# CherryPicker 
Cherrypicker creates and maintains a match thread for a soccer game on the subreddit of your choice and automatically updates via the home team's twitter stream.

Usage:

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

That should be it!  If you have trouble just yell at me on Twitter: [@gnirtsmodnar](http://www.twitter.com/gnirtsmodnar)
