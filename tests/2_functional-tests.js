const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const dayjs = require("dayjs");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Integration tests with chai-http", function () {
    var date = dayjs().format("YYYY-MM-DD");
    var thread1Id;
    var thread2Id;
    var thread1DeletePassword;
    var thread3Id;
    var thread4Id;
    var replyId;
    var replyIdDeletePassword;
    var thread4Board;

    // for (let i = 20; i < 30; i++) {
    //   test("SPECIAL: Creating a new thread: POST request to /api/threads/{board}", (done) => {
    //     // let i = 21;
    //     chai
    //       .request(server)
    //       .post("/api/threads/{board}")
    //       .send({
    //         board: `test${i}`,
    //         text: `Test Test ${i}`,
    //         delete_password: `123${i}`,
    //         return: "board",
    //       })
    //       .end(function (req, res) {
    //         console.log("Special: Test 1A response:", res.body);
    //         // assert.equal(res.status, "200");
    //         // assert.property(res.body, "board");
    //         // assert.property(res.body, "boardText");
    //         // assert.property(res.body, "passwordToDelete");
    //         console.log("Special: Test 1B response:", res.body._id);
    //         for (let j = 0; j < 3; j++) {
    //           chai
    //             .request(server)
    //             .post("/api/replies/{board}")
    //             .send({
    //               thread_id: res.body._id,
    //               text: `test 123${i}${j}`,
    //               delete_password: `123${i}${j}`,
    //               TodaysDate: date,
    //               return: "board",
    //             })
    //             .end(function (err, res) {
    //               assert.equal(res.status, "200");
    //               done();
    //             });
    //         }
    //       });
    //   });
    // }

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
          assert.equal(res.status, "200");

          done();
        });
    });

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
          // console.log("Test 2 response:", res.body[0]);
          // thread1Id = res.body[0]._id;
          // // console.log("thread1Id", thread1Id);
          // thread1DeletePassword = res.body[0].delete_password;
          // // console.log("thread1DeletePassword", thread1DeletePassword);
          thread2Id = res.body[2]._id;
          thread4Id = res.body[3]._id;
          thread4Board = res.body[3].board;

          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 10);
          assert.property(res.body[0], "board");
          assert.property(res.body[0], "text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "bumped_on");
          assert.equal(res.body[0].replies.length, 3);
          assert.property(res.body[0].replies[0], "text");
          assert.property(res.body[0].replies[0], "created_on");
          assert.property(res.body[0].replies[0], "_id");
          done();
        });
    });

    test("5. Reporting a thread: PUT request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .put("/api/threads/{board}")
        .send({ thread_id: thread4Id })
        .end((err, res) => {
          {
            // console.log("test 5 response", res.text);
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
          thread_id: thread4Id,
          text: "fordeletion fordeletion fordeletion",
          delete_password: "fordeletion",
          TodaysDate: date,
          return: "board",
        })
        .end(function (err, res) {
          // console.log("Test 6 response: ", res.body);
          thread3Id = res.body._id;
          console.log("thread_id:", thread3Id);
          thread3DeletePassword = res.body.delete_password;
          console.log("thread3DeletePassword", thread3DeletePassword);
          replyId = res.body.replies[0]._id;
          // console.log("replyId:", replyId);
          replyIdDeletePassword = res.body.replies[0].delete_password;
          // console.log("delete_password:", replyIdDeletePassword);
          assert.equal(res.status, "200");
          done();
        });
    });

    test("7. Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
      let idToQuery = new URLSearchParams({
        board: thread4Board,
        thread_id: thread4Id,
      });

      // console.log("idToQuery", idToQuery);
      chai
        .request(server)
        .get("/api/replies/" + idToQuery)
        .end((err, res) => {
          console.log("Test 7 response: ", res.body);
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          done();
        });
    });
    test("8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", (done) => {
      let idToQuery = new URLSearchParams({
        thread_id: thread3Id,
        replyId: replyId,
        delete_password: "wwww",
      });
      chai
        .request(server)
        .delete("/api/replies/" + idToQuery)
        .end((err, res) => {
          // console.log("Test 8 response: ", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
    test("9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", (done) => {
      let idToQuery = new URLSearchParams({
        thread_id: thread3Id,
        replyId: replyId,
        delete_password: replyIdDeletePassword,
      });
      //     // console.log("idToQuery", idToQuery);
      chai
        .request(server)
        .delete("/api/replies/" + idToQuery)
        .end((err, res) => {
          // console.log("Test 9B response: ", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });
    test("10. Reporting a reply: PUT request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .put("/api/replies/{board}")
        .send({
          thread_id: thread3Id,
          reply_id: replyId,
        })
        .end((err, res) => {
          {
            // console.log("Test 10 response: ", res.text);
            // assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          }
        });
    });
    test("3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
      let queryParameters = new URLSearchParams({
        thread_id: thread3Id,
        delete_password: "123X",
      });
      chai
        .request(server)
        // .delete("/api/threads/{board}" + queryParameters)
        .delete("/api/threads/" + queryParameters)
        .end((err, res) => {
          // console.log("test 3 response", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
    test("4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with an valid delete_password", (done) => {
      let queryParameters = new URLSearchParams({
        // boardId: res.body._id,
        thread_id: thread3Id,
        delete_password: thread3DeletePassword,
      });
      chai
        .request(server)
        .delete("/api/threads/" + queryParameters)
        .end((err, res) => {
          // console.log("test 4 response", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
      // });
    });
  });
});
