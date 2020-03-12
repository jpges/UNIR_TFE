var ECTSToken = artifacts.require("ECTSToken");

contract("ECTSToken", function(accounts) {
  it("should assert true", function(done) {
    var e_c_t_s_token = ECTSToken.deployed();
    assert.isTrue(true);
    done();
  });
});
