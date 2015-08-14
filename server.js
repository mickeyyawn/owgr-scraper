var express = require('express');
var async = require('async');
var fs = require('fs');
var bodyParser = require('body-parser');
var jsdom = require('jsdom');
var fs = require('fs');

var app = express();
var port;
var host;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
global.rootDir = __dirname;
process.env.NODE_ENV = (process.env.NODE_ENV || 'development');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// will this fix double slashes ???
app.use(function (req,res,next) {
  req.url = req.url.replace(/[/]+/g, '/');
  next();
});


process.on('uncaughtException', function(err){
  console.log(err);
});


port = 3000;

app.set('port', port);
host = '0.0.0.0';

console.log("running in production");

app.listen(port, host);

app.get('/', function(req, res) {

  buildOWGRData(function(data){

    res.json(data);

  });

});


var buildOWGRData = function (callback) {

  var data = {};
  data.worldRankings = [];

  jsdom.env({
    url: "http://www.pgatour.com/stats/stat.186.html",
    done: function(errs, window) {
      global.window = window;
      global.$ = require('./jquery-2.1.4.min.js');

      $("tr[id*='playerStatsRow']").each(function(){

        var playerRanking = {};
        var id = $(this).attr('id');

        id = id.replace('playerStatsRow', '');

        playerRanking.id = id;

        var i = 0;

        $(this).children().each(function () {

           var s = $(this).text();
           s = s.trim();
           s = s.replace(/[^a-zA-Z0-9]/g,' ');

           if (i==0) {

             playerRanking.rank = s;

           }
           else if (i==2) {

             playerRanking.name = s;

           }
           i++;
        });

        data.worldRankings.push(playerRanking);

        i = 0;

      });

      callback(data);
    }
  });
}
