/**
 * Created by marcus on 18/12/16.
 */
var count = 0;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var username = [];

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


http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
    var user = username[count];
    var id = count;
    count++;
    io.emit('conect', username);    //envia a lista de usuário onlines para o cliente
    io.emit('chat message', "usuário " + user + " entrou na conversa");


    socket.on('disconnect', function(){
        io.emit('chat message', "Usuário " + user + " saiu da conversa");
        count --;
        username.splice(id,1);
        io.emit("update", username);

    });
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});
