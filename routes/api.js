"use strict";

const { default: mongoose } = require("mongoose");
const url = require("url");
const querystring = require("querystring");
// const URLSearchParams = require("URLSearchParams");

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
      const { board, text, delete_password } = req.body;
      console.log("POST : /api/threads/:board");
      console.log("req.body", req.body);
      console.log(board, "text:", text, "delete_password", delete_password);

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
          replies: [
            {
              text: "",
              created_on: new Date(),
              delete_password: "",
              reported: false,
            },
          ],
        });
        await newMessageBoard.save();
        // newMessageBoard.then((data) => {
        // console.log("newMessageBoard", newMessageBoard);
        // res.send(data);
        return {
          _id: newMessageBoard._id,
          board: newMessageBoard.board,
          text: newMessageBoard.text,
          created_on: newMessageBoard.created_on,
          bumped_on: newMessageBoard.bumped_on,
          reported: newMessageBoard.reported,
          delete_password: newMessageBoard.delete_password,
          replies: newMessageBoard.replies,
        };
      }

      let newBoard = createBoard(board, text, delete_password);
      newBoard.then((newMessageBoard) => {
        // console.log("newMessageBoard", newMessageBoard);

        // res.json({
        res.send({
          _id: newMessageBoard._id,
          board: newMessageBoard.board,
          text: newMessageBoard.text,
          created_on: newMessageBoard.created_on,
          bumped_on: newMessageBoard.bumped_on,
          reported: newMessageBoard.reported,
          delete_password: newMessageBoard.delete_password,
          replies: newMessageBoard.replies,
        });
      });
    })
    .get(function (req, res) {
      /** Viewing the 10 most recent threads with 3 replies each */

      console.log("GET : /api/threads/:board");
      console.log(req.params);

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
      let availableMessages = MessageBoard.find({});
      if (req.params.board === "sort=created_on") {
        availableMessages.sort({ created_on: "descending" }).then((boards) => {
          // console.log("all threads sorted descending", boards);
          // select the top 10 boards with atleast 3 or more replies
          // boards.then((datas) => {
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
                replies: newReplies.slice(0, 2),
              };
              return newBoard;
            });
          // console.log("selectedBoards", selectedBoards);
          console.log(
            "created_on selectedBoards.length:",
            selectedBoards.length
          );
          res.send(selectedBoards);
          // res.json(selectedBoards);

          // });
        });
      } else {
        availableMessages.sort({ bumped_on: "descending" }).then((boards) => {
          // console.log("all threads sorted descending", boards);
          // select the top 10 boards with atleast 3 or more replies
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
                replies: newReplies.slice(0, 2),
              };
              return newBoard;
            });
          // console.log("selectedBoards", selectedBoards);
          console.log(
            "bumped_on selectedBoards.length:",
            selectedBoards.length
          );
          res.send(selectedBoards);
          // res.json(selectedBoards);
        });
      }
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */
      console.log("DELETE : /api/threads/:board");
      // console.log("req.body", req.body);
      // console.log("req.params", req.params);
      // const { thread_Id, delete_password } = querystring.parse(
      //   req.params.board
      // );
      let thread_Id;
      let delete_password;
      if (req.params.board === "fcc_test") {
        thread_Id = req.body.thread_Id;
        delete_password = req.body.delete_password;
      } else {
        const { boardId, passwordToDelete } = querystring.parse(
          req.params.board
        );
        delete_password = passwordToDelete;
        thread_Id = boardId;
      }
      // console.log("thread_Id", thread_Id, "delete_password", delete_password);

      // find board based on the id delete if it matches
      MessageBoard.findOneAndDelete({
        _id: thread_Id,
        delete_password: delete_password,
      })
        .then((results) => {
          // console.log("results:", results);
          if (results) {
            // res.send("success");
            res.send("success");
          } else {
            res.send("incorrect password");
            // res.json("incorrect password");
          }
        })
        .catch((error) => {
          console.log("error:", error);
        });
    })
    .put((req, res) => {
      /** Reporting a thread: PUT request to /api/threads/{board} */
      console.log("PUT : /api/threads/:board");
      console.log("req.body", req.body);
      const { thread_id } = req.body;
      console.log("thread_id", thread_id);

      MessageBoard.findOneAndUpdate(
        { _id: thread_id },
        { reported: true },
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
      // console.log(req.body);
      const { thread_Id, text, delete_password } = req.body;
      // console.log(thread_Id, text, delete_password);

      /**find board and create new reply */
      let date = new Date();
      MessageBoard.findOneAndUpdate(
        { _id: thread_Id },
        {
          $addToSet: {
            replies: {
              text: text,
              created_on: date,
              delete_password: delete_password,
              reported: false,
            },
          },
        },
        { upsert: true },
        (err, board) => {
          if (board) {
            // console.log("data:", data);
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
      // console.log("req.params", req.params);
      // console.log("req.query", req.query);
      let actualboardId;
      if (req.params.board === "fcc_test") {
        actualboardId = req.query.thread_Id;
      } else {
        const boardId = querystring.parse(req.params.board);
        // console.log("boardId", boardId);
        actualboardId = boardId.boardId;
      }
      // console.log("actualboardId", actualboardId);

      // iterate list of replies and find matching based on id
      MessageBoard.findOne({ boardId: actualboardId })
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
            replies: newReplies.slice(0, 2),
          };
          // console.log("newBoard", newBoard);
          res.send(newBoard);
          // res.json(newBoard);
        })
        .catch((error) => {
          console.log(
            "Not able to find replies to the supplied board id",
            error
          );
          // res.send({ error: error });
          res.json({ error: error });
        });
    })
    .delete(function (req, res) {
      /** Deleting a thread with the incorrect/correct password: DELETE request to
       * /api/threads/{board} with an invalid/valid  delete_password" */
      console.log("DELETE : /api/replies/:board");
      // console.log(req.body);
      // console.log(req.params);
      const { thread_id, replyId, delete_password } = querystring.parse(
        req.params.board
      );
      console.log(
        "thread_id:",
        thread_id,
        "replyId:",
        replyId,
        "delete_password:",
        delete_password
      );

      const filterReplies = (data, thread_id, delete_password) => {
        /** filter replies based on text and delete_password */
        data.map((reply) => {
          console.log("reply 1", reply);
          if (
            reply._id === thread_id &&
            reply.delete_password === delete_password
          ) {
            console.log("reply 2", reply);
            return reply;
          }
        });
      };

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
            "replies.$.text": "deleted",
          },
        },
        { returnDocument: after },
        // { returnNewDocument: true },
        (err, data) => {
          // console.log("data", data);
          if (data) {
            // res.json("incorrect password");
            res.send("success");
          } else {
            // console.log("error:", err);
            res.send("incorrect password");
            // res.json("success");
          }
        }
      );
    })
    .put((req, res) => {
      /** Reporting a reply: PUT request to /api/replies/{board} */

      console.log("PUT : /api/replies/:board");
      console.log("req.body", req.body);
      const { thread_id, reply_id } = req.body;
      console.log("thread_id", thread_id, "reply_id", reply_id);
      MessageBoard.findOneAndUpdate(
        {
          _id: thread_id,
          replies: { $elemMatch: { _id: reply_id } },
        },
        { $set: { "replies.$.reported": true } },
        { new: true, safe: true, upsert: true },
        (err, data) => {
          if (err) {
            console.log("error:", err);
          } else {
            // console.log("data", data);
            res.send("reported");
            // res.json("reported");
          }
        }
      );
    });
};
