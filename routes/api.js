"use strict";

const { default: mongoose } = require("mongoose");
const url = require("url");
const querystring = require("querystring");
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
      console.log("POST : /api/threads/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      console.log("req.params", req.params);
      console.log("req.query", req.query);

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
      console.log(
        "board:",
        board,
        "text:",
        text,
        "delete_password",
        delete_password
      );
      //   console.log("board does not exist");
      async function createBoard(board = "board", text, delete_password) {
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
            return console.error(err);
          } else {
            return res.json(newBoard);
            // return res.redirect("/b/" + newBoard.board + "/");
          }
        });
      }

      createBoard(board, text, delete_password);
    })
    .get(function (req, res) {
      /** Viewing the 10 most recent threads with 3 replies each */

      console.log("GET : /api/threads/:board");
      console.log("requesting url:", req.url);
      console.log("req.params", req.params);
      console.log("req.body", req.body);
      console.log("req.query", req.query);

      /** SPECIAL: push the replies to board array of replies*/
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
      console.log("filter", filter);

      /** find all threads, sort based on time/date and select those with
       * atleast 3 or more replies then select the top 10 and return them */
      let availableMessages = MessageBoard.find({});
      availableMessages.sort(filter).then((boards) => {
        let selectedBoards = boards
          .filter((board) => {
            // console.log("board before", board);
            return board.replies.length >= 3;
          })
          .slice(0, 10)
          .map((board) => {
            // console.log(board);
            let newReplies = board.replies.map((reply) => {
              return {
                text: reply.text,
                created_on: reply.created_on,
              };
            });
            // console.log("newReplies", newReplies);
            let newBoard = {
              board: board.board,
              text: board.text,
              created_on: board.created_on,
              bumped_on: board.bumped_on,
              replies: newReplies.slice(0, 3),
            };
            return newBoard;
          });
        // console.log("selectedBoards", selectedBoards);
        console.log("created_on selectedBoards.length:", selectedBoards.length);
        res.json(selectedBoards);
      });
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */
      console.log("DELETE : /api/threads/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      console.log("req.params", req.params);
      console.log("req.query", req.query);

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
      console.log("filter", filter);

      // // find board based on the id delete if it matches
      // MessageBoard.findOneAndDelete(filter)

      //   .then((results) => {
      //     if (results) {
      //       res.send("success");
      //     } else {
      //       res.send("incorrect password");
      //     }
      //   })
      //   .catch((error) => {
      //     console.log("error:", error);
      //   });

      // find board based on the, then id delete if it matches
      MessageBoard.findOneAndDelete(
        filter,
        { remove: true, new: false },
        (err, results) => {
          if (err) {
            console.log("error:", error);
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
      console.log("PUT : /api/threads/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      console.log("req.params", req.params);
      console.log("req.query", req.query);
      const { thread_id } = req.body;
      console.log("thread_id", thread_id);

      MessageBoard.findOneAndUpdate(
        { _id: thread_id },
        { $set: { reported: true } },
        { new: true, upsert: true },
        (err, data) => {
          if (data) {
            // console.log("data", data);
            res.send("reported");
          } else {
            res.send("not reported");
            // console.log("error:", err);
          }
        }
      );
    });

  app
    .route("/api/replies/:board")
    .post(function (req, res) {
      /** Creating a new reply: POST request to /api/replies/{board}
       */
      console.log("POST : /api/replies/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      // console.log("req.params", req.params);
      // console.log("req.query", req.query);
      const { thread_id, text, delete_password } = req.body;
      // console.log(thread_Id, text, delete_password);

      let date = dayjs().format("YYYY-MM-DD");
      let TodaysDate = req.body.TodaysDate || date;
      // console.log("TodaysDate2:", TodaysDate);

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
            console.log("error:", err);
            res.send("error");
          }
        }
      );

      /**SPECIAL: collect available boards and create three replies to each of the boards */
      // let date = new Date();
      // let replies = [];
      // for (let j = 0; j < 4; j++) {
      //   replies.push({
      //     text: `test test ${j}`,
      //     created_on: date,
      //     delete_password: `123${j}`,
      //     reported: false,
      //   });
      // }
      // // console.log("replies", replies);
      // MessageBoard.updateMany(
      //   {},
      //   {
      //     $set: {
      //       bumped_on: date,
      //     },
      //   }
      // ).then((status) => {
      //   console.log(status);
      // });
      // MessageBoard.updateMany(
      //   {},
      //   {
      //     $set: {
      //       replies: replies,
      //     },
      //   },
      //   { multi: true }
      // ).then((status) => {
      //   console.log(status);
      // });
    })
    .get((req, res) => {
      /** Viewing a single thread with all replies: GET request to /api/replies/{board} */
      console.log("GET : /api/replies/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      console.log("req.params", req.params.board);
      console.log("req.query", req.query);

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
      console.log("filter", filter);
      // console.log("actualboardId", actualboardId);

      // iterate list of replies and find matching based on id
      MessageBoard.findOne(filter)
        // MessageBoard.findOne({ boardId: actualboardId })
        .then((board) => {
          // console.log("replies", replies);
          // console.log("board length", board.length);
          let newReplies = board.replies.map((reply) => {
            return {
              text: reply.text,
              created_on: reply.created_on,
            };
          });
          // console.log("newReplies", newReplies);
          let newBoard = {
            board: board.board,
            text: board.text,
            created_on: board.created_on,
            bumped_on: board.bumped_on,
            replies: newReplies.slice(0, 3),
          };
          // console.log("newBoard", newBoard);
          res.send(newBoard);
        })
        .catch((error) => {
          console.log(
            "Not able to find replies to the supplied board id",
            error
          );
          res.json({ error: error });
        });
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */
      console.log("DELETE : /api/replies/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      console.log("req.params", req.params);
      console.log("req.query", req.query);

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

      console.log(
        "thread_id:",
        thread_id,
        "replyId:",
        replyId,
        "delete_password:",
        delete_password
      );

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
        // { new: true, upsert: true },
        (err, data) => {
          // console.log("data", data);
          if (data) {
            // res.json("incorrect password");
            res.send("success");
          } else {
            // console.log("error:", err);
            res.send("incorrect password");
          }
        }
      );
    })
    .put((req, res) => {
      /** Reporting a reply: PUT request to /api/replies/{board} */

      console.log("PUT : /api/replies/:board");
      console.log("requesting url:", req.url);
      console.log("req.body", req.body);
      console.log("req.params", req.params);
      console.log("req.query", req.query);
      const { thread_id, reply_id } = req.body;
      console.log("thread_id", thread_id, "reply_id", reply_id);
      MessageBoard.findOneAndUpdate(
        {
          _id: thread_id,
          "replies._id": reply_id,
        },
        { $set: { "replies.$.reported": true } },
        (err, data) => {
          if (err) {
            // console.log("error:", err);
            res.send("error");
          } else {
            // console.log("data", data);
            res.send("reported");
          }
        }
      );
    });
};
