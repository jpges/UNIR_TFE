var SubjectToken = artifacts.require("SubjectToken");

contract("SubjectToken", function(accounts) {
  it("should assert true", function(done) {
    var subject_token = SubjectToken.deployed();
    assert.isTrue(true);
    done();
  });
});
