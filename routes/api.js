"use strict";

const { default: mongoose } = require("mongoose");
const url = require("url");
const querystring = require("querystring");
// const URLSearchParams = require("URLSearchParams");

const messageBoard = new mongoose.Schema({
  board: String,
  boardText: String,
  dateAndTime: Date,
  passwordToDelete: String,
  repliesToBoardText: Array,
});

const MessageBoard = new mongoose.model("MessageBoard", messageBoard);

const repliesToThreadText = new mongoose.Schema({
  boardId: String,
  boardText: String,
  boardDateAndTime: Date,
  replyToBoardText: String,
  dateAndTime: Date,
  passwordToDelete: String,
});

const RepliesToThreadText = new mongoose.model(
  "RepliesToThreadText",
  repliesToThreadText
);

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(function (req, res) {
      // console.log("req.body", req.body);
      const { board, boardText, passwordToDelete } = req.body;
      // console.log(board, boardText, passwordToDelete);

      async function createMessageBoard(board, boardText, passwordToDelete) {
        let date = new Date();
        // console.log("time and date thread was created", date);
        const newMessageBoard = await MessageBoard.create({
          board: board,
          boardText: boardText,
          dateAndTime: date,
          passwordToDelete: passwordToDelete,
          repliesToBoardText: [],
        });

        await newMessageBoard.save();
        // console.log("newMessageBoard", newMessageBoard);

        const messages = await MessageBoard.find({});

        return messages;
      }

      let message = createMessageBoard(board, boardText, passwordToDelete);
      message.then((data) => {
        // console.log("data", data);
        res.send(data);
      });
    })
    .get(function (req, res) {
      /** aroute to sort the 10 most recent threads with 3 replies each */
      // const { recentThreads, replies } = req.body;

      /** push the replies to board array of replies*/
      // RepliesToThreadText.find({}).then((replies) => {
      //   // iterate replies
      //   replies.forEach((reply) => {
      //     // find boards that matches by id
      //     MessageBoard.findById({ _id: reply.boardId }).then((board) => {
      //       // console.log("board before", board);

      //       // update board's list of reply with the current reply
      //       board.repliesToBoardText.push(reply.replyToBoardText);
      //       board.save();
      //       console.log("board after", board);
      //     });
      //   });
      // });

      /** find all threads, sort based on time/date and select those with
       * atleast 3 or more replies then select the top 10 and return them */
      MessageBoard.find({})
        .sort({ dateAndTime: "descending" })
        .then((boards) => {
          // console.log("all threads sorted descending", boards);
          // select the top 10 boards with atleast 3 or more replies
          let selectedBoards = boards
            .filter((board) => {
              // return board.repliesToBoardText.length >= replies;
              return board.repliesToBoardText.length >= 3;
            })
            // .slice(0, recentThreads);
            .slice(0, 10);
          // console.log(selectedBoards);
          // console.log(selectedBoards.length);
          // res.send(selectedBoards);
          res.json({ selectedBoards });
        });
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */

      const { boardId, passwordToDelete } = querystring.parse(req.params.board);

      // find board based on the id delete if it matches
      MessageBoard.deleteOne(
        { _id: boardId },
        { passwordToDelete: passwordToDelete }
      )
        .then((board) => {
          res.send({ board: board });
        })
        .catch((error) => {
          res.send({ error: "board not deleted" });
        });
    });

  app.route("/api/replies/:board").post(function (req, res) {
    // a route to create replies to thread

    // a function to asynchronously create and save new reply
    async function createAndSaveNewReply(
      boardId,
      boardText,
      boardDateAndTime,
      replyToBoardText,
      passwordToDelete
    ) {
      let date = new Date();
      // create new reply
      let newReply = await RepliesToThreadText.create({
        boardId: boardId,
        boardText: boardText,
        boardDateAndTime: boardDateAndTime,
        replyToBoardText: replyToBoardText,
        dateAndTime: date,
        passwordToDelete: passwordToDelete,
      });

      // save new reply
      newReply.save();
    }

    // collect available boards
    const boards = MessageBoard.find({});

    //// create three replies to each of the boards
    // boards.then((data) => {
    //   console.log("data", data);
    //   for (let i = 0; i < data.length; i++) {
    //     for (let j = 0; j < 3; j++) {
    //       // create and save new reply
    //       createAndSaveNewReply(
    //         data[i]._id,
    //         data[i].boardText,
    //         data[i].dateAndTime,
    //         `Thats good ${j}`,
    //         data[i].passwordToDelete
    //       );
    //     }
    //   }
    // });

    let allRepliesToThreadText = RepliesToThreadText.find({});
    allRepliesToThreadText.then((data) => {
      res.send(data);
    });
  });
};
