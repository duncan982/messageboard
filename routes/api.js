"use strict";

const { default: mongoose } = require("mongoose");

// const mongoose = require("mongoose");

const messageBoard = new mongoose.Schema({
  board: String,
  boardText: String,
  passwordToDelete: String,
});

const MessageBoard = new mongoose.model("MessageBoard", messageBoard);

module.exports = function (app) {
  app.route("/api/threads/:board").post(function (req, res) {
    // console.log("req.body", req.body);
    const { board, boardText, passwordToDelete } = req.body;
    // console.log(board, boardText, passwordToDelete);

    async function createMessageBoard(board, boardText, passwordToDelete) {
      const existingMessageBoard = await MessageBoard.findOne({ board: board });
      console.log("existingMessageBoard. 1. :", existingMessageBoard);
      if (existingMessageBoard) {
        // console.log("existingMessageBoard. 2. :", existingMessageBoard);
        return {
          board: existingMessageBoard.board,
          boardText: existingMessageBoard.boardText,
          passwordToDelete: existingMessageBoard.passwordToDelete,
        };
      } else {
        const newMessageBoard = await MessageBoard.create({
          board: board,
          boardText: boardText,
          passwordToDelete: passwordToDelete,
        });

        await newMessageBoard.save();
        console.log("newMessageBoard", newMessageBoard);
        return {
          board: newMessageBoard.board,
          boardText: newMessageBoard.boardText,
          passwordToDelete: newMessageBoard.passwordToDelete,
        };
      }
    }

    let message = createMessageBoard(board, boardText, passwordToDelete);
    message.then((data) => {
      // console.log("data", data);
      res.json({
        board: data.board,
        boardText: data.boardText,
        passwordToDelete: data.passwordToDelete,
      });
    });
  });

  app.route("/api/replies/:board");
};
