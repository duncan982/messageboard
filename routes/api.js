"use strict";

const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");
const messageBoard = new mongoose.Schema({
  board: String,
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies: [
    {
      text: String,
      created_on: Date,
      delete_password: String,
      reported: Boolean,
    },
  ],
});

const MessageBoard = new mongoose.model("MessageBoard", messageBoard);

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(function (req, res) {
      /** Creating a new thread: POST request to /api/threads/{board} */

      let board;
      let text;
      let delete_password;
      if (req.params.board === "fcc_test") {
        board = req.params.board;
        text = req.body.text;
        delete_password = req.body.delete_password;
      } else {
        board = req.body.board;
        text = req.body.text;
        delete_password = req.body.delete_password;
      }

      async function createBoard(board, text, delete_password) {
        let date = new Date();
        let newMessageBoard = await MessageBoard.create({
          board: board,
          text: text,
          created_on: date,
          bumped_on: date,
          reported: false,
          delete_password: delete_password,
          replies: [],
        });
        newMessageBoard.save((err, newBoard) => {
          if (err) {
            return res.send(err);
          } else {
            // return res.redirect("/b/" + board + "/");
            return res.json(newBoard);
          }
        });
      }

      createBoard(board, text, delete_password);
    })
    .get(function (req, res) {
      /** Viewing the 10 most recent threads with 3 replies each */

      let filter;
      let requestParameters = new URLSearchParams(req.params.board);
      if (req.params.board === "fcc_test") {
        filter = {
          bumped_on: "descending",
        };
      } else {
        filter = {
          created_on: requestParameters.get("created_on"),
        };
      }

      /** find all threads, sort based on time/date and select those with
       * atleast 3 or more replies then select the top 10 and return them */
      MessageBoard.find(
        {},
        {
          reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0,
        }
      )
        .sort(filter)
        .then((boards) => {
          // console.log("boards", boards);
          let selectedBoards = boards
            .filter((board) => {
              if (board.replies.length >= 3) {
                // console.log("board.replies.length", board.replies.length);
                board.replies = board.replies.slice(-3);
                return board;
              }
            })
            .slice(0, 10);
          // console.log("selectedBoards.length:", selectedBoards.length);
          // console.log("selectedBoards", selectedBoards);
          res.json(selectedBoards);
        })
        .catch((err) => {
          console.log("error:", err);
          res.json({ error: err });
        });
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */

      let filter;
      let requestParameters = new URLSearchParams(req.params.board);
      if (req.params.board === "fcc_test") {
        filter = {
          thread_Id: req.body.thread_Id,
          delete_password: req.body.delete_password,
        };
      } else {
        filter = {
          thread_id: requestParameters.get("thread_id"),
          delete_password: requestParameters.get("delete_password"),
        };
      }

      // find board based on the, then id delete if it matches
      MessageBoard.findOneAndDelete(
        filter,
        { remove: true, new: false },
        (err, results) => {
          if (err) {
            res.send("error");
          } else {
            if (results) {
              res.send("success");
            } else {
              res.send("incorrect password");
            }
          }
        }
      );
    })
    .put((req, res) => {
      /** Reporting a thread: PUT request to /api/threads/{board} */

      const { thread_id } = req.body;

      MessageBoard.findOneAndUpdate(
        { _id: thread_id },
        { $set: { reported: true } },
        { new: true, upsert: true },
        (err, data) => {
          if (data) {
            res.send("reported");
          } else {
            res.send("not reported");
          }
        }
      );
    });

  app
    .route("/api/replies/:board")
    .post(function (req, res) {
      /** Creating a new reply: POST request to /api/replies/{board}
       */

      const { thread_id, text, delete_password } = req.body;

      let date = dayjs().format("YYYY-MM-DD");
      let TodaysDate = req.body.TodaysDate || date;

      /** find board and create new reply */
      let newReply = {
        text: text,
        created_on: TodaysDate,
        delete_password: delete_password,
        reported: false,
      };

      MessageBoard.findOneAndUpdate(
        { _id: thread_id },
        {
          $set: { bumped_on: newReply.created_on },
          $addToSet: { replies: newReply },
        },
        (err, board) => {
          if (board) {
            res.send({
              _id: board._id,
              board: board.board,
              text: board.text,
              created_on: board.created_on,
              bumped_on: board.bumped_on,
              reported: board.reported,
              delete_password: board.delete_password,
              replies: board.replies,
            });
          } else {
            res.send("error");
          }
        }
      );
    })
    .get((req, res) => {
      /** Viewing a single thread with all replies: GET request to /api/replies/{board} */

      let filter;
      let requestParameters = new URLSearchParams(req.params.board);
      if (req.params.board === "fcc_test") {
        filter = {
          board: req.params.board,
          thread_id: req.query.thread_Id,
        };
      } else {
        filter = {
          board: requestParameters.get("board"),
          thread_id: requestParameters.get("thread_id"),
        };
      }
      MessageBoard.findOne(filter, {
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0,
      })
        .then((board) => {
          res.json(board);
        })
        .catch((err) => {
          console.log("error:", err);
          res.json({ error: err });
        });

      // // iterate list of replies and find matching based on id
      // MessageBoard.findOne(filter)
      //   .then((board) => {
      //     let newReplies = board.replies.map((reply) => {
      //       return {
      //         text: reply.text,
      //         created_on: reply.created_on,
      //       };
      //     });
      //     let newBoard = {
      //       board: board.board,
      //       text: board.text,
      //       created_on: board.created_on,
      //       bumped_on: board.bumped_on,
      //       replies: newReplies.slice(0, 3),
      //     };
      //     res.send(newBoard);
      //   })
      //   .catch((error) => {
      //     res.json({ error: error });
      //   });
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */

      let requestParameters = new URLSearchParams(req.params.board);
      let thread_id;
      let replyId;
      let delete_password;
      if (req.params.board === "fcc_test") {
        thread_id = req.body.thread_id;
        replyId = req.body.replyId;
        delete_password = req.body.delete_password;
      } else {
        thread_id = requestParameters.get("thread_id");
        replyId = requestParameters.get("replyId");
        delete_password = requestParameters.get("delete_password");
      }

      // find board based on the id and delete it, if it matches
      MessageBoard.findOneAndUpdate(
        {
          _id: thread_id,
          replies: {
            $elemMatch: { _id: replyId, delete_password: delete_password },
          },
        },
        {
          $set: {
            "replies.$.text": "[deleted]",
          },
        },
        (err, data) => {
          if (data) {
            res.send("success");
          } else {
            res.send("incorrect password");
          }
        }
      );
    })
    .put((req, res) => {
      /** Reporting a reply: PUT request to /api/replies/{board} */

      const { thread_id, reply_id } = req.body;
      MessageBoard.findOneAndUpdate(
        {
          _id: thread_id,
          "replies._id": reply_id,
        },
        { $set: { "replies.$.reported": true } },
        (err, data) => {
          if (err) {
            res.send("error");
          } else {
            res.send("reported");
          }
        }
      );
    });
};
