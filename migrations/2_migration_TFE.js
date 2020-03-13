const UniversityPlatform = artifacts.require("UniversityPlatform");
const ECTSToken = artifacts.require("ECTSToken");
const SubjectToken = artifacts.require("SubjectToken");
const Student = artifacts.require("Student");
const University = artifacts.require("University");

module.exports = function(deployer) {

  //SubjectToken
  const nameSubjectToken = "Asignatura test";
  const symbolSubjectToken = "AT";
  const limitmintSubjectToken = 100;
  const expirationtimeSubjectToken = 2500000000;
  const priceSubjectToken = 3;
  const descriptionURISubjectToken = "https://www.unir.net/";
  deployer.deploy(SubjectToken, nameSubjectToken, symbolSubjectToken, limitmintSubjectToken,
     expirationtimeSubjectToken, priceSubjectToken, descriptionURISubjectToken);

  //Student
  const studentname = "Jose";
  deployer.deploy(Student, studentname);

  //ECTSToken
  deployer.deploy(ECTSToken).then(async () => {

    //UniversityPlatform
    await deployer.deploy(UniversityPlatform, ECTSToken.address);
   
    //University
    const universityname = "UNIR";
    await deployer.deploy(University, universityname, ECTSToken.address);

  });
}

