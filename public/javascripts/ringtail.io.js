/*
	this a webrtc lib for beginner 
	you can use it in your project
	if you have any questions
	you can mail me 
	773913792@qq.com

	ringtail in buaa 
	
	2013/3/13
*/



(function() {


	/*some function is not right for now,but maybe for the furture */
	var getUserMedia = navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia
	,URL = window.URL||window.webkitURL||window.oURL||window.msURL||window.mozURL
	,PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection||window.msPeerConnection||window.mozPeerConnection;


	

	var webrtc ={};


	if ('undefined' === typeof module) {
    		webrtc = this.webrtc = {};
  	} else {
    		webrtc = module.exports = {};
  	}


	webrtc._socket=null;//websocket holder 

	webrtc._local=null;

	webrtc._events={};

	webrtc.on = function(eventName, callback) {
	   /*an event collections*/
	    webrtc._events[eventName] = webrtc._events[eventName] || [];
	    webrtc._events[eventName].push(callback);

	};

	webrtc.fire = function(eventName, _) {
	/* when the event fire */
	    var events = webrtc._events[eventName];
	    var args = Array.prototype.slice.call(arguments, 1);

	    if (!events) {
	      return;
	    }

	    for (var i = 0, len = events.length; i < len; i++) {
	      events[i].apply(null, args);
	    }
	};


	/*stream in the webrtc*/
	webrtc.streams = [];
	
	/* peers*/
	webrtc.peerConnections={};


	/* socketid */
	webrtc.connections=[];

	/* rooms */
	webrtc.rooms = [];

	webrtc.dataChannels = {};

	/*the core config*/
	webrtc.config={

		/*the ice server and the datachannel config*/

		server:{iceServers:[{url:"stun:stun.l.google.com:19302"}]},

		dataChannel:{optional: [ {RtpDataChannels: true} ] }

	};

	/* the test scripts*/
	webrtc.checkAPI=function(){
		/**/
		if(!!(getUserMedia&&PeerConnection)){

			return true;

		}else{

			return false;
		
		}
	}

	webrtc.checkServer =function(){
		try {
		     /*test if the server can be used*/
		      var pc = new PeerConnection(webrtc.config.server, webrtc.config.dataChannel);
		      var channel = pc.createDataChannel('supportCheck', {reliable: false});
		      channel.close();
		      return true;
		    } catch(e) {
		      return false;
   		 }

	}

	webrtc.connect = function(server,room){
		room = room ||"";

		webrtc._socket = new WebSocket(server);

		webrtc._socket.onopen = function(){
			/*send message to the server */
			webrtc._socket.send(JSON.stringify(
			{
				'eventName':'join_room',
				'data':{
					"room":room
				}
			}))
		}
		webrtc._socket.onclose = function(){

			webrtc.fire('disconnect stream', webrtc._socket.id);
        			 delete webrtc.peerConnections[webrtc._socket.id];
        			
		}

		webrtc._socket.onmessage = function(msg){
			var json = JSON.parse(msg.data);
			webrtc.fire(json.eventName, json.data);

		}
		webrtc._socket.onerror = function(error){

			console.log('error:'+error);

		}


		webrtc.on('get_peers', function(data) {
	        
	        webrtc.connections = data.connections;
	        webrtc._local = data.you;
	        // fire connections event and pass peers
	        webrtc.fire('connections', webrtc.connections);
	      	});

	      	webrtc.on('receive_ice_candidate', function(data) {
	        var candidate = new RTCIceCandidate(data);
	        webrtc.peerConnections[data.socketId].addIceCandidate(candidate);
	        webrtc.fire('receive ice candidate', candidate);
	      	});

	     	webrtc.on('new_peer_connected', function(data) {
	        webrtc.connections.push(data.socketId);

	        var pc = webrtc.createPeerConnection(data.socketId);
	        for (var i = 0; i < webrtc.streams.length; i++) {
	          var stream = webrtc.streams[i];
	          pc.addStream(stream);
	        }
	      	});

	      	webrtc.on('remove_peer_connected', function(data) {
	        webrtc.fire('disconnect stream', data.socketId);
	        delete webrtc.peerConnections[data.socketId];
	      	});

	      	webrtc.on('receive_offer', function(data) {
	       	 webrtc.receiveOffer(data.socketId, data.sdp);
	       	 webrtc.fire('receive offer', data);
	      });

	      webrtc.on('receive_answer', function(data) {
	        webrtc.receiveAnswer(data.socketId, data.sdp);
	        webrtc.fire('receive answer', data);
	      });

	      webrtc.fire('connect');
	    };




	webrtc.createStream = function(options,onSuccess,onError){

		var opts = null;

		onSuccess = onSuccess||function(){};
		onError = onError||function(){};

		opts={
			video:!!options.video,
			audio:!!options.audio
		}

		if(webrtc.checkAPI){
			getUserMedia.call(navigator,opts,function(stream){
				
				webrtc.streams.push(stream);
				
				onSuccess(stream);

				/*
					we have checked the apis;
				*/
				webrtc.fire('ready');

			},function(error){
				console.log('ringtail.io : getUserMedia error code  1')

				onError(error);
			})

		}else{
			alert('sorry,your browser do not support the webrtc');
		}

	};

	webrtc.on("ready",function(){
		webrtc.createPeerConnections();
		webrtc.addStreams();
		webrtc.sendOffers();
		webrtc.console("webrtc is online."," ","hope you can enjoy it!");
	});


	webrtc.console = function(){

		var log = "";
		for(var i = 0;i<arguments.length;i++){
			log+=arguments[i].toString();
		}
		console.log(log);

	}

	webrtc.addStreams = function(){

		for (var i = 0; i < webrtc.streams.length; i++) {
     			 var stream = webrtc.streams[i];
      		for (var connection in webrtc.peerConnections) {
        		webrtc.peerConnections[connection].addStream(stream);
      			}
    		}

	}

	webrtc.attachStream = function(stream, domId) {
	    document.getElementById(domId).src = URL.createObjectURL(stream);
	  };

	webrtc.createPeerConnections = function(){
		for(var i = 0 ;i < webrtc.connections.length;i++){
			webrtc.createPeerConnection(webrtc.connections[i]);
			
		}
	}


	webrtc.createPeerConnection = function(id){

		var conf;

		if(webrtc.checkServer){
			conf = webrtc.config.dataChannel;
		}

		var pc = webrtc.peerConnections[id] = new PeerConnection(webrtc.config.server, conf);

		    pc.onicecandidate = function(event) {
		      if (event.candidate) {
		         webrtc._socket.send(JSON.stringify({
		           "eventName": "send_ice_candidate",
		           "data": {
		              "label": event.candidate.label,
		              "candidate": event.candidate.candidate,
		              "socketId": id
		           }
		         }));
		       }

		       webrtc.fire('ice candidate', event.candidate);
		     };

		    pc.onopen = function() {

		    	
		    	
		    	webrtc.fire('peer connection opened');
		    	webrtc.console("peerconnection open");

		    };

		    pc.onaddstream = function(event) {

		    	webrtc.fire('add remote stream', event.stream, id);
		     	webrtc.console("peerconnection add stream");
		    
		    };

		    if (webrtc.checkServer) {
		      	pc.ondatachannel = function (evt) {
		        webrtc.console('data channel connecting ' + id);
		        webrtc.addDataChannel(id, evt.channel);
		      };
		    }

		    return pc;

	}

	webrtc.createDataChannel = function(pcOrId, label) {
	    if (!webrtc.checkServer) {
	      //TODO this should be an exception
	      alert('webRTC data channel is not yet supported in this browser,' +
	            ' or you must turn on experimental flags');
	      return;
	    }

	    var id, pc;
	    if (typeof(pcOrId) === 'string') {
	      id = pcOrId;
	      pc = webrtc.peerConnections[pcOrId];
	    } else {
	      pc = pcOrId;
	      id = undefined;
	      for (var key in webrtc.peerConnections) {
	        if (webrtc.peerConnections[key] === pc)
	          id = key;
	      }
	    }

	    if (!id)
	      throw new Error ('attempt to createDataChannel with unknown id');

	    if (!pc || !(pc instanceof PeerConnection))
	      throw new Error ('attempt to createDataChannel without peerConnection');

	    // need a label
	    label = label || 'fileTransfer' || String(id);

	    // chrome only supports reliable false atm.
	    var options = {reliable: false};

	    var channel;
	    try {
	      console.log('createDataChannel ' + id);
	      channel = pc.createDataChannel(label, options);
	    } catch (error) {
	      console.log('seems that DataChannel is NOT actually supported!');
	      throw error;
	    }

	    return webrtc.addDataChannel(id, channel);
	  };

	webrtc.addDataChannel = function(id, channel) {

	    channel.onopen = function() {
	      console.log('data stream open ' + id);
	      webrtc.fire('data stream open', channel);
	    };

	    channel.onclose = function(event) {
	      delete webrtc.dataChannels[id];
	      console.log('data stream close ' + id);
	      webrtc.fire('data stream close', channel);
	    };

	    channel.onmessage = function(message) {
	      console.log('data stream message ' + id);
	      console.log(message);
	      webrtc.fire('data stream data', channel, message.data);
	    };

	    channel.onerror = function(err) {
	      console.log('data stream error ' + id + ': ' + err);
	      webrtc.fire('data stream error', channel, err);
	    };

	    // track dataChannel
	    webrtc.dataChannels[id] = channel;
	    return channel;
	  };

	webrtc.addDataChannels = function() {
	    if (!webrtc.checkServer)
	      return;

	    for (var connection in webrtc.peerConnections)
	      webrtc.createDataChannel(connection);
	  };

	webrtc.sendOffers = function() {
	    for (var i = 0, len = webrtc.connections.length; i < len; i++) {
	      var socketId = webrtc.connections[i];
	      webrtc.sendOffer(socketId);
	    }
	  };
	  
	webrtc.sendOffer = function(socketId) {
	    var pc = webrtc.peerConnections[socketId];
	    pc.createOffer( function(session_description) {
	    pc.setLocalDescription(session_description);
	    webrtc._socket.send(JSON.stringify({
	        "eventName": "send_offer",
	        "data":{
	            "socketId": socketId,
	            "sdp": session_description
	            }
	        }));
	    });
	  };


	webrtc.receiveOffer = function(socketId, sdp) {  
	    var pc = webrtc.peerConnections[socketId];
	    pc.setRemoteDescription(new RTCSessionDescription(sdp));
	    webrtc.sendAnswer(socketId);
	  };


	webrtc.sendAnswer = function(socketId) {
	    var pc = webrtc.peerConnections[socketId];
	    pc.createAnswer( function(session_description) {
	    pc.setLocalDescription(session_description);
	    webrtc._socket.send(JSON.stringify({
	        "eventName": "send_answer",
	        "data":{
	            "socketId": socketId,
	            "sdp": session_description
	            }
	        }
	    ));
	    //TODO Unused variable!?
	    var offer = pc.remoteDescription;
	    });
	  };


	webrtc.receiveAnswer = function(socketId, sdp) {
	    var pc = webrtc.peerConnections[socketId];
	    pc.setRemoteDescription(new RTCSessionDescription(sdp));
	  };

}).call(this);



