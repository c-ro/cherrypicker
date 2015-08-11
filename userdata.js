var prompt = require('prompt');

  prompt.start();

  prompt.get(['home','away', 'stream'], function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Home:' + result.home);
    console.log('  Away: ' + result.away);
    console.log('  Stream: ' + result.stream);
  });

  function onErr(err) {
    console.log(err);
    return 1;
  }