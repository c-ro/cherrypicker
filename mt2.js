var data = {};

reddit('/api/submit').post({
  api_type: "json",
  kind: "self",
  text: "TEXT GOES HERE", 
  title: "TITLE GOES HERE",
  sr: "ncisfanclub"
}).then(function(response){
	
	if(response.errors){
		console.log("ERROR: " + response.errors);
	}

	data = response.json.data;
	console.log(data);
});

	console.log(data);
