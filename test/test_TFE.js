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

  it("Test4: Solo puede registrar una universidad desde la cuenta de la plataforma", async () => {
    let test = await platform.registerUniversity(accounts[1], university.address, { from: accounts[8] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo propietario');
      }, (error) => {
        assert(error.message.indexOf('revert Ownable') > 0, "Solo propietario");
      });
  });

  it("Test5: Se registra una universidad correctamente desde la cuenta de la plataforma", async () => {
    let response = await platform.registerUniversity(accounts[1], university.address, { from: accounts[0] });
    truffleAssert.eventEmitted(response, "UniversityRegistred", (evento) => {
      return evento.account == accounts[1];
    }, 'No se emite bien el evento.');
    console.log("Ya tenemos 1 universidad registrada en la plataforma");
  });

  it("Test6: Un usuario no registrado no puede leer la lista de universidades", async () => {
    let response = await platform.getUniversities({ from: accounts[8] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo usuarios registrados');
      }, (error) => {
        assert(error.message.indexOf('revert RegistredUser') > 0, "Solo usuarios registrados");
      });
  });

  it("Test7: Una universidad registrada puede leer la lista de universidades", async () => {
    let response = await platform.getUniversities({ from: accounts[1] });
    assert.isNotEmpty(response, "No recibe la lista");
  });

  it("Test8: Lista de estudiantes en el sistema vacia al principio", async () => {
    let response = await platform.getStudents();
    assert.isEmpty(response, "La lista de estudiantes no está vacia");
  });


  it("Test9: Solo puede registrar estudiantes la cuenta de la plataforma", async () => {
    let result = await platform.registerStudent(accounts[2], student.address, { from: accounts[8] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo propietario');
      }, (error) => {
        assert(error.message.indexOf('revert Ownable') > 0, "Solo propietario");
      });
  });


  it("Test10: Se registra un estudiante desde la cuenta de la plataforma", async () => {
    let response = await platform.registerStudent(accounts[2], student.address, { from: accounts[0] });
    truffleAssert.eventEmitted(response, 'studentRegistred', (evento) => {
      return evento.account == accounts[2];
    }, 'No se emite bien el evento.');
    console.log("Ya tenemos 1 estudiante registrado en la plataforma");
  });


  it("Test11: Un estudiante registrado puede leer la lista de universidades", async () => {
    let result = await platform.getUniversities({ from: accounts[2] });
    assert.isNotEmpty(result, "No recibe la lista");
  });

  it("Test12: Una universidad registrada puede leer la lista de estudiantes", async () => {
    let response = await platform.getStudents({ from: accounts[1] });
    assert.isNotEmpty(response, "No recibe la lista");
  });


  it("Test13: Conseguir el SC de una cuenta de universidad desde una universidad", async () => {
    let response = await platform.getUniversity(accounts[1], { from: accounts[1] });
    assert(response == university.address, "Solo usuarios registrados");
  });

  it("Test14: Un usuario no registrado no puede conseguir el SC de una universidad", async () => {
    let response = await platform.getUniversity(accounts[1], { from: accounts[8] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo usuarios registrados');
      }, (error) => {
        assert(error.message.indexOf('revert RegistredUser') > 0, "Solo usuarios registrados");
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
        console.log(response);
        assert(false, 'Solo usuarios registrados');
      }, (error) => {
        assert(error.message.indexOf('revert RegistredUser') > 0, "Solo usuarios registrados");
      });
  });

  it("Test19: Sube el precio de venta de los ECTS", async () => {
    let value = 1e18.toString();
    let response = await platform.setTokenPrice(value, { from: accounts[0] });
    truffleAssert.eventEmitted(response, "NewPrice", (evento) => {
      return evento.tokenpricewei > 0;
    }, 'No se emite bien el evento.');
    console.log("El nuevo precio de venta al estudiante de los ECTS queda en: " + value);
  });

  it("Test20: Sube el precio de recompra de los ECTS", async () => {
    let value = 5e17.toString();
    let response = await platform.setTokenPriceForRefund(value, { from: accounts[0] })
    truffleAssert.eventEmitted(response, "NewPriceForRefund", (evento) => {
      return evento.tokenpriceweiforrefund > 0;
    }, 'No se emite bien el evento.');
    console.log("El nuevo precio de recompra a las universidades de los ECTS queda en: " + value);
  });

  it("Test21: Solo la plataforma puede subir el precio de venta de los ECTS", async () => {
    let value = 1e18.toString();
    let response = await platform.setTokenPrice(value, { from: accounts[1] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo propietario');
      }, (error) => {
        assert(error.message.indexOf('revert Ownable') > 0, "Solo propietario");
      });
  });

  it("Test22: Solo la plataforma puede subir el precio de recompra de los ECTS", async () => {
    let value = 1e18.toString();
    let response = await platform.setTokenPriceForRefund(value, { from: accounts[1] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo propietario');
      }, (error) => {
        assert(error.message.indexOf('revert Ownable') > 0, "Solo propietario");
      });
  });

  it("Test23: Un estudiante no puede comprar con más Eter del que tiene", async () => {
    let _wei = web3.utils.toWei('10000000', 'ether');
    let response = await platform.buyTokens(accounts[2], { gas: 300000, value: _wei, from: accounts[2] })
      .then((response) => {
        console.log(response);
        assert(false, 'Comprobar si es que tiene más de este wei para poder comprarlo: ' + _wei);
      }, (error) => {
        //console.log(error);
        assert(error.message.indexOf('enough funds') > 0, 'Comprobar si es que tiene más de este wei para poder comprarlo: ' + _wei);
      });
  });

  it("Test24: Un estudiante compra con su Ether los ECTS", async () => {
    let _wei = web3.utils.toWei('5', 'ether');
    //El ultimo precio que hemos registrado era 1 ECTS = 1 ether

    let ectsantes = await ects.balanceOf(accounts[2]); //Esto son los ECTS antes
    let response = await platform.buyTokens(accounts[2], { gas: 300000, value: _wei, from: accounts[2] });
    truffleAssert.eventEmitted(response, "BuyTokens", (evento) => {
      return evento.amount = 76;
    }, 'No se emite bien el evento BuyTokens.');
    let ectsdespues = await ects.balanceOf(accounts[2]); //Estos son los ECTS despues
    console.log("El estudiante ahora tiene en ECTS: " + ectsdespues.toNumber());
    assert.equal(ectsdespues.toNumber(), 5, "Debería tener los 5 que acaba de comprar");
    assert.isAtLeast(ectsdespues.toNumber(), ectsantes.toNumber(), "No han incrementado los ects");
  });

  it("Test25: Solo la universidad puede publicar sus asignaturas", async () => {
    let subjectname = await subject.name();
    let addrss = await university.addSubject(subjectname, subject.address, { gas: 3000000, from: accounts[3] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo propietario');
      }, (error) => {
        assert(error.message.indexOf('revert Ownable') > 0, "Solo propietario");
      });
  });

  it("Test26: La universidad publica la asignatura", async () => {
    let subjectname = await subject.name();
    let response = await university.addSubject(subjectname, subject.address, { from: accounts[1] });
    truffleAssert.eventEmitted(response, "PublishNewSubject", (evento) => {
      return evento.amount = 76;
    }, 'No se ha recibido el evento PublishNewSubject');
    console.log("Ya tenemos 1 asignatura publicada");
  });

  it("Test27: El estudiante genera un deposito de 5 ECTS en la universidad", async () => {
    let cantidadECTS = 5 * 1;
    let studentname = await student.name();
    let result = await ects.approve(university.address, cantidadECTS, { from: accounts[2] });
    truffleAssert.eventEmitted(result, "Approval", (evento) => {
      return evento.amount = 76;
    }, 'No se ha recibido el evento Approval');

    let response = await student.addDeposit(studentname, university.address, cantidadECTS, { from: accounts[2] });
    truffleAssert.eventEmitted(response, "StudentDepositRegistred", (evento) => {
      return evento.amount = 76;
    }, 'No se ha recibido el evento StudentDepositRegistred');
  });

  it("Test28: El estudiante verifica que la universidad se ha añadido a las universidades con deposito", async () => {
    let lista = await student.getUniversitiesWithDeposit({ from: accounts[2] });
    assert(lista[0] == university.address, "No esta la universidad registrada");
  });

  it("Test29: Se comprueba que la lista de universidades donde se tiene deposito solo la puede leer el estudiante", async () => {
    let lista = await student.getUniversitiesWithDeposit({ from: accounts[1] })
      .then((response) => {
        console.log(response);
        assert(false, 'Solo propietario');
      }, (error) => {
        assert(error.message.indexOf('revert Ownable') > 0, "Solo propietario");
      });
  });

  it("Test30: Se comprueba que la universidad tiene depositados los 5 ECTS del Test27", async () => {
    let cantidadECTS = 5 * 1;
    let response = await student.getDepositInUniversity(university.address, { from: accounts[2] });
    assert.equal(response, cantidadECTS, "No se han transferido correctamente los 10 ECTS");
  });

  it("Test31: Matricularse en la asignatura publicada por la universidad", async () => {
    let tokenId;
    let response = await university.enrollInSubject(subject.address, { from: accounts[2] });
    truffleAssert.eventEmitted(response, "EnrolledInSubject", (evento) => {
      tokenId = evento.tokenId;
      return evento.subject = subject.address;
    }, 'No se ha recibido el evento EnrolledInSubject');

    let result = await student.recordEnrollInSubject(university.address, subject.address, tokenId, { from: accounts[2] });
    truffleAssert.eventEmitted(result, "StudentEnrollInSubject", (evento) => {
      tokenId = evento.tokenId;
      return evento.subject = subject.address;
    }, 'No se ha recibido el evento StudentEnrollInSubject');
  });

  it("Test32: El estudiante verifica que está matriculado en la asignatura", async () => {
    let lista = await student.getSubjectsInWitchEnrolled({ from: accounts[2] });
    assert(lista[0] == subject.address, "No esta matriculado en esta asignatura");
  });

  it("Test33: El estudiante obtiene el tokenID de su matrícula", async () => {
    let tokenId = await student.getEnrollementTokenId(subject.address, { from: accounts[2] });
    assert.equal(tokenId, 1, "No tiene el tokenId 1");
  });

  it("Test34: La universidad recupera la lista de matriculados en una asignatura", async () => {
    let numeromatriculados = await subject.lastTokenIndex();
    let lista = new Array();
    for (let i = 1; i <= numeromatriculados; i++) {
      lista.push(await subject.ownerOf(i));
    }
    assert.isNotEmpty(lista, "No se ha recuperado ningun alumno");
  });

  it("Test35: La universidad aprueba la asignatura al estudiante", async () => {
    let response = await university.setSubjectApproved(subject.address, 1, {from: accounts[1]});
    truffleAssert.eventEmitted(response, "SubjectApproved", (evento) => {
      return evento.subject == subject.address;
    }, 'No se ha recibido el evento SubjectApproved');
  console.log("El estudiante ha aprobado la asignatura")
  });

  it("Test36: El estudiante comprueba que tiene la asignatura aprobada", async () => {
    //Del Test33 sabemos que el tokenId del estudiante es el 1
    let response = await subject.isSubjectApproved(1, {from: accounts[2]});
    assert(response, "La asignatura no está aprobada");
  });

  it("Test37: La universidada comprueba que la asignatura aprobada", async () => {
    //Del Test33 sabemos que el tokenId del estudiante es el 1
    let response = await subject.isSubjectApproved(1, {from: accounts[1]});
    assert(response, "La asignatura no está aprobada");
  });

  it("Test38: La universidad reclama la compensación en ether de sus ECTS", async () => {
    let strCantidadECTS = await ects.balanceOf(accounts[1]); 
    let cantidadECTS = strCantidadECTS.toNumber(); //Número de ECTS que tiene la universidad
    assert.isAbove(cantidadECTS, 0, "La universidad no tiene ECTS para reembolsar");

    let result = await ects.approve(platform.address, cantidadECTS, { from: accounts[1] });
    truffleAssert.eventEmitted(result, "Approval", (evento) => {
      return evento.amount = 3;
    }, 'No se ha recibido el evento Approval');

    let response = await platform.refundECTS(accounts[1], cantidadECTS, { from: accounts[1] });
    truffleAssert.eventEmitted(response, "RefuntECTS", (evento) => {
      return evento.amount = 3;
    }, 'No se ha recibido el evento RefuntECTS');

    let strCantidadECTSAfter = await ects.balanceOf(accounts[1]); 
    let cantidadECTSAfter = strCantidadECTSAfter.toNumber();
    assert.equal(cantidadECTSAfter, 0, "No le han quitado el ECTS a la universidad");
    
  });

});
