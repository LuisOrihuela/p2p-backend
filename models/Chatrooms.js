const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatroomSchema = new Schema({
  creator: { type: String, required: false },
  level: { type: String, required: false },
  subject: { type: String },
  creatorId: String
});

const Chatroom = mongoose.model("Chatroom", chatroomSchema);

module.exports = Chatroom;
