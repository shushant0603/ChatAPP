const express=require('express');
const app=express();
const http=require('http');
const {Server}=require('socket.io')
const server=http.createServer(app);
const path=require('path');
const io=new Server(server);


const users={};
io.on('connection', (socket) => {   // io.on is a listener for the connection event which is triggered when a client connects to the server
    socket.on('register-user', (username) => { //socket.on is a listener for the register-user event which is triggered when a client sends a register-user event 
        users[username] = socket.id;
        console.log(`${username} connected with ID: ${socket.id}`);

        // Broadcast the updated user list to all clients
        io.emit('update-user-list', Object.keys(users));
    });
    
    

    socket.on('private-message', ({ to, message,from }) => {
        const recipientSocketId = users[to];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private-message', {
                from,
                message
            });
        }
        // Also send the message back to the sender
    // socket.emit('private-message', {
    //     from,
    //     message
    // });
    });

    socket.on('disconnect-user', (username) => {
        if (users[username]) {
            delete users[username];
            console.log(`${username} disconnected.`);
            io.emit('update-user-list', Object.keys(users)); // Update user list
        }
    });
    // Handle socket disconnection
    socket.on('disconnect', () => {
        for (const username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                break;
            }
        }
        io.emit('update-user-list', Object.keys(users)); // Update user list
    });
    

});
app.use(express.static(path.resolve(__dirname, 'public')));
// app.use(express.static(path.resolve('./public')))
app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

server.listen(3000);