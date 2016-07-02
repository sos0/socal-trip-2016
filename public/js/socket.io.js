/* global io */

'use strict';
var io = io();

io.on('connection', function(socket) {
    socket.on('marker', function(obj){
        console.log('received marker obj: ' + obj);
    })

    socket.on('disconnect', function(){
        io.emit('user disconnected.');
    })
});

io.on('onlineUsers', function(num) {
    console.log('online users: ' + num);
});
