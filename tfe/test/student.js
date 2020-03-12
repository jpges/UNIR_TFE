var Student = artifacts.require("Student");

contract("Student", function(accounts) {
  it("should assert true", function(done) {
    var student = Student.deployed();
    assert.isTrue(true);
    done();
  });
});
