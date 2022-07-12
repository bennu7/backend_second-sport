const io = io();
io.on('getAllNotifications', (data) => {

});
io.on('getUnreadNotifications', (data) => {

});
io.on('readNotification', (data) => {

});
io.on('deleteNotification', (data) => {

});
io.on('sendNotification', (data) => {

});
const notif = {
    getAllNotifications : (token, callback) => {
        io.emit('getAllNotifications', data);
    }
};


