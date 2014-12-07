var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    Show = require('../models/Show'),
    Episode = require('../models/Episode'),
    tvDB = require("thetvdb-api"),
    pretty = require('prettysize'),
    _ = require('underscore'),
    key = "ACC8F24E58B1230C";

module.exports = function (app) {
    app.get('/', function(req, res){
        Show.find().exec(function(err, shows) {
            res.render('index', {
                shows: shows
            });
        });
    });

    app.get('/addExistingShows', function(req, res){
        var walk    = require('walk');
        var files   = [];
        var brokenFiles = [];

        // Walker options
        var walker  = walk.walk('/data', { followLinks: false });

        walker.on('file', function(root, stat, next) {
            // Add this file to the list of files
            if (stat.size != 0) {
                files.push({
                    path: root + '/' + stat.name,
                    showName: root.split('/').pop(),
                    fileName: stat.name,
                    size: pretty(stat.size)
                });
            } else {
                brokenFiles.push({
                    path: root + '/' + stat.name,
                    showName: root.split('/').pop(),
                    fileName: stat.name,
                    size: pretty(stat.size)
                });
            }
            next();
        });

        walker.on('end', function() {
            if (files.length == 0) res.send({brokenFiles: brokenFiles});
            else res.send({files: files});
        });
    });

    app.get('/show/:seriesId', function(req, res){
        Show.find({seriesId: req.params.seriesId}).exec(function(err, show) {
            Episode.find({seriesId: req.params.seriesId}).exec(function(err, episodes) {
                res.send(episodes);
                // res.render('show', {
                //     show: show,
                //     episodes: episodes
                // });
            });
        });
    });

    app.get('/addShow', function(req, res){
        res.render('addShow');
    });

    app.get('/addShow/:seriesId', function(req, res) {
        tvDB(key).getSeriesAllById(req.params.seriesId, function(err, data){
            var show = data.Data.Series;
            var episode = data.Data.Episode;

            Show.update({
                seriesId: show.id
            }, {
                $set: {
                    seriesId: show.id,
                    language: show.Language,
                    overview: (_.isEmpty(show.Overview)) ? '' : show.Overview,
                    title: show.SeriesName,
                    imdbId: (_.isEmpty(show.IMDB_ID)) ? '' : show.IMDB_ID,
                    bannerImg: show.banner,
                    posterImg: show.poster,
                    network: show.Network,
                    status: show.Status,
                    airDayOfWeek: (_.isEmpty(show.Airs_DayOfWeek)) ? '' : show.Airs_DayOfWeek,
                    airTime: (_.isEmpty(show.Airs_Time)) ? '' : show.Airs_Time
                }
            }, {
                upsert: true
            }, function(error) {
                if (error) {
                    res.status(500).json({
                        error: error // status 500
                    });
                } else {
                    for (i = 0; i < Object.keys(episode).length; i++) {
                        Episode.update({
                            episodeId: episode[i].id
                        }, {
                            $set: {
                                episodeId: episode[i].id,
                                seriesId: episode[i].seriesid,
                                language: episode[i].Language,
                                overview: (_.isEmpty(episode[i].Overview)) ? '' : episode[i].Overview,
                                title: episode[i].EpisodeName,
                                imdbId: (_.isEmpty(episode[i].IMDB_ID)) ? '' : episode[i].IMDB_ID,
                                episodeNumber: episode[i].EpisodeNumber,
                                seasonNumber: episode[i].SeasonNumber,
                                seasonId: episode[i].seasonid
                            }
                        }, {
                            upsert: true
                        }, function(error) {
                            if (error) {
                                res.status(500).json({
                                    error: error // status 500
                                });
                            }
                        });
                    }
                    console.log('Episodes: ' + Object.keys(episode).length);
                    console.log('Episodes Gone Through: ' + i);
                    res.redirect(302, '/');
                }
            });
        });
    });

    app.get('/t/:seriesId', function(req, res){
        tvDB(key).getSeriesAllById(req.params.seriesId, function(err, data){
            res.send(data.Data);
        });
    });

    app.get('/showBanner/:seriesId', function(req, res){
        Show.find({seriesId: req.params.seriesId}, function(err, data){
            var banner = (data[0].bannerImg.split("/"));
            var bannerFileName = banner[1];
            res.sendFile(path.join(__dirname, '../_cache/images', bannerFileName));
        })
    });

    app.get('/api/tvDB/:showName', function(req, res){
        var download = function(url, dest, cb) {
            var file = fs.createWriteStream(dest);
            var request = http.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close(cb);  // close() is async, call cb after close completes.
                });
            }).on('error', function(err) { // Handle errors
                fs.unlink(dest); // Delete the file async. (But we don't check the result)
                if (cb) cb(err.message);
            });
        };

        tvDB(key).getSeries(req.params.showName, function(err, data) {
            if (!err){
                if (data.Data == 0) {
                    console.log('No results found.');
                    res.json({error: 'No results found.'});
                } else {
                    if (data.Data.Series[0]) {
                        for (i = 0; i < Object.keys(data.Data.Series).length; i++) {
                            if (data.Data.Series[i].banner) {
                                var banner = (data.Data.Series[i].banner.split("/"));
                                var bannerFileName = banner[1];
                                var bannerURL = 'http://thetvdb.com/banners/' + data.Data.Series[i].banner;
                                var bannerPath = path.resolve(__dirname + '/../_cache/images/' + bannerFileName);
                                if (fs.existsSync(bannerPath)) {
                                    console.log('File exists.');
                                } else {
                                    download(bannerURL, bannerPath, function(){
                                        console.log('Done!');
                                    });
                                }
                            } else {
                                console.log('No banner found.');
                            }
                        }
                    } else {
                        if (data.Data.Series.banner) {
                            var banner = (data.Data.Series.banner.split("/"));
                            var bannerFileName = banner[1];
                            var bannerURL = 'http://thetvdb.com/banners/' + data.Data.Series.banner;
                            var bannerPath = path.resolve(__dirname + '/../_cache/images/' + bannerFileName);
                            if (fs.existsSync(bannerPath)) {
                                console.log('File exists.');
                            } else {
                                download(bannerURL, bannerPath, function(){
                                    console.log('Done!');
                                });
                            }
                        } else {
                            console.log('No banner found.');
                        }
                    }
                    res.send(data);
                }
            } else {
                console.log('Bitch didn\'t give us any data. :sadface:');
                res.send('Bitch didn\'t give us any data. :sadface:');
            }
        });
    });
};
