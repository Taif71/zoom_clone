const express = require('express');

const app = express();

const server = require('http').Server(app);

const io = require('socket.io')(server);

const {v4: uuidV4} = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));



app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room});
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        //console.log(roomId, userId);

        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId); // we're gonna send a message to the room that we're currently in
        // .broadcast() means send this to all the users in the same room but not myself/ don't send it back to me

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected');
        });
    });
});

server.listen(3000, () => {
    console.log('Server has started at port 3000');
}); // server is purely for setting up our room

