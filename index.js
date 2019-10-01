const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv/config");
const mongoose = require("mongoose");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const SocketIO = require("socket.io");

mongoose.connect(
  process.env.DB_Connection,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) throw err;
    console.log("Connected to DB");
  }
);

//Middlewares
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res, next) => {
  res.send("You are in home");
});

// app.use("/signup", require("./routes/signup"));
// app.use("/login", require("./routes/login"));
app.use("/", require("./routes/authRoutes"));

app.get("/secret", (req, res, next) => {
  res.json("secret page");
});

const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

const io = SocketIO(server);

io.on("connection", socket => {
  socket.on("NewClient", () => {
    if (clients < 2) {
      if (clients == 1) {
        io.emit("CreatePeer");
      } else io.emit("SessionActive");
      clients++;
    }
  });

  socket.on("Offer", offer => {
    socket.broadcast.emit("BackOffer", offer);
  });
  socket.on("Answer", data => {
    socket.broadcast.emit("BackAnswer", data);
  });
  socket.on("disconnect", () => {
    if (clients > 0) {
      clients--;
    }
  });
});
