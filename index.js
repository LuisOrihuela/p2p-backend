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

app.use("/user", require("./routes/authRoutes"));

app.get("/protected", verifyToken, async (req, res) => {
  res.send(req.user);
});

const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
const io = SocketIO(server);
let clients = 0;

io.of("/chatroom").on("connection", function(socket) {
  socket.on("NewClient", function(data) {
    // console.log(id);
    socket.join(1);
    socket.room = 1;
    // console.log(io.of("/").in().adapter.rooms);
    // console.log(io.nsps["/"].adapter.rooms);
    if (clients < 2) {
      if (clients == 1) {
        socket.broadcast.emit("CreatePeer");
      }
    } else {
      // io.emit("SessionActive");
      return;
    }
    clients++;
  });

  socket.on("Offer", SendOffer);
  socket.on("Answer", SendAnswer);
  socket.on("disconnect", Disconnect);
});

function Disconnect() {
  if (clients > 0) {
    clients--;
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

io.of("/dashboard").on("connection", socket => {
  socket.on("test", data => {
    console.log(data);
  });

  socket.on("chatrooms updated", data => {
    socket.broadcast.emit("getChatrooms", data);
  });
});
