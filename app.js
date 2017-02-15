/**
 * Created by marcus on 18/12/16.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


app.post('/login', function(req, res){
    username.push(req.body.username);
    var chatName = req.body.chatName;
    createSocket(chatName);
    res.redirect("/chat/" + chatName);
});

app.get('/chat/:chatName', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html');
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});


function createSocket(name) {
    var count = 0;
    var username = [];
    var sockets = [];
    var io2 =io.of('/' + name);
    io2.on('connection', function(socket){
        var user = username[count]; // guarda o username do usuario
        var id = count;             // guarda o id do usuário
        sockets.push(socket.id);    // guarda o id do soket
        count++;                    // atualiza o número de usuário conectados


        console.log(user + " . Socket id: " + socket.id);

        io2.emit('conect', username, user);    //envia a lista de usuário onlines para o cliente

        socket.on('disconnect', function(){
            io2.emit('leave chat', user + " saiu da conversa"); // emite uma mensagem para os demais clientes avisando a saida do chat
            count --;                                          // atualiza o número de usuário conectados
            username.splice(id,1);                             // remove o username da lista de usuário2s conectados
            sockets.splice(id, 1);                             // remove o socket da lista de sockets conectados
            io2.emit("update", username);                       // atualiza os clientes

        });

        socket.on('chat message', function(msg){    // emite uma mensagem para todos os clientes conectados
            io2.emit('chat message', msg, user);     // informando a mensagem e o usuário que a enviou
        });


    });

}
