/**
 * Created by marcus on 18/12/16.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/messages');

mongoose.Promise = global.Promise;
var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
});


var historySchema = mongoose.Schema({
    socket_id: String,
    c_id: String,
    p_id: String,
    messages: [{
        text: String,
        user: String
    }]
});

var History = mongoose.model('History', historySchema);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.post('/login', function(req, res){
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

    console.log(name);
    var namespace = io.of('/' + name);
    namespace.on('connection', function(socket){


        var historyDocument = new History({
            socket_id: name.toString(),
            c_id: 'null',
            p_id: 'null',
            messages: {
                text: 'first message',
                user: 'null'
            }
        });

        console.log('salvando history: ' + historyDocument.save());

        socket.on('chat message', function(msg){    // emite uma mensagem para todos os clientes conectados
            namespace.emit('chat message', msg);     // informando a mensagem e o usuário que a enviou
            console.log(msg);

        });

    });
}
