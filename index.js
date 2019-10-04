const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv/config");
const mongoose = require("mongoose");
const logger = require("morgan");
const bodyParser = require("body-parser");
const SocketIO = require("socket.io");
const verifyToken = require("./routes/verifyToken");

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

// app.get("/", (req, res, next) => {
//   res.send("You are in home");
// });

// app.use("/signup", require("./routes/signup"));
// app.use("/login", require("./routes/login"));
app.use("/user", require("./routes/authRoutes"));
// app.use("/chatroom", require("./routes/chatroom"));

app.get("/protected", verifyToken, (req, res) => {
  res.send(req.user);
});

const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
const io = SocketIO(server);
let clients = 0;
let socket = 0;

io.on("connection", function(socket) {
  console.log("Socket: " + socket.id);
  socket.on("NewClient", function() {
    console.log("Entró");
    if (clients < 2) {
      if (clients == 1) {
        console.log("Peer", clients);
        socket.broadcast.emit("CreatePeer");
      }
    } else io.emit("SessionActive");
    clients++;
    console.log(clients);
  });

  socket.on("Offer", SendOffer);
  socket.on("Answer", SendAnswer);
  socket.on("disconnect", Disconnect);
});

function Disconnect() {
  if (clients > 0) {
    clients--;
    console.log(clients);
    this.broadcast.emit("RemoveVideo");
  }
}

function SendOffer(offer) {
  console.log("send offer");
  this.broadcast.emit("BackOffer", offer);
}

function SendAnswer(data) {
  this.broadcast.emit("BackAnswer", data);
}
