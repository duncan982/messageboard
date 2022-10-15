const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Integration tests with chai-http", function () {
    // test("1. Creating a new thread: POST request to /api/threads/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/threads/{board}")
    //     .send({
    //       board: "test",
    //       boardText: "Test Test",
    //       passwordToDelete: "123",
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

    test("A. Create replies to threads: POST request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .post("/api/replies/{board}")
        .send({
          threadId: "634a4de84e5b9541698ac7f2",
          threadText: "Test Test",
          repliesToThreadText: "Thats good!",
          passwordToDelete: "123",
        })
        .end(function (err, res) {
          console.log("Test A response: ", res.body);
          assert.equal(res.status, "200");
          done();
        });
    });

    // test("2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
    //   chai
    //     .request(server)
    //     .get("/api/threads/{board}")
    //     .send({ recentThreads: 10, replies: 3 })
    //     .end(function (res, err) {
    //       console.log("Test 2 response:", res.body);
    //       done();
    //     });
    // });
  });
});
