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

app.post('/login', function(req, res){
    var chatName = req.body.chatName;
    saveSocket(chatName);
    entrySocket(chatName);
    res.redirect("/chat/" + chatName);
});

app.get('/chat/:chatName', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html');
});


http.listen(3300, function(){
    console.log('listening on *:3000');
});

function saveSocket(name) {
    var query = History.find({socket_id: name.toString()}, function (err, histories) {
        console.log(histories.length);
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
            console.log('salvando history: ' + historyDocument.save());
        }
    });
}

function entrySocket(name) {
    var namespace = io.of('/' + name);
    console.log(namespace);
    namespace.on('connection', function (socket) {
        socket.removeAllListeners();
        socket.on('chat message', function (msg, username) {    // emite uma mensagem para todos os clientes conectados
            namespace.emit('chat message', msg, username);     // informando a mensagem e o usuário que a enviou
            var query = History.find({socket_id: name.toString()}, function (err, histories) {
                histories[0].messages.push({
                    last_date: new Date().toString(),
                    text: msg,
                    user: username
                });
                histories[0].save();
                console.log(histories[0].messages);
            });
        });
    })
}