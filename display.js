// display.js
var colors = require("colors/safe");

var display = function(){
    "use strict";
    var handler = {};

    handler.print = function(array){
        for(var i = 0; i < array.length; i++){
            console.log((i + 1) + ": " + array[i]);
        }
    };

    handler.matches = function(array){
        for(var i = 0; i < array.length; i++){
            console.log((i + 1) + ": " + array[i].match.name);
        }
    };

    handler.edits = function(array, highlightIndex){
        for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.green((i + 1) + ": " + array[i]) + " " + "EDITED".inverse);
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }};

    handler.new = function(array, highlightIndex){
        for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.green((i + 1) + ": " + array[i]) + " " + "NEW".inverse);
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }};

    handler.deleted = function(array, removedUpdate, highlightIndex){
        for(var i = 0; i < array.length; i++){
        
        if(i === highlightIndex - 1){
            console.log(colors.red((i + 1) + ": " + removedUpdate) + " " + "DELETED".inverse);
            console.log((i + 1) + ": " + array[i]);
        } else {
            console.log((i + 1) + ": " + array[i]);
        }
    }};


    return handler;
};

module.exports = display();
