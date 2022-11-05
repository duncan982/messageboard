const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const dayjs = require("dayjs");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Integration tests with chai-http", function () {
    const filterReplies = (reply) => {
      /** filter replies based on text and delete_password */
      if (
        reply.text === "fordeletion fordeletion fordeletion" &&
        reply.delete_password === "fordeletion"
      ) {
        // console.log("reply", reply);
        return reply;
      }
    };

    // // a list to collect boardIDs and texts
    // let boardIDsAndTexts = [];
    // // function to collect boardIDs and texts
    // async function collectBoardIDsAndTexts(response) {
    //   let boardIdAndText = await response;
    //   return {
    //     boardID: boardIdAndText._id,
    //     boardText: boardIdAndText.boardText,
    //   };
    // }
    // for (let i = 0; i < 20; i++) {
    //   test("SPECIAL: Creating a new thread: POST request to /api/threads/{board}", (done) => {
    //     // let i = 21;
    //     chai
    //       .request(server)
    //       .post("/api/threads/{board}")
    //       .send({
    //         board: `test${i}`,
    //         text: `Test Test ${i}`,
    //         delete_password: `123${i}`,
    //       })
    //       .end(function (req, res) {
    //         // console.log("Test 1 response:", res.body);
    //         // // collect boardIDs and texts
    //         // let boardIdAndText = collectBoardIDsAndTexts(res.body);
    //         // boardIDsAndTexts.push(boardIdAndText);
    //         assert.equal(res.status, "200");
    //         // assert.property(res.body, "board");
    //         // assert.property(res.body, "boardText");
    //         // assert.property(res.body, "passwordToDelete");
    //         done();
    //       });
    //   });
    // }
    // console.log("boardIDsAndTexts", boardIDsAndTexts);
    test("1. Creating a new thread: POST request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .post("/api/threads/{board}")
        .send({
          board: "test9",
          text: "Test Test 9",
          delete_password: "1239",
        })
        .end(function (req, res) {
          // console.log("Test 1 response:", res.body);
          // assert.equal(res.status, "200");
          // assert.property(res.body, "board");
          assert.property(res.body, "text");
          assert.property(res.body, "delete_password");
          done();
        });
    });
    // test("SPECIAL. Create replies to threads: POST request to /api/replies/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/replies/{board}")
    //     .send({})
    //     .end(function (err, res) {
    //       // console.log("Test A response: ", res.body);
    //       assert.equal(res.status, "200");
    //       done();
    //     });
    // });
    test("2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
      let recentThreadsQuery = new URLSearchParams({
        // sort: "created_on",
        created_on: "descending",
      });
      chai
        .request(server)
        .get("/api/threads/" + recentThreadsQuery)
        .end(function (err, res) {
          // console.log("Test 2 response:", res.body);
          // assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
    test("3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
      let queryParameters = new URLSearchParams({
        thread_id: "6354daab9ae6cca4aafe0e9a",
        delete_password: "123X",
      });
      chai
        .request(server)
        // .delete("/api/threads/{board}" + queryParameters)
        .delete("/api/threads/" + queryParameters)
        .end((err, res) => {
          console.log("test 3 response", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
    test("4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with an valid delete_password", (done) => {
      chai
        .request(server)
        .post("/api/threads/{board}")
        .send({
          board: "test for deletion",
          text: "test for deletion test for deletion",
          delete_password: "fordeletion",
        })
        .end(function (req, res) {
          // console.log("Test 4 response:", res.body);
          // console.log("res.body._id", res.body._id);
          // console.log("res.body.delete_password", res.body.delete_password);
          assert.equal(res.status, "200");
          let queryParameters = new URLSearchParams({
            boardId: res.body._id,
            passwordToDelete: res.body.delete_password,
          });
          chai
            .request(server)
            .delete("/api/threads/" + queryParameters)
            .end((err, res) => {
              console.log("test 4 response", res.text);
              assert.equal(res.status, 200);
              assert.equal(res.text, "success");
              done();
            });
        });
    });
    test("5. Reporting a thread: PUT request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .put("/api/threads/{board}")
        .send({ thread_id: "6354db709ae6cca4aafe0ec8" })
        .end((err, res) => {
          {
            console.log("test 5 response", res.text);
            // assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          }
        });
    });
    test("6. Create replies to threads: POST request to /api/replies/{board}", (done) => {
      let date = dayjs().format("YYYY-MM-DD");
      // console.log("TodaysDate1:", date);
      chai
        .request(server)
        .post("/api/replies/{board}")
        .send({
          thread_id: "635507705dbbd73d7dee54a5",
          text: "fordeletion fordeletion fordeletion",
          delete_password: "fordeletion",
          TodaysDate: date,
        })
        .end(function (err, res) {
          let replyText = res.body.replies.filter(filterReplies)[0].text;
          let replyDeletePassword =
            res.body.replies.filter(filterReplies)[0].delete_password;
          // console.log("Test 6 response: ", res.body.bumped_on);
          let bumpedOnDateFormated = dayjs(res.body.bumped_on).format(
            "YYYY-MM-DD"
          );
          // console.log("bumpedOnDateFormated", bumpedOnDateFormated);
          assert.equal(res.status, "200");
          assert.equal(bumpedOnDateFormated, date);
          assert.equal(replyText, "fordeletion fordeletion fordeletion");
          assert.equal(replyDeletePassword, "fordeletion");
          done();
        });
    });
    test("7. Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
      let idToQuery = new URLSearchParams({
        board: "board",
        thread_id: "6354dbb59ae6cca4aafe0f16",
      });
      chai
        .request(server)
        // .get("/api/replies/" + idToQuery)
        .get("/api/replies/" + idToQuery)
        // .send({ boradId: "634e3f575871976c459cdf4e" })
        .end((err, res) => {
          // console.log("Test 7 response: ", res.body);
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          done();
        });
    });
    test("8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", (done) => {
      let idToQuery = new URLSearchParams({
        thread_id: "6354fd400d57bf115780b62f",
        replyId: "63554e024115a822253ace97",
        delete_password: "1238",
      });
      chai
        .request(server)
        .delete("/api/replies/" + idToQuery)
        .end((err, res) => {
          console.log("Test 8 response: ", res.text);
          // assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
    test("9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", (done) => {
      let date = dayjs().format("YYYY-MM-DD");
      chai
        .request(server)
        .post("/api/replies/{board}")
        .send({
          thread_id: "635507705dbbd73d7dee54a5",
          text: "fordeletion fordeletion fordeletion",
          delete_password: "fordeletion",
          TodaysDate: date,
        })
        .end(function (err, res) {
          // console.log("Test 9A response: ", res.body);
          assert.equal(res.status, "200");

          let idToQuery = new URLSearchParams({
            thread_id: res.body._id,
            replyId: res.body.replies.filter(filterReplies)[0]._id,
            delete_password:
              res.body.replies.filter(filterReplies)[0].delete_password,
          });
          console.log("idToQuery", idToQuery);
          chai
            .request(server)
            .delete("/api/replies/" + idToQuery)
            .end((err, res) => {
              console.log("Test 9B response: ", res.text);
              // assert.equal(res.status, 200);
              assert.equal(res.text, "success");
              done();
            });
        });
    });
    test("10. Reporting a reply: PUT request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .put("/api/replies/{board}")
        .send({
          thread_id: "635d1cabe4de8ae158565e64",
          reply_id: "635e0ff5493a8e18ad9ca943",
        })
        .end((err, res) => {
          {
            console.log("Test 10 response: ", res.text);
            // assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          }
        });
    });
  });
});
