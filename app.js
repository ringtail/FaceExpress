
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  ,webrtc = require('webrtc.io');
  var querystring = require('querystring');

var app = express();
 
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});
app.locals({
  title: 'My App',
  phone: '1-250-858-9990',
  email: 'me@myapp.com',
  friendlist:""
});
app.configure('development', function(){
  app.use(express.errorHandler());
});
app.use(app.router);//保留
routes(app);



var server = http.createServer(app);

webRTC = webrtc.listen(server);


webRTC.rtc.on('connect', function(rtc) {
  //Client connected
});

webRTC.rtc.on('send answer', function(rtc) {
  //answer sent
});

webRTC.rtc.on('disconnect', function(rtc) {
  //Client disconnect 
});

webRTC.rtc.on('chat_msg', function(data, socket) {
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId !== socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_chat_msg",
          "data": {
            "messages": data.messages,
            "username": data.username
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
      }
    }
  }
});



server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});





