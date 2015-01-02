var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MetaInspector = require('node-metainspector');
var request = require('request');
var cheerio = require('cheerio');

app.get('/', function(req, res){
  res.sendfile('index.html');
});
/*
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
*/

function handlerMessage(msg, io) {
  if (msg.indexOf('facebook.com') != -1) {
    var options = {
      url: msg,
      headers: {
          'User-Agent': 'request'
      }
    };
    request(options, function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);
        var src = $('#fbPhotoImage').attr('src');
        io.emit('chat message', src);
      }
    })
  }
  else if (msg.indexOf('.com')!= -1 || msg.indexOf('buzzfeed.com') != -1) {
    var client = new MetaInspector(msg, {});

    client.on("fetch", function(){
      console.log(client.images);
      console.log("Description: " + client.image);
      io.emit('chat message', client.image);
    });

    client.on("error", function(err){
      console.log(error);
    });

    client.fetch();
  } else {
    io.emit('chat message', msg);
  }
}

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    //socket.broadcast.emit
    handlerMessage(msg, io);
    //io.emit('chat message', msg);
  });
  socket.on('writing', function() {
    socket.broadcast.emit('msg_state', 'Escribiendo ...');
  })
  socket.on('no_writing', function() {
    socket.broadcast.emit('msg_state', '');
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});