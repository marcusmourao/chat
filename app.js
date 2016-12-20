/**
 * Created by marcus on 18/12/16.
 */
var count = 0;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var username = [];
var sockets = [];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


app.post('/login', function(req, res){
    username.push(req.body.username);
    res.redirect("/chat");
});

app.get('/chat', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html');
});

app.get('/private', function (req, res) {

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.sockets.on('connection', function(socket){
    var user = username[count];
    var id = count;
    sockets.push(socket.id); // guarda o id do soket
    count++;                 //atualiza o número de usuário conectados

    io.emit('conect', username, user);    //envia a lista de usuário onlines para o cliente

    socket.on('disconnect', function(){
        io.emit('leave chat', user + " saiu da conversa");
        count --;
        username.splice(id,1);
        io.emit("update", username);

    });

    socket.on('chat message', function(msg){
        io.emit('chat message', msg, user);
    });

    socket.on('private', function (msg,to) {
        var position = username.indexOf(to);
        console.log(username);
        console.log(position);
        console.log(sockets);
        console.log(sockets[position]);
        socket.broadcast.to(sockets[position]).emit('private message', msg, user);
    });

});
