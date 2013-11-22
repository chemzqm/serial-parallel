var express = require('express');
var http = require('http');
var app = express();

app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.static(__dirname));
});

var server = http.createServer(app).listen(3000, function(){
  console.log('server listening at 3000');
})

app.get('/schools', function(req, res, next) {
  res.json([
    { id: 1, name: 'school a'},
    { id: 2, name: 'school b'},
    { id: 3, name: 'school c'}
  ])
})

app.get('/school/:sid/rooms', function(req, res, next) {
  var sid = req.params['sid'];
  res.json([
    { id: 1, name: 'school:' + sid + ' room:1'},
    { id: 2, name: 'school:' + sid + ' room:2'},
    { id: 3, name: 'school:' + sid + ' room:3'}
  ])
})

app.get('/school/:sid/room/:rid/students', function(req, res, next) {
  var sid = req.params['sid'];
  var rid = req.params['rid'];
  if ((sid == 1 && rid == 1) ||
      (sid == 2 && rid == 2) ||
      (sid == 3 && rid == 3))
      return res.json([
        { id: 1, name: 'jack' }
      ]);
  if (sid == 2 && rid ==3) {
    return res.json([
      { id: 1, name: 'lily' }
    ]);
  }
  return res.json([]);
})
