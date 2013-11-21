
/*
 * GET home page.
 */
module.exports = function(app){
	app.get('/', index);
	//app.get('/users', user.list);
	app.get('/home',function(req,res){
            console.log(app.locals.email+'\n');
            var https = require('https')
            ,querystring = require('querystring')
            , x = req.param('access_token')
            , uid = req.param('xn_sig_user');
            
            var post_data = querystring.stringify({
                                                  access_token:x,
                                                  v:'1.0',
                                                  format:'json',
                                                  method:'friends.getFriends',
                                                  page:'1',
                                                  count:'40' //获取好友数量
                                                  
                                                  });
            var options = {
            host: 'api.renren.com',
            port: 443,
            path: '/restserver.do',
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length' : post_data.length
            }
            };
            var friends="";
            var req = https.request(options,function(ress){
                                    ress.setEncoding('utf8');
                                    ress.on('data',function(chunk){
                                           
                                            
                                            //chunk = chunk.substring(1, chunk.length-2);
                                            //
                                            //friends.append(chunk);
                                             friends += chunk;
                                            
                                            //app.locals.friendlist = friends;
                                            
                                            //res.render('home',{"access_token":x,"uid":uid});
                                            })
                                            ress.on('end',function(){
                                            console.log(friends);
	                                            app.locals.friendlist = JSON.parse(friends);
                                            res.render('home',{"access_token":x,"uid":uid});
                                            })
                                            
                                    });
                              
            req.on('error', function(e) {
                   console.log('problem with request: ' + e.message);
                   });
            
            req.write(post_data+'\n');
            req.end();
	});
	app.get('/room',room);

}
index = function(req, res){

  res.render('index',{title:"RIngtail.IO"});

};

room = function(req,res){

	var querystring = require('querystring');

	var username = req.param('username');
	
	res.render('room',{title:"Ringtail.IO",username:username});
};

