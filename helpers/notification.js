const notificationController = require('../controllers/notification');
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('getAllNotifications', (data) => {
            const resData = notificationController.getAllNotification(data);
            io.emit('getAllNotifications', resData);
        });

        socket.on('getUnreadNotifications', (data) => {
            const resData = notificationController.getUnreadNotification(data);
            io.emit('getUnreadNotifications', resData);
        });

        socket.on('readNotification', (data) => {
            const resData = notificationController.readNotification(data);
            io.emit('readNotification', resData);
        });

        socket.on('deleteNotification', (data) => {
            const resData = notificationController.deleteNotification(data);
            io.emit('deleteNotification', resData);
        });

        socket.on('sendNotification', (data) => {
            const resData = notificationController.sendNotification(data);
            io.emit('sendNotification', resData);
        })
    });
}