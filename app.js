require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const route = require("./routes");
const responseFormat = require("./helpers/responseFormat");
const swaggerJSON = require('./swagger.json')
const swaggerUi = require('swagger-ui-express')
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const notificationHelper = require('./helpers/notification');

app.use(morgan("dev"));
app.use(express.json());
app.use(responseFormat);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSON))

const { PORT} = process.env;

app.use(express.urlencoded({ extended: false }));

// basic routes : secondsport.com/api/v1/
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    status: true,
    message: "welcome to API SecondSport",
    data: null,
  });
});

//io notifications
app.use(express.static('public'));
notificationHelper(io);

app.use("/api", route);

http.listen(PORT, () => {
  console.log("server running on port ", PORT);
});
