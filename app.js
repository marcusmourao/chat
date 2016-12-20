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
    var user = username[count]; // guarda o username do usuario
    var id = count;             // guarda o id do usuário
    sockets.push(socket.id);    // guarda o id do soket
    count++;                    // atualiza o número de usuário conectados

    io.emit('conect', username, user);    //envia a lista de usuário onlines para o cliente

    socket.on('disconnect', function(){
        io.emit('leave chat', user + " saiu da conversa"); // emite uma mensagem para os demais clientes avisando a saida do chat
        count --;                                          // atualiza o número de usuário conectados
        username.splice(id,1);                             // remove o username da lista de usuários conectados
        sockets.splice(id, 1);                             // remove o socket da lista de sockets conectados
        io.emit("update", username);                       // atualiza os clientes

    });

    socket.on('chat message', function(msg){    // emite uma mensagem para todos os clientes conectados
        io.emit('chat message', msg, user);     // informando a mensagem e o usuário que a enviou
    });

    socket.on('private', function (msg,to){
        var position = username.indexOf(to);
        /*
        *** Evento de mensagem privada ***
        * Recebemos como parâmetro a mensagem e o username do usuário de destino
        * buscamos o username no vetor de usernames e pegamos a posição em que ele se encontra
        * pegamos o id do socket que aquele usuário está conectado
        * enviamos uma mensagem apenas para o usuário destino
        * enviamos uma mensagem para o próprio emissor também
        */
        console.log(username);
        console.log(position);
        console.log(sockets);
        console.log(sockets[position]);
        socket.broadcast.to(sockets[position]).emit('private message', msg, user);
        socket.emit('personal', msg, user, to);
    });

});
