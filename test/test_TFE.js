var ECTSToken = artifacts.require("ECTSToken");
var UniversityPlatform = artifacts.require("UniversityPlatform");
var University = artifacts.require("University");
var Student = artifacts.require("Student");
var SubjectToken = artifacts.require("SubjectToken");

const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

contract("UniversityPlatform", function (accounts) {

  var ects;
  var platform;
  var university;
  var student;
  var subject;

  before(async () => {
    // runs before each test in this block
    student = await Student.deployed("Jose");
    await student.transferOwnership(accounts[2]);
    ects = await ECTSToken.deployed();
    platform = await UniversityPlatform.deployed(ects.address);
    await ects.transferOwnership(platform.address);
    subject = await SubjectToken.deployed("Asignatura test", "AT", 100, 2500000000, 1, "https://www.unir.net/");
    university = await University.deployed("UNIR", ects.address);
    await university.transferOwnership(accounts[1]);
    await subject.transferOwnership(university.address);

  });

  it("Test1: Despliegue ECTSToken correcto y sin totalSupply inicial", async () => {
    let total = await ects.totalSupply.call();
    assert.equal(total, 0, 'la cantidad desplegada inicialmente está mal');
  });

  it("Test2: Despliegue de la plataforma correcto", async () => {
    let addrss = await platform.getECTSTokenAddress();
    assert.equal(addrss, ects.address, 'El ECTSToken se asocia incorrectamente');
  });

  it("Test3: La plataforma puede leer la lista de universidades en el sistema vacia al principio", async () => {
    let lista = await platform.getUniversities();
    assert.isEmpty(lista, "No se devuelve nada");
  });

  it("Test4: Un usuario no registrado no puede leer la lista de universidades", async () => {
    let lista = await platform.getUniversities({ from: accounts[9] }).then((response) => {
      console.log(response);
    }, (error) => {
      assert(error.message.indexOf('revert') >= 0, "Solo propietario");
    });
  });

  it("Test5: Solo puede registrar una universidad desde la cuenta de la plataforma", async () => {
    let test = await platform.registerUniversity(accounts[1], university.address, { from: accounts[8] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo propietario");
      });
  });

  it("Test6: Se registrar una universidad correctamente desde la cuenta de la plataforma", async () => {
    let response = await platform.registerUniversity(accounts[1], university.address, { from: accounts[0] });
    truffleAssert.eventEmitted(response, "UniversityRegistred", (evento) => {
      return evento.account == accounts[1];
    }, 'No se emite bien el evento.')
  });

  it("Test7: Una universidad registrada puede leer la lista de universidades", async () => {
    let response = await platform.getUniversities({ from: accounts[1] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo usuarios registrados");
      });
  });

  it("Test8: Lista de estudiantes en el sistema vacia al principio", async () => {
    let response = await platform.getStudents();
    assert.isEmpty(response);
  });


  it("Test9: Solo puede registrar estudiantes desde la cuenta de la plataforma", async () => {
    let result = await platform.registerStudent(accounts[2], student.address, { from: accounts[8] })
      .then((response) => {
        console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo propietario");
      });
  });


  it("Test10: Se registra un estudiante desde la cuenta de la plataforma", async () => {
    let response = await platform.registerStudent(accounts[2], student.address, { from: accounts[0] });
    truffleAssert.eventEmitted(response, 'studentRegistred', (evento) => {
      return evento.account == accounts[2];
    }, 'No se emite bien el evento.')
  });


  it("Test11: Un estudiante registrado puede leer la lista de universidades", async () => {
    let result = await platform.getUniversities({ from: accounts[2] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo usuarios registrados");
      });
  });

  it("Test12: Una universidad registrada puede leer la lista de estudiantes", async () => {
    let response = platform.getStudents({ from: accounts[1] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo usuarios registrados");
      });
  });


  it("Test13: Conseguir el SC de una cuenta de universidad desde una universidad", async () => {
    let response = await platform.getUniversity(accounts[1], { from: accounts[1] });
    assert(response == university.address, "Solo usuarios registrados");
  });

  it("Test14: Un usuario no registrado no puede conseguir el SC de universidad", async () => {
    let response = await platform.getUniversity(accounts[1], { from: accounts[8] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo usuarios registrados");
      });
  });

  it("Test15: Conseguir el SC de una cuenta de universidad desde una estudiante", async () => {
    let response = await platform.getUniversity(accounts[1], { from: accounts[2] });
    assert(response == university.address, "Solo usuarios registrados");
  });

  it("Test16: Conseguir el SC de una cuenta de estudiante desde un estudiante", async () => {
    let response = await platform.getStudent(accounts[2], { from: accounts[2] });
    assert(response == student.address, "Solo usuarios registrados");
  });

  it("Test17: Conseguir el SC de una cuenta de estudiante desde una universidad", async () => {
    let response = await platform.getStudent(accounts[2], { from: accounts[1] });
    assert(response == student.address, "Solo usuarios registrados");
  });

  it("Test18: Se rechaza conseguir el SC de una cuenta de estudiante desde una cuenta no registrada", async () => {
    let response = await platform.getStudent(accounts[2], { from: accounts[8] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo usuarios registrados");
      });
  });

  it("Test19: Sube el precio de venta de los ECTS", async () => {
    let value = 1e18.toString();
    let response = await platform.setTokenPrice(value, { from: accounts[0] });
    truffleAssert.eventEmitted(response, "NewPrice", (evento) => {
      return evento.tokenpricewei > 0;
    }, 'No se emite bien el evento.');
  });

  it("Test20: Sube el precio de recompra de los ECTS", async () => {
    let value = 5e17.toString();
    let response = await platform.setTokenPriceForRefund(value, { from: accounts[0] })
    truffleAssert.eventEmitted(response, "NewPriceForRefund", (evento) => {
      return evento.tokenpriceweiforrefund > 0;
    }, 'No se emite bien el evento.');
  });

  it("Test21: Solo la plataforma puede subir el precio de venta de los ECTS", async () => {
    let value = 1e18.toString();
    let response = await platform.setTokenPrice(value, { from: accounts[1] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo propietario");
      });
  });

  it("Test22: Solo la plataforma puede subir el precio de recompra de los ECTS", async () => {
    let value = 1e18.toString();
    let response = await platform.setTokenPriceForRefund(value, { from: accounts[1] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo propietario");
      });
  });

  it("Test23: Un estudiante no puede comprar con más Eter del que tiene", async () => {
    let _wei = 152e18.toString();
    let response = await platform.buyTokens(accounts[2], { gas: 300000, value: _wei, from: accounts[2] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo propietario");
      });
  });

  it("Test24: Un estudiante compra con su Ether los ECTS", async () => {
    let _wei = 76e18.toString();
    let ectsantes = await ects.balanceOf(accounts[2]);
    let response = await platform.buyTokens(accounts[2], { gas: 300000, value: _wei, from: accounts[2] });
    truffleAssert.eventEmitted(response, "BuyTokens", (evento) => {
      return evento.amount = 76;
    }, 'No se emite bien el evento BuyTokens.');
    let ectsdespues = await ects.balanceOf(accounts[2]);
    console.log("El estudiante ahora tiene en ECTS: " + ectsdespues.toNumber());
    assert.isAtLeast(ectsdespues.toNumber(), ectsantes.toNumber(), "No han incrementado los ects");
  });

  it("Test25: Solo la universidad puede publicar sus asignaturas", async () => {
    let subjectname = await subject.name();
    let addrss = await university.addSubject(subjectname, subject.address, { gas: 3000000, from: accounts[3] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo el owner");
      });
  });

  it("Test26: La universidad publica la asignatura", async () => {
    let subjectname = await subject.name();
    let addrss = await university.addSubject(subjectname, subject.address, { from: accounts[1] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo propietario");
      });
  });

  it("Test27: El estudiante genera un deposito de 10 ECTS en la universidad", async () => {
    let studentname = await student.name();
    let result = await ects.approve(university.address, 10)
      .then((result) => {
        //console.log(result);
      }, (error) => {
        assert(error, "Error al aprovar ECTS");
      });
    let numects = 10;
    let response = await student.addDeposit(studentname, university.address, numects, {from: accounts[2]})
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
        assert(!error, "Error al añadir deposito");
      });
  });

  it("Test28: El estudiante verifica que la universidad se ha añadido a las universidades con deposito", async () => {
    let lista = await student.getUniversitiesWithDeposit({ from: accounts[2] });
    console.log(lista);
    assert.isEmpty(lista, "No esta la universidad registrada");
  });

  it("Test29: Se comprueba que la lista de universidades donde se tiene deposito solo la puede leer el estudiante", async () => {
    let lista = await student.getUniversitiesWithDeposit({ from: accounts[1] })
      .then((response) => {
        //console.log(response);
      }, (error) => {
        assert(error, "Solo propietario");
      });
  });

  it("Test30: Se comprueba que la universidad tiene depositados los 10 ECTS", async () => {
    let response = await student.getDepositInUniversity(accounts[1], { from: accounts[2] });
    console.log(response);
    assert.equal(response, 10, "No se han transferido correctamente los 10 ECTS");
  });




});
