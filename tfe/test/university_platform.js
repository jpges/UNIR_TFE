var UniversityPlatform = artifacts.require("UniversityPlatform");

contract("UniversityPlatform", function(accounts) {
  it("should assert true", function(done) {
    var university_platform = UniversityPlatform.deployed();
    assert.isTrue(true);
    done();
  });
});
