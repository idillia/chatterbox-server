var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('client'));
app.use(bodyParser.json());

var fs = require('fs');
var jsonMessages = {
  results: [
  ],
  lastId: 0
};

var storageFile = 'messages.json';
fs.readFile(storageFile, function(err, data) {
  if (err) {
    fs.writeFile(storageFile, JSON.stringify(jsonMessages));
  }
  else {
    jsonMessages = JSON.parse(data);
  }

});



app.get('/classes/messages', function (req, res) {
  res.json(jsonMessages);
});

app.post('/classes/messages', function (req, res) {
  var newMessage = req.body;

  newMessage.objectId = jsonMessages.lastId;
  jsonMessages.lastId++;
  jsonMessages.results.push(newMessage);
  fs.writeFile(storageFile, JSON.stringify(jsonMessages));
  res.end('');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});