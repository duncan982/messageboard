"use strict";

const { default: mongoose } = require("mongoose");

// const mongoose = require("mongoose");

const messageBoard = new mongoose.Schema({
  board: String,
  boardText: String,
  passwordToDelete: String,
});

const MessageBoard = new mongoose.model("MessageBoard", messageBoard);

const repliesToThreadText = new mongoose.Schema({
  threadId: String,
  threadText: String,
  repliesToThreadText: String,
  passwordToDelete: String,
});

const RepliesToThreadText = new mongoose.model(
  "RepliesToThreadText",
  repliesToThreadText
);

module.exports = function (app) {
  app.route("/api/threads/:board").post(function (req, res) {
    // console.log("req.body", req.body);
    const { board, boardText, passwordToDelete } = req.body;
    // console.log(board, boardText, passwordToDelete);

    async function createMessageBoard(board, boardText, passwordToDelete) {
      // const existingMessageBoard = await MessageBoard.findOne({
      //   board: board,
      // });
      // // console.log("existingMessageBoard. 1. :", existingMessageBoard);
      // if (existingMessageBoard) {
      //   // console.log("existingMessageBoard. 2. :", existingMessageBoard);
      //   return {
      //     board: existingMessageBoard.board,
      //     boardText: existingMessageBoard.boardText,
      //     passwordToDelete: existingMessageBoard.passwordToDelete,
      //   };
      // } else {
      const newMessageBoard = await MessageBoard.create({
        board: board,
        boardText: boardText,
        passwordToDelete: passwordToDelete,
      });

      await newMessageBoard.save();
      // console.log("newMessageBoard", newMessageBoard);

      const messages = await MessageBoard.find({});

      return messages;
      // return {
      //   board: newMessageBoard.board,
      //   boardText: newMessageBoard.boardText,
      //   passwordToDelete: newMessageBoard.passwordToDelete,
      // };
      // }
    }

    let message = createMessageBoard(board, boardText, passwordToDelete);
    message.then((data) => {
      console.log("data", data);
      res.send(data);
      // res.json({
      //   board: data.board,
      //   boardText: data.boardText,
      //   passwordToDelete: data.passwordToDelete,
      // });
    });
  });
  // .get(function (req, res) {
  //   console.log(req.body);
  // });

  app.route("/api/replies/:board").post(function (req, res) {
    const { threadId, threadText, repliesToThreadText, passwordToDelete } =
      req.body;

    console.log(threadId, threadText, repliesToThreadText, passwordToDelete);
    // a function to asynchrnously create and save new reply
    async function createAndSaveNewReply(
      threadId,
      threadText,
      repliesToThreadText,
      passwordToDelete
    ) {
      // create new reply
      let newReply = await RepliesToThreadText.create({
        threadId: threadId,
        threadText: threadText,
        repliesToThreadText: repliesToThreadText,
        passwordToDelete: passwordToDelete,
      });

      // save new reply
      newReply.save();
    }

    // create and save new reply
    createAndSaveNewReply(
      threadId,
      threadText,
      repliesToThreadText,
      passwordToDelete
    );

    // a function to search the collection of replies for all replies matching thread id
    async function searchForAllRepliesToThreadText(threadId) {
      let allRepliesToThreadText = await RepliesToThreadText.find({
        threadId: threadId,
      });
      return allRepliesToThreadText;
    }

    // search in the collection of replies for all replies matching thread id
    let allRepliesToThreadText = searchForAllRepliesToThreadText(threadId);
    allRepliesToThreadText.then((data) => {
      // console.log("allRepliesToThreadText", data);

      // iterate the list of replies and collect replies and their ids
      let replies = [];
      data.forEach((reply) => {
        replies.push({
          replyId: reply._id,
          reply: reply.repliesToThreadText,
        });
      });

      // console.log("replies", replies);

      // return thread id, thread text, list of replies with their ids
      res.send({
        threadId: threadId,
        threadText: threadText,
        replies: replies,
      });
    });
  });
};
