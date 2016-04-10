// Declare variables
var fs = require('fs'),
    obj

// Read the file and send to the callback
fs.readFile('path/to/file', handleFile)

// Write the callback function
function handleFile(err, data) {
    if (err) throw err
    obj = JSON.parse(data)
    // You can now play with your datas
}


var file = {
	
	homeTeam: "Home City",
    homeUsername: "cherrypickerusl",
    awayTeam: "Awaysville",
    awayUsername: "awayz",
	date: "4/7/16",
	time: "8:05",
    stream: "http://www.youtube.com/homecitychannel",
    targetSub: "ncisfanclub"
    
}