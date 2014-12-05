var express = require('express');
var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");
var jade = require("jade");

var app = express();

app.set('views', path.resolve(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    var Kickass = require('node-kickass-json');

    var k = new Kickass()
    .setQuery('Almost Human')   // Set search Query parameter
    .run(function(error, data) {
      /*
      this  {context} => Current Context is set to be `k`.
      error  {error} => An Error object representing the error encountered
      data    {array} => An array of Torrent.
      */
      if (error === null) {
        // No errors occured.
        console.log(data.length, "results");
        res.send(data);
      } else {
        // An error occurred.
        console.log(error, "error");
      }
    })
});

app.listen(80);
