var tweets = ["90' tweet update", "91' another tweet update yay", "92' last one, gotta do other stuff", "testing the next one", "just making sure this works"];
var date = new Date().toLocaleTimeString();

var matchData = {
    
    home: {
        team:"LCFC",
        username: "@LouCityFC",
        score:0
    },
    
    away: {
        team:"LSRS",
        username: "@LoserFC",
        score:0
    },
    
    stream: "http://www.youtube.com",
    
}

// function startingEleven(matchData){
//     var string = "\n*****\n**Starting XI's: **" + "[" + matchData.home.????? + "]" + "(http://twitter.com) + -- [AWAY](http://twitter.com)";
// }

function makeHeader(){
    var string = "**" + matchData.home.team + " vs. " + matchData.away.team + "**";
    return string;
}

function makeStream(){
    var string = "\n*****\n**Stream:** " + matchData.stream;
    return string;
}    

function makeUpdates(tweets){
    var string = "\n*****\n**Match Updates via " + makeUsernameLink(matchData.home.username) + "**\n\n* " + tweets.join('\n* ');
    return string;
}

function makeScore(matchData){
 var string = "\n*****\n\n**CURRENT SCORE:** (" + matchData.home.score + "--" + matchData.away.score +")\n\nLast Updated: " + date;
 return string;
}

function makeUsernameLink(username){
    var link = "[" + username + "]" + "(http://www.twitter.com/" + username.slice(1) + ")";
    return link;
}

console.log(header(matchData) + stream(matchData) + updates(tweets, matchData), score(matchData));
