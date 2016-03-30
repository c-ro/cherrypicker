"use stict";

function markers() {
	// define the object that will be exported as the markers module
	var markers = {};
	
	// define some useful functions for the module
	markers.hr = function(){
		var hr = "\n_____\n\n";
		return hr;
	};

	markers.br = function(){
		return "\n\n";
	};
	
	markers.makeLink = function(string, url){
		var link = "[" + string + "](" + url + ")";
		return link;
	};
	
	markers.bold = function(string){
		var boldString = "**" +  string + "**";
		return boldString;
	};
	
	markers.makeList = function(array, type = "ul"){
		var list = '';
		if(type === "ol"){
			array.forEach(function(element, index, array){
				list = list + '\n' + (index + 1) + '. ' + element;
			});
		} else {
			list = "* " + array.join('\n* ');
		}
		
		return list;
	};
	
	markers.section = function(content){
		return this.br() + content + this.hr();
	};

	// return the markers object you can use those functions elsewhere
	return markers;
}

var mrk = markers();
///// module defined and instantiated, have fun!


///  testing a cherrypicker-specific template helpers:
function makeHeader(){
    var string = "home" + " vs. " + "away";
    return mrk.bold(string);
}

function makeScore(){
 return mrk.hr() + mrk.bold("CURRENT SCORE: ") + "3" + " - " + "1" + mrk.br() + "Last Updated: " + "55:55:55";
}

/// markers
console.log(mrk.section(makeHeader()));
console.log(mrk.bold("Homecity BeisbolCats"));
console.log(mrk.makeLink("Stream", "http://www.stream.com"));
console.log(mrk.hr());
console.log(mrk.makeList(["one", "two", "three"], "ol"));
console.log(mrk.br());
console.log(mrk.makeList(["one", "two", "three"]));

// cherrypicker
console.log(makeHeader());
console.log(makeScore());
