function markers() {
	var markdown = {};
	
	horizontalRule = function(){
		var hr = "\n_____\n\n";
		return hr;
	};
	
	makeLink = function(string, url){
		var link = "[" + string + "](" + url + ")";
		return link;
	};
	
	makeBold = function(string){
		var boldString = "**" +  string + "**";
		return boldString;
	};
	
	makeList = function(array, type = "ul"){
		var list = '';
		if(type === "ol"){
			array.forEach(function(element, index, array){
				list = list + '\n' + (index + 1) + '. ' + element;
			});
		} else {
			list = "* " + array.join('\n* ');
		}
		
		return list
	}
	
	return {
		makeLink: makeLink,
		makeList: makeList,
		horizontalRule: horizontalRule,
		makeBold: makeBold
	};
}

var mrk = markers();

///// module defined and instantiated

for (var i = 0; i < 3; i++){
	console.log(mrk.makeBold("Homecity BeisbolCats"));
	console.log(mrk.makeLink("Stream", "http://www.stream.com"));
	console.log(mrk.horizontalRule());
	console.log(mrk.makeList(["one", "two", "three"], "ol"));
	console.log(mrk.makeList(["one", "two", "three"]));
}