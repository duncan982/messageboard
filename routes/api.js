"use strict";

const { default: mongoose } = require("mongoose");
// const moments = require("moments");

// const mongoose = require("mongoose");

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
    // .post(function (req, res) {
    //   // console.log("req.body", req.body);
    //   const { board, boardText, passwordToDelete } = req.body;
    //   // console.log(board, boardText, passwordToDelete);

    //   async function createMessageBoard(board, boardText, passwordToDelete) {
    //     let date = new Date();
    //     // console.log("time and date thread was created", date);
    //     const newMessageBoard = await MessageBoard.create({
    //       board: board,
    //       boardText: boardText,
    //       dateAndTime: date,
    //       passwordToDelete: passwordToDelete,
    //     });

    //     await newMessageBoard.save();
    //     // console.log("newMessageBoard", newMessageBoard);

    //     const messages = await MessageBoard.find({});

    //     return messages;
    //   }

    //   let message = createMessageBoard(board, boardText, passwordToDelete);
    //   message.then((data) => {
    //     // console.log("data", data);
    //     res.send(data);
    //   });
    // });
    .get(function (req, res) {
      /** aroute to sort the 10 most recent threads with 3 replies each */
      const { recentThreads, replies } = req.body;

      /** push the replies to board array of replies*/
      // iterate replies
      RepliesToThreadText.find({}).then((replies) => {
        replies.forEach((reply) => {
          // find matches by id
          MessageBoard.findById({ _id: reply.boardId }).then((board) => {
            console.log("board before", board);

            // update list of reply with the current reply
            board.repliesToBoardText.push(reply.replyToBoardText);
            console.log("board after", board);
          });
        });
      });
      //     console.log("board before", board);
      // // }
      // });

      // use mongoose.findOneAndUpdate() based on the above id

      // // find treads, sort by date in a descending manner
      // let sortedRepliesToThreadTextByDate = RepliesToThreadText.find({}).sort({
      //   boardDateAndTime: "descending",
      // });

      // sortedRepliesToThreadTextByDate.then((data) => {
      //   // console.log("all threads", data);

      //   // select those with atleast 3 or more replies
      //   // select the top 10 and return them
      //   // console.log("top 10 threads", data.slice(0, 9).length());
      // });
      // select the top 10 and return them
      // search in the replies for all thread and replies collections,
      // sort based on time/date
      // select those with atleast 3 or more replies
      // select the top 10 and return them

      //   // a function to find all threads, sort based on time/date and with atleast 3 or more replies then select the top 10 and return them
      //   async function searchForAllThreads(recentThreads, replies) {
      //     let allThreads = await MessageBoard.find({});

      //     let allThreadsSortedByTimeAndReplies = [];
      //     allThreads.then((data) => {
      //       console.log("all threads", data);

      //       // sort based on time/date
      //       // select those with atleast 3 or more replies
      //     });
      //     // select the top 10 and return them
      //     let allThreadsMatchingSelectionCriteria = [];
      //     return allThreadsMatchingSelectionCriteria;
      //   }

      //   // search in the collection of replies for all replies matching thread id
      //   let allmatchingThreads = searchForAllThreads(recentThreads, replies);
      //   allmatchingThreads.then((data) => {
      //     console.log("allmatchingThreads", data);
      //     res.send(data);
      //   });
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
