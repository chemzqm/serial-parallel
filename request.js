var Serial = require('node-serial');
var Parallel = require('node-parallel');
var request = require('superagent');
var host = 'http://localhost:3000';

/**
 * flatten a two dimension array
 * @param {Array} arr
 * @api public
 */
function flatten (arr) {
  var res = [];
  arr.forEach(function(a) {
    res = res.concat(a);
  })
  return res;
}

function getSchools(done) {
  request
    .get(host + '/schools')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err) return done(err);
      if (res.error) return done(res.error);
      done(null, res.body);
    });
}

/**
 * get rooms by schools array
 */
function getRooms(schools, done) {
  var parallel = new Parallel();
  schools.forEach(function(school) {
    parallel.add(function(cb) {
      var sid = school.id;
      request
        .get(host + '/school/' + sid + '/rooms')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return cb(err);
          if (res.error) return cb(res.error);
          var result = res.body.map(function(o) {
            return {
              id: o.id,
              sid: sid,
              name: o.name,
              school: school.name
            }
          })
          cb(null, result);
        });
    })
  })
  parallel.done(function(err, results) {
    if (err) return done(err);
    return done(null, flatten(results));
  })
}

function getStudents (rooms, done) {
  var parallel = new Parallel();
  rooms.forEach(function(room) {
    parallel.add(function(cb) {
      var sid = room.sid;
      var rid = room.id;
      request
        .get(host + '/school/' + sid + '/room/' + rid + '/students')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) return cb(err);
          if (res.error) return cb(res.error);
          var result = res.body.map(function(o) {
            return {
              name: o.name,
              sname: room.school,
              rname: room.name
            }
          })
          cb(null, result);
        });
    })
  })
  parallel.done(function(err, results) {
    if (err) return done(err);
    return done(null, flatten(results));
  })
}

function findStudent (name) {
  var serial = new Serial();
  serial.add(function(done) {
    getSchools(done);
  })
  serial.add(function(done, ctx) {
    var schools = ctx.res;
    getRooms(schools, done);
  })
  serial.add(function(done, ctx) {
    var rooms = ctx.res;
    getStudents(rooms, done);
  })
  serial.done(function(err, ctx) {
    if (err) throw err;
    var students = ctx.res;
    var result = students.filter(function(s) {
      return s['name'] == name;
    })
    console.log(result);
  })
}

findStudent('jack');
//findStudent('lily');
