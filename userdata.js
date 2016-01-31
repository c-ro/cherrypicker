var prompt = require('prompt');

var matchData = {
    home: {
        team: "",
        username: "",
        score: 0
    },
    
    away: {
        team: "",
        username: "",
        score: 0
    },

    stream: {
        url: ""
    }
};

  prompt.start();

  prompt.get(['homeTeam', 'homeUsername', 'awayTeam', 'awayUsername', 'stream'], function (err, result) {
    if (err) { return onErr(err); }
    
    console.log('Enter Match Data:');
    
    console.log('  Home Team Name:' + result.homeTeam);
    console.log('  Home Team Username:' + result.homeUsername);
      matchData.home.team = result.homeTeam;
      matchData.home.username = result.homeUsername
    
    console.log('  Away Team Name: ' + result.awayTeam);
    console.log('  Away Team Username: ' + result.awayUsername);
      matchData.away.team = result.awayTeam;
      matchData.away.username = result.awayUsername;

    console.log('  Stream URL: ' + result.stream);
      matchData.stream.url = result.stream;

    console.log(matchData);
  
  });

  function onErr(err) {
    console.log(err);
    return 1;
  }


