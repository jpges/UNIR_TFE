var University = artifacts.require("University");

contract("University", function(accounts) {
  it("should assert true", function(done) {
    var university = University.deployed();
    assert.isTrue(true);
    done();
  });
});
