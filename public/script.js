const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer(undefined, {
    host: '/',
    port: 3001
});

const myVideo = document.createElement('video');
myVideo.muted = true; // mutes the audio for ourselves.

const peers = {};


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    // allow to connected by other users
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});
//socket.emit('join-room', ROOM_ID, 10); test code



socket.on('user-connected', userId =>  {
    console.log('User connected: ' + userId);
});

socket.on('user-disconnected', userId => {
    //console.log(userId);
    if(peers[userId]) peers[userId].close();
});



function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream); // calls a user that we give certain id to

    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove(); // whenever someone closes it closes the video
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    videoGrid.append(video);
}