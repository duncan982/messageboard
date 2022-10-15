const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Integration tests with chai-http", function () {
    test("1. Creating a new thread: POST request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .post("/api/threads/{board}")
        .send({
          board: "test",
          boardText: "Test Test",
          passwordToDelete: "123",
        })
        .end(function (req, res) {
          console.log("Test 1 response:", res.body);
          assert.equal(res.status, "200");
          assert.property(res.body, "board");
          assert.property(res.body, "boardText");
          assert.property(res.body, "passwordToDelete");
          done();
        });
    });
  });
});
