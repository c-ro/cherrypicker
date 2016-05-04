// match.whateverFunction
// match.data.value.anotherValue

var match = function(){

	var match = {};
	    
	    match.data = {};
    	
	    	data.home = {
		        team: "",
		        username: "",
		        score: 0
		    };
		    data.away = {
		        team: "",
		        username: "",
		        score: 0
		    };

		    data.time = "";
		    data.stream = "";
		    data.sub = "";
	        data.xsub = "";
	   	 	data.updates = ["0' - Get hyped."];
	   	 	// script logs the id of the last tweet so it can check for missed updates after a disconnect
		    data.lastTweet = "";
		    // thread data returned from Reddit.
		    data.thread = {};

		var data = match.data;

	    match.input = function(input){
	    	data.home.team = input.homeTeam;
	    	data.home.username =  input.homeUsername.toLowerCase();
	    	data.away.team =  input.awayTeam;
	    	data.away.username =  input.awayUsername.toLowerCase();
	    	data.stream = input.stream;
	    	data.sub = input.targetSub.toLowerCase();
            data.xsub = input.xSub ? input.xSub.toLowerCase() : null;
	    	// console.log(colors.cyan("Match Thread starting with this data: \n"), data);
	    };

	    match.deleteUpdate = function(index, callback){
	    	var removed = data.updates.splice(index -1, 1);
	    	callback(removed);
	    };

	    match.createUpdate = function(){
			console.log("edit");
	    };

	    match.editUpdate = function(){
	    	console.log("edit");
	    };

	    match.update = function(string, index){
	    	string = string.replace(/\n/g, ' ');

			if(index){
				data.updates.splice(index, 0, string);	
			} else {			
		    	data.updates.push(string);	
			}
			reddit.edit();
	    };

	    match.isUpdate = function(string) {
	    	// TODO: make these cases more clear, store in array?
			if (string.match(/(\d{1,2}[’'+:])/) || string.match(/^(FT)/) || string.match(/FULL*.TIME/) || string.match(/(XI)/)) {
				return true;
			} else {
				return false;
			}
		};

		match.missedUpdates = function(statuses){
			var newUpdates = [];

			for(var i = 0; i < statuses.length; i++){
				if(statuses[i].id > match.lastTweet && match.isUpdate(statuses[i].text)){
					newUpdates.push(statuses[i].text);
				}
			}
			
			return newUpdates;
		}; 

	return match;

}();