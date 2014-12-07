var express = require('express'),
    jade = require("jade"),
    path = require("path"),
    mongoose = require('mongoose'),
    app = express();

mongoose.connect('mongodb://localhost:27017/ducking-octo-spice', function() {
    console.error('Connected to MongoDB.');
});
mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

app.set('views', path.resolve(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

require('./routes.js')(app);

app.listen(80);
