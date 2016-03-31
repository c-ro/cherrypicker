// markers.js

function markers() {
	"use strict";
	// define the object that will be exported as the markers module
	var markers = {};
	
	// define some useful functions for the module
	markers.hr = function(){
		var hr = "\n\n*****\n\n";
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
	
	markers.list = function(array, listType){
		var type = listType || "ul";
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

module.exports = markers();

/// markers
// mrk.section(makeHeader());
// mrk.bold("Homecity BeisbolCats");
// mrk.makeLink("Stream", "http://www.stream.com");
// mrk.makeList(["one", "two", "three"], "ol");
// mrk.br();
// mrk.makeList(["one", "two", "three"]);