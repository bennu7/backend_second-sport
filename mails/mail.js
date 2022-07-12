const nodemailer = require('nodemailer');
const {
    SERVER_MAIL_ADDRESS,
    SERVER_MAIL_PASS
} = process.env;

module.exports = {
    sendEmail : async (to, subject, html) => {
        try {

            const transporter = nodemailer.createTransport({
                service : 'gmail',
                auth:{
                    user : SERVER_MAIL_ADDRESS,
                    pass : SERVER_MAIL_PASS
                }
            });

            const mailOptions = {
                to, subject, html
            }

            const response = await transporter.sendMail(mailOptions);
            return response;
        } catch (error) {
            return error;
        }
    }
}