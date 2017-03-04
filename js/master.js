var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.send('<h1>Welcome Realtime Server</h1>');
});
var users = {}, //id 数组
usocket = {};
var man_1=false;
var man_2=false;
var onoff = {};
io.on('connection', function(socket) {
        console.log('a user connected.');
        socket.on('disconnect', function() {
            console.log('user disconnected.');
        });
        socket.on('login', function(obj){
        	if(usocket.hasOwnProperty(obj.username)){
        		users[obj.username] =obj.userid;
        	}
        	else{
        		users[obj.username] =obj.userid;
        		usocket[obj.username] = socket;
               
        	       for(var i in users){    
                        if(users[i] == obj.userid && i != obj.username){

                            if( onoff[obj.userid]===undefined ){     // 这两个人已经匹配成功了
                                usocket[i].emit('logins',{statu:1,plan:1});
                                usocket[obj.username].emit('logins',{statu:1,plan:2});
                                man_1 = i;
                                man_2 = obj.username;
                                onoff[obj.userid]= true;
                                console.log("tow man");
                            }
                            else{   // 当两个人匹配成功时第三个人拒绝他进来
                                  usocket[obj.username].emit('logins',{statu:0});
                                  break;
                            }
                        }
                    }
        	}
        	
		});
        
            socket.on("reSend",function(o){ //监听两个玩家的移动 x , y
                                
                                name = o.name;
                                if(name==man_1){
                                    usocket[man_2].emit('receive',o);
                                }
                                if(name==man_2){
                                    usocket[man_1].emit('receive',o);
                                }
                         })
            
})


http.listen(3000, function(){
	console.log('listening on *:3000');
});
