require("dotenv").config();
const { User } = require("../models");
const validator = new (require("fastest-validator"))();
const jwt = require("jsonwebtoken");

const mail = require("../mails/mail");
const bcrypt = require("bcrypt");
const Sentry = require("../lib/sentry");
const { google } = require("googleapis");
let tokenUser;

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  SERVER_ROOT_URI,
  JWT_SECRET_KEY,
  SERVER_LOGIN_ENDPOINT,
  JWT_TOKEN,
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  `${SERVER_ROOT_URI}/${SERVER_LOGIN_ENDPOINT}`
);

function generateAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    response_type: "code",
    scope: scopes,
  });

  return url;
}

async function setCredentials(code) {
  return new Promise(async (resolve, reject) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      return resolve(tokens);
    } catch (err) {
      return reject(err);
    }
  });
}

function getUserInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      var oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
      });

      const data = oauth2.userinfo.get((err, res) => {
        if (err) {
          return reject(err);
        } else {
          resolve(res);
        }
      });
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = {
  login: async (req, res) => {
    try {
      const schema = {
        email: "email|required",
        password: "string|required",
      };

      const validated = validator.validate(req.body, schema);
      if (validated.length) {
        return res.status(400).json({
          status: false,
          message: "bad request!",
          data: validated,
        });
      }

      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "user not found",
          data: null,
        });
      }

      const passwordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordCorrect) {
        return res.status(400).json({
          status: false,
          message: "wrong password",
          data: null,
        });
      }

      const data = {
        type: "basic",
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      };

      // const secretKey = process.env.JWT_SECRET_KEY;
      const token = jwt.sign(data, JWT_SECRET_KEY);
      // tokenUser = token;

      res.status(200).json({
        status: true,
        message: "ok",
        data: {
          ...data,
          token,
        },
      });
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  requestResetPassword: async (req, res) => {
    try {
      const email = req.body.email;

      const validated = validator.validate(
        { email },
        {
          email: "email",
        }
      );

      if (validated.length) return res.sendBadRequest("bad request schema");

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) return res.sendNotFound("user not found for email " + email);

      const payload = {
        user: user,
      };

      const tokenResetPassword = jwt.sign(payload, JWT_TOKEN + user.password, {
        expiresIn: "5m",
      });

      const resetUrl =
        req.protocol +
        "://" +
        process.env.URL_SERVER +
        "/api/v1/auth/reset-password/" +
        tokenResetPassword +
        "?user_id=" +
        user.id;

      await mail.sendEmail(email, "reset password", resetUrl);

      return res.sendJson(200, true, "successfully send reset token to email!");
    } catch (error) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },
  requestResetPassword: async (req, res) => {
    try {
      const email = req.body.email;

      const validated = validator.validate(
        { email },
        {
          email: "email",
        }
      );

      if (validated.length) return res.sendBadRequest("bad request schema");

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) return res.sendNotFound("user not found for email " + email);

      const payload = {
        user: user,
      };

      const tokenResetPassword = jwt.sign(payload, JWT_TOKEN + user.password, {
        expiresIn: "5m",
      });

      const resetUrl =
        req.protocol +
        "://" +
        process.env.URL_SERVER +
        "/api/v1/auth/reset-password/" +
        tokenResetPassword +
        "?user_id=" +
        user.id;

      await mail.sendEmail(email, "reset password", resetUrl);

      return res.sendJson(200, true, "successfully send reset token to email!");
    } catch (error) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  verifyResetPasswordToken: async (req, res) => {
    try {
      const token = req.params.token;
      const userId = req.query.user_id;

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) return res.sendNotFound("user not found for id :" + userId);

      const payload = jwt.verify(token, JWT_TOKEN + user.password);

      if (!payload) return res.sendBadRequest("reset token invalid!");

      return res.sendJson(200, true, "reset token valid!", payload);
    } catch (error) {
      Sentry.captureException(error);
      return res.sendServerError(error.message);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const token = req.params.token;
      const userId = req.query.user_id;
      const newPassword = req.body.password;

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) return res.sendNotFound("user not found for id : " + userId);

      const payload = jwt.verify(token, JWT_TOKEN + user.password);

      if (!payload) return res.sendBadRequest("reset token invalid!");

      const validated = validator.validate(
        { newPassword },
        {
          newPassword: "string|min:7",
        }
      );

      if (validated.length)
        return res.sendBadRequest("new pasword is not valid!");

      const updated = await User.update(
        {
          password: bcrypt.hashSync(newPassword, 10),
        },
        {
          where: {
            email: payload.user.email,
          },
        }
      );

      if (!updated) throw Error("failed to update new password!");
      return res.sendJson(200, true, "successfully reset password!", updated);
    } catch (error) {
      Sentry.captureException(error);
      return res.sendServerError(error.message);
    }
  },

  googleOAuth: async (req, res) => {
    try {
      const code = req.query.code;

      if (!code) {
        // generate url login
        const loginUrl = generateAuthUrl();

        // redirect to oauth login page
        return res.redirect(loginUrl);
      }

      await setCredentials(code);

      const { data } = await getUserInfo();

      //check email if is available in db
      const emailCheck = await User.findOne({
        where: {
          email: data.email,
        },
      });

      if (emailCheck == null) {
        //create new user with login google-oauth
        await User.create({
          full_name: data.name,
          email: data.email,
          type: "google-oauth2",
          role: "buyer",
        });
      }

      const user = {
        login_type: "google-oauth2",
        id: data.id,
        name: data.name,
        email: data.email,
      };

      const token = jwt.sign(user, JWT_TOKEN);

      res.status(200).json({
        status: true,
        message: "login success",
        data: {
          ...user,
          token,
        },
      });
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  requestSellerConfirmation : async (req, res) => {
    try {
      const user = req.user;
      if(! user.isValidBecomeSeller) throw Error('You are not qualify to become seller!');

      const payload = {
        status : true,
        user : user
      };
      const tokenConfirmation = jwt.sign(payload, JWT_TOKEN, {
        expiresIn : '15m'
      });

      const resetUrl =
        req.protocol +
        "://" +
        process.env.URL_SERVER +
        "/api/v1/auth/seller-confirmation/" +
        tokenConfirmation;

      mail.sendEmail(user.email, 'verify seller', resetUrl);
      return res.sendJson(200, true, 'successfully send verification seller mail!');
    } catch (error) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  verifySeller : async(req, res) => {
    try {
      const token = req.params.token;
      const payload = jwt.verify(token,  JWT_TOKEN);
      if(payload.user.id != req.user.id) throw Error('you are not authorize to verify as seller!');
      const update = await User.update({
        role : 'seller'
      }, {
        where : {
          id : payload.user.id
        }
      });
      if(! update) throw Error('failed to verify your account as seller!');

      return res.sendJson(200, true, 'successfully verify your account as seller!');
    } catch (error) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },
  whoami: async (req, res) => {
    const token = req.headers["authorization"];
    console.log("token whoami =>", token);
    console.log("token user login now =>", tokenUser);

    const currentUser = req.user;
    console.log(currentUser);

    res.status(200).json({
      status: true,
      message: "ok",
      data: currentUser,
    });
  },

  logout: async (req, res) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json({
          status: false,
          message: "you're not authorized!",
          data: null,
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET_KEY);

      console.log("decoded => ", decoded);

      jwt.sign(decoded, JWT_TOKEN, {
        expiresIn: 1,
      });

      res.status(200).json({
        status: true,
        message: "success logout user",
      });
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      if (err.message == "jwt malformed") {
        return res.status(401).json({
          status: false,
          message: err.message,
          data: null,
        });
      }

      return res.status(500).json({
        status: false,
        message: err.message,
        data: null,
      });
    }
  },
};
