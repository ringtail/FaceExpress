$('document').ready(function(){

	// console.log($('#iframe_box',window.parent.document));
	window.location.href="javascript:console.log(window.location.href);";

	var videos = [];
	var room = null;
	var username = null;
	var bg_urls =["images/bg0.jpg","images/bg1.jpg","images/bg2.jpg","images/bg3.jpg","images/bg4.jpg"];

	var websocketChat= {

	  	send: function(message) {
	    	
	    	webrtc._socket.send(message);
		
		},
	  	
	  	recv: function(message) {
	    	
	    	return message;
		
		},
	 
	 	event: 'receive_chat_msg'
	
	};

	var dataChannelChat = {
	  	
	  	send: function(message) {

	    	for(var connection in webrtc.dataChannels) {

	      		var channel = webrtc.dataChannels[connection];
	     	       
	     	       channel.send(message);
		}
	},
	  	recv: function(channel, message) {

	    		return JSON.parse(message).data;
	
	},

	  	event: 'data stream data'
	
	};
	/*this part we deal with the scroller 
	  and we prevent the defautl scrolling
	  and did the nano scroller
	*/

	if(webrtc.checkAPI){
		/*
			checkAPI has not been done
			we should tell why user can't 
			use it !
		*/

		webrtc.createStream({
		      "video": true,
		      "audio": true
		}, function(stream) {
			document.getElementById('local').src = URL.createObjectURL(stream);
		})
	}else{
		/*
			this part we need to do a lot of things
			to tell the user why they can not use
			this awsome app!
		*/
		alert("no sorry");
		return ;
	}


	


	room = window.location.hash.slice(1);
	// console.log('welcome to room '+room);
	webrtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	// initChat();

	webrtc.on('add remote stream', function(stream, socketId) {
		console.log('a remote stream is coming!');

		videos.push({"id":socketId,"src":stream});
		// console.log(videos);
		//undo
		rebuild_videos();

	});

	 webrtc.on('disconnect stream', function(data) {
    		console.log("remove "+data);
    		delete_stream(data);
    		rebuild_videos();
  	});

	function initChat(){
		var chat;
		/*
			this part we need to fix it 
			the dataChannel don't support it;
			i am so confused 
			maybe i need to learn straight into the content
			..........

		*/
		if(!webrtc.checkServer){
			
			console.log('initializing data channel chat');
   			
   			chat = dataChannelChat;
		}else {
   		
   			console.log('initializing websocket chat');
    			
    			chat = websocketChat;
 	 	
 	 	}

 	 	$('#input_area').keydown(function(event){

 	 		var key = event.keyCode||event.which;
 	 		// console.log(key);
 	 		if($('#input_area').val().length===0){
 	 		}else{
 	 		if(key == 13){
 	 			 chat.send(JSON.stringify({
				        "eventName": "chat_msg",
				        "data": {
				   	  "username":username,
				          "messages": $('#input_area').val(),
				          "room": room,
				        }
				      }));

 	 			// console.log($('#input_area').val());
	 	 		update_chat_area("Ringtail",$('#input_area').val());
	 	 		$('#input_area').val("")
	 	 		
 	 		}
 	 	}
 	 	});

 	 	$('.reply').click(function(){
			if($('#input_area').val().length===0){

			}else{


			chat.send(JSON.stringify({
					        "eventName": "chat_msg",
					        "data": {
					   	  "username":username,
					          "messages": $('#input_area').val(),
					          "room": room,
					        }
					      }));

	 	 			// console.log($('#input_area').val());
		 	 		update_chat_area("Ringtail",$('#input_area').val());
		 	 		$('#input_area').val("");

		 	}
		});


		webrtc.on(chat.event, function() {

		    
		    var data = chat.recv.apply(this, arguments);
		    
		   
		    // addToChat(data.messages, data.color.toString(16));
		    update_remote_chat_information(data.messages,data.username);
		  });
	}	 	

	function locate_stream(stream){
		$('#main-video').attr('src',URL.createObjectURL(stream));
	}
	function delete_stream(data){
		for(var i = 0 ;i<videos.length;i++){

			if(videos[i].id==data){
			
				videos.splice(i,1);

				$('.display_blocks').eq(i).attr("checked","checked");
				
			}
		}
		rebuild_videos();
		
	}

	function pause_stream(index){


		// console.log(index);
		var remote_videos = document.getElementsByClassName('remote-video');

		remote_videos[index].pause();
		remote_videos[index].volume=0;
		
		$('.display_blocks').eq(index).attr("checked",true);

				
		// rebuild_videos();

	}

	function resume_stream(index){
		var remote_videos = document.getElementsByClassName('remote-video');

		remote_videos[index].play();
		remote_videos[index].volume=1;

		$('.display_blocks').eq(index).attr("checked",false);

	}
	function rebuild_videos(){
		
		for(var i=0;i<6;i++){
			$('.remote-video').eq(i).attr('src',"");
			$('.display_blocks').eq(i).attr('checked',true);	
		}
		
		for(var i=0;i<videos.length;i++){

			$('.remote-video').eq(i).attr("src",URL.createObjectURL(videos[i].src));
			$('.display_blocks').eq(i).attr('checked',false);

		}
	}

	function update_chat_area(name,text){
		var text_node='<div class="text-node">\
					<span class="username">'+name+' :</span>\
					<blockquote class="text-content grey_type">'+text+'</blockquote>\
				</div>';
		
		$(text_node).appendTo('#text-box');
		$('.nano').nanoScroller();
		$(".nano").nanoScroller({ scroll: 'bottom' });
	}

	function update_remote_chat_information(messages,username){
		var text_node='<div class="text-node">\
					<span class="username remote-username">'+username+' :</span>\
					<blockquote class="text-content green_type">'+messages+'</blockquote>\
				</div>';
		
		$(text_node).appendTo('#text-box');
		$('.nano').nanoScroller();
		$(".nano").nanoScroller({ scroll: 'bottom' });
		
	}
	/* some listeners !*/






	$('#settings_icon').click(function(){
		
		if(!!$('#settings').hasClass('inactive')){
			$('#settings').removeClass('inactive').addClass('active');
			$('#settings').animate({
				left:"0px"
			},600)
			 
		}else{
			$('#settings').removeClass('active').addClass('inactive');
			$('#settings').animate({
				left:"-400px"
			},600)
		}
	});



	$('.display_blocks').click(function(){


		var index = $('.display_blocks').index(this);
		var remote_videos = document.getElementsByClassName('remote-video');
		if((!!!$('.display_blocks').eq(index).attr('checked'))&&index<5&&index<remote_videos.length){
			console.log("pause");
			 pause_stream(index);

		}else if(!!$('.display_blocks').eq(index).attr('checked')&&index<remote_videos.length){
			console.log('resume');
			resume_stream(index);
		}else{

		}
			
			// if(!!$('.remote-video').eq(index).attr('src')){

			// 	var remote_videos = document.getElementsByClassName('remote-video');
			// 	remote_videos[index].play();
			// 	remote_videos[index].volume = 1;

			// }else{

			// }

		

	})

	$('.range').change(function(){
		var index = $('.range').index(this);
		var main_video = document.getElementById('main-video');
		var remote_videos  = document.getElementsByClassName('remote-video');
		var volume = $(this).val(); 
		if(index===0){
			
			
			main_video.volume = parseFloat(volume)/100;
		
		}else{

			main_video.volume = parseFloat(volume)/100;
			for(var i = 0 ;i<remote_videos.length;i++){
				
				remote_videos[i].volume=parseFloat(volume)/100;
			}
		}
	});

	$('.background-selected').click(function(){

		$('.selected').removeClass('selected');
		var index = $('.background-selected').index(this);
		$('.background-selected').eq(index).addClass('selected');

		$('body').css('background-image','url('+bg_urls[index]+')');
	})


	
	/*
		this part we need add a username to
		the data area so that we can 
		manage it in the text area;
	*/
	
	/* end of listeners*/

	initChat();
});