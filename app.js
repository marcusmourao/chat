/**
 * Created by marcus on 18/12/16.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var socketioJwt = require('socketio-jwt');
var usernames = [];
var tokens =[];  // variavel global para empilhar o token

app.set('view engine', 'ejs');  //view engine para passar parâmetros para a view
app.use(express.static(__dirname + '/public'));



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
        last_date: String,
        text: String,
        user: String
    }]
});

var History = mongoose.model('History', historySchema);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();});

app.post('/login', function(req, res){
    var chatName = req.body.chatName;
    var token = req.body.token;
    var username = req.body.username;
    tokens.push(token);
    console.log(username);
    usernames.push(username);
    saveSocket(chatName);
    res.redirect("/chat/" + chatName);
});

app.get('/chat/:chatName', function(req, res){
    res.render(__dirname + '/index.ejs', {token: tokens.pop(), username: usernames.pop()});
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html');
});

app.get('/message', function(req, res){
    res.sendFile(__dirname + '/message.html');
});


http.listen(8080, function(){
    console.log('listening on *:8080');
});

function entrySocket(name) {
    var namespace = io.of('/' + name);
    namespace.on('connection', socketioJwt.authorize({
        secret: 'vaiternespressosimounaomefalaquerosaber',
        timeout: 15000 // 15 seconds to send the authentication message
    })).

    on('authenticated', function(socket) {
        //this socket is authenticated, we are good to handle more events from it.
        // console.log('hello!' + socket.decoded_token.id);
        socket.on('chat message', function (msg, username) {    // emite uma mensagem para todos os clientes conectados
            namespace.emit('chat message', msg, username);     // informando a mensagem e o usuário que a enviou
            var query = History.find({socket_id: name.toString()}, function (err, histories) {
                histories[0].messages.push({
                    last_date: new Date().toString(),
                    text: msg,
                    user: username
                });
                histories[0].save();
                // console.log(histories[0].messages);
            });
        });
    });

}

function saveSocket(name) {
    var query = History.find({socket_id: name.toString()}, function (err, histories) {
        if(histories.length == 0) {
            var c_id = name.split('p')[0];
            var p_id = 'p' + name.split('p')[1];
            var historyDocument = new History({
                socket_id: name.toString(),
                c_id: c_id.toString(),
                p_id: p_id.toString(),
                messages: {
                    last_date: new Date().toString(),
                    text: 'first message',
                    user: 'null'
                }
            });
            historyDocument.save();
            entrySocket(name);
        }
    });
}
