var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.send('<h1>Welcome Realtime Server</h1>');
});
http.listen(3000, function(){
	console.log('listening on *:3000');
});
function masters(){
	var _this = this;
	_this.gameDoing = {}, //已经正在游戏的用户 存放唯一 id : true/false
	_this.gameDoing_2 = {}, //已经正在游戏的用户 存放唯一 id : 匹配码
	_this.waitNow = {} //正在等待队友的用户 存放唯一 id : 匹配码
	var usocket = {}//socket 对象储存
	_this.connectAll = function(){  //初始化连接
		io.on("connection",function(socket){
			console.log("one user connect");
			_this.loginIt(socket);
			//_this.socketSend(socket);
		})
	},
	_this.loginIt = function(socket){ //匹配
		socket.on("login",function(o){
			console.log(o);
			var code_1 = _this.hasFindFriend(o.username,_this.waitNow); //匹配到的玩家的id
			if(code_1){ //如果有相同匹配码 
				_this.gameDoing[o.id] = true;
				_this.gameDoing_2[o.id] = code_1;
				_this.gameDoing[code_1] = true;
				_this.gameDoing_2[code_1] = o.id;
				delete _this.waitNow[code_1];
				usocket[o.id] = socket; //储存进 socket
				usocket[code_1].emit('logins',{statu:1,plan:1});
                usocket[o.id].emit('logins',{statu:1,plan:2});
			}
			else{
				_this.waitNow[o.id] = o.username; 
				usocket[o.id] = socket; //储存进 socket
			}
		})
	},
	
	_this.socketSend = function(socket){ // 玩家一 id 玩家二 id

		socket.on("reSend",function(o){
			usocket[gameDoing_2[o.id]].emit("move_xy",o);
		})
	},
	_this.hasFindFriend = function(name,obj){ //是否匹配到了,obj里面有相同匹配码则返回真
		for(var i in obj){
			if(obj[i] == name)
				return i;
		}
	},
	_this.checkHeart = function(socket){  //心脏监测
		socket.on("heartOnoff",function(o){
				_this.gameDoing[o.id] = true;
		})
		setInterval(function(){ //每隔五秒确认连接
			for(var i in _this.gameDoing){ //遍历它
				if(_this.gameDoing[i]){ //如果标志位为真,则重置标志位
					_this.gameDoing[i] = !_this.gameDoing[i];
				}
				else{
					_this.socketDisConnect(i);
				}
			}
		},5000);
	},
	_this.socketDisConnect = function(obj){ //断开连接了
			var id_2 = _this.gameDoing_2[obj]; //队友id
			delete _this.gameDoing[id_2]; //删除掉队友id
			delete _this.gameDoing[obj];
			delete _this.gameDoing_2[obj];
			delete _this.gameDoing_2[id_2];
	}

}
var masters1 = new masters();
masters1.connectAll();
