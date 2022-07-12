const {Notification, User} = require('../models');
const {Sentry} = require('../lib/sentry');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = process.env;
const formatResponse = (status, message, data = []) => {return {status:status, message:message,data:data}};
module.exports = {
    getAllNotification : async (data) => {
        try {
            const token = data.token;
            const payload = jwt.verify(token, JWT_SECRET_KEY);
            const notifications = await Notification.findAll({
                where : {
                    receiver_id : payload.id
                }
            });
            return formatResponse(200, 'successfully fetch all data', notifications);
        } catch (error) {
            Sentry.captureException(error);
            return formatResponse(500, error.message);
        }
    },
    getUnreadNotification : async ( data) => {
        try {
            const token = data.token;
            const payload = jwt.verify(token, JWT_SECRET_KEY);
            const notification = await Notification.findAll({
                where : {
                    receiver_id : payload.id,
                    is_read : false
                }
            });
            return res.sendJson(200, true, 'successfully fetch unread notification!', notification);
        } catch (error) {
            Sentry.captureException(error);
            return formatResponse(500, error.message);
        }
    },
    readNotification : async (data) => {
        try {
            const token = data.token;
            const payload = jwt.verify(token, JWT_SECRET_KEY);
            const update = await Notification.update({
                is_read : true
            }, {
                where : {
                    id : data.notification_id,
                    receiver_id : payload.id
                }
            });

            if(! update) throw Error('failed to read notification with id ' + id);

            return formatResponse(true, 'successfully read notification!', update);
        } catch (error) {
            Sentry.captureException(error);
            return formatResponse(500, error.message);
        }
    },
    deleteNotification : async (data) => {
        try {
            const token = data.token;
            const payload = jwt.verify(token, JWT_SECRET_KEY);
            const deleted = await Notification.destroy({
                where : {
                    id : data.notification_id,
                    receiver_id : payload.id
                }
            });

            if(! deleted) throw Error('failed to delete notification with id ' + id);

            return formatResponse(true, 'successfully read notification!', deleted);
        } catch (error) {
            Sentry.captureException(error);
            return formatResponse(500, error.message);
        }
    },
    sendNotification : async (data) => {
        try {
            const token = data.token;
            const payload = jwt.verify(token, JWT_SECRET_KEY);
            const {receiver_id, message} = data.body;
            const sender = await User.findOne({
                where : {
                    id : payload.id
                }
            });
            if(! sender) res.sendNotFound('sender not found!');
            const receiver = await User.findOne({
                where : {
                    id : receiver_id
                }
            });
            if(! receiver) res.sendNotFound('receiver not found!');

            const notif = await Notification.create({
                sender_id : payload.id, receiver_id, message
            });

            return res.sendJson(200, true, 'successfully send notification', notif);
        } catch (error) {
            Sentry.captureException(error);
            return formatResponse(500, error.message);
        }
    }
}