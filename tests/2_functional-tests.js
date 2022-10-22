const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Integration tests with chai-http", function () {
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
    // test("1. Creating a new thread: POST request to /api/threads/{board}", (done) => {
    //   let i = 21;
    //   chai
    //     .request(server)
    //     .post("/api/threads/{board}")
    //     .send({
    //       board: `test${i}`,
    //       boardText: `Test Test ${i}`,
    //       passwordToDelete: `123${i}`,
    //     })
    //     .end(function (req, res) {
    //       // console.log("Test 1 response:", res.body);
    //       // // collect boardIDs and texts
    //       // let boardIdAndText = collectBoardIDsAndTexts(res.body);
    //       // boardIDsAndTexts.push(boardIdAndText);
    //       assert.equal(res.status, "200");
    //       // assert.property(res.body, "board");
    //       // assert.property(res.body, "boardText");
    //       // assert.property(res.body, "passwordToDelete");
    //       done();
    //     });
    // });
    // }
    // console.log("boardIDsAndTexts", boardIDsAndTexts);
    // test("1. Creating a new thread: POST request to /api/threads/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/threads/{board}")
    //     .send({
    //       board: "test9",
    //       boardText: "Test Test 9",
    //       passwordToDelete: "1239",
    //     })
    //     .end(function (req, res) {
    //       // console.log("Test 1 response:", res.body);
    //       assert.equal(res.status, "200");
    //       // assert.property(res.body, "board");
    //       // assert.property(res.body, "boardText");
    //       // assert.property(res.body, "passwordToDelete");
    //       done();
    //     });
    // });
    // test("SPECIAL. Create replies to threads: POST request to /api/replies/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/replies/{board}")
    //     .send({})
    //     .end(function (err, res) {
    //       console.log("Test A response: ", res.body);
    //       assert.equal(res.status, "200");
    //       done();
    //     });
    // });
    // test("2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .get("/api/threads/{board}")
    //     // .send({ recentThreads: 10, replies: 3 })
    //     .end(function (res, err) {
    //       // console.log("Test 2 response:", res);
    //       console.log("Test 2 response:", res.body);
    //       assert.equal(res.status, 200);
    //       done();
    //     });
    // });
    // test("3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
    //   let queryParameters = new URLSearchParams({
    //     boardId: "634e3f565871976c459cdf4a",
    //     passwordToDelete: "123X",
    //   });
    //   chai
    //     .request(server)
    //     // .delete("/api/threads/{board}" + queryParameters)
    //     .delete("/api/threads/" + queryParameters)
    //     .end((err, res) => {
    //       console.log("test 3 response", res.body);
    //       assert.equal(res.status, 200);
    //       assert.deepInclude(res.body.board, { deletedCount: 0 });
    //       done();
    //     });
    // });
    // test("4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", (done) => {
    //   let queryParameters = new URLSearchParams({
    //     boardId: "634e3f565871976c459cdf4a",
    //     passwordToDelete: "1231",
    //   });
    //   chai
    //     .request(server)
    //     // .delete("/api/threads/{board}" + queryParameters)
    //     .delete("/api/threads/" + queryParameters)
    //     .end((err, res) => {
    //       console.log("test 4 response", res.body);
    //       assert.equal(res.status, 200);
    //       assert.deepInclude(res.body.board, { deletedCount: 1 });
    //       done();
    //     });
    // });
    // });

    // test("5. Reporting a thread: PUT request to /api/threads/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .put("/api/threads/{board}")
    //     .send({ board: "test", idToReport: "634e3f565871976c459cdf4a" })
    //     .end((err, res) => {
    //       {
    //         // assert.equal(res.status, 200);
    //         assert.deepInclude(res.body, { response: "reported" });
    //         done();
    //       }
    //     });

    // test("6. Create replies to threads: POST request to /api/replies/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/replies/{board}")
    //     .send({
    //       boardId: "634e3f575871976c459cdf4e",
    //       boardText: "Test Test 2",
    //       replyToBoardText: "Thats good! xyz",
    //       passwordToDelete: "1232",
    //     })
    //     .end(function (err, res) {
    //       console.log("Test 6 response: ", res.body);
    //       assert.equal(res.status, "200");
    //       assert.property(res.body, " replyToBoardText");
    //       done();
    //     });
    // });

    test("7. Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
      let idToQuery = new URLSearchParams({
        boardId: "634e3f565871976c459cdf46",
      });
      chai
        .request(server)
        .get("/api/replies/" + idToQuery)
        // .send({ boradId: "634e3f575871976c459cdf4e" })
        .end((err, res) => {
          // console.log("Test 7 response: ", res.body);
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  });
});
