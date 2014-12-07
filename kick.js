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
    res.send('??');
});

var sort_by = function(field, reverse, primer){

   var key = primer ?
       function(x) {return primer(x[field])} :
       function(x) {return x[field]};

   reverse = [-1, 1][+!!reverse];

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     }
}

app.get('/:search', function(req, res){
    var Kickass = require('node-kickass-json');

    var k = new Kickass()
    .setQuery(req.params.search)   // Set search Query parameter
    .run(function(error, data) {
      /*
      this  {context} => Current Context is set to be `k`.
      error  {error} => An Error object representing the error encountered
      data    {array} => An array of Torrent.
      */
      if (error === null) {
        // No errors occured.
        console.log(data.length, "results");
        var returnData = data.sort(sort_by('votes', false, parseInt));
        var PutIO = require('put.io-v2');
        var api = new PutIO(___API___KEY___);

        api.files.list(0, function(data){
            for (var i in data.files){
                console.log(data.files[i].name);
            }
        });

        api.transfers.add(returnData[0].torrentLink);

        res.send(returnData[0]);
      } else {
        // An error occurred.
        console.log(error, "error");
      }
    })
});

app.listen(80);
