var ECTSToken = artifacts.require("ECTSToken");
var UniversityPlatform = artifacts.require("UniversityPlatform");
var University = artifacts.require("University");
var Student = artifacts.require("Student");

const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

contract("UniversityPlatform", function (accounts) {

  it("Test1: Despliegue ECTSToken correcto y sin totalSupply inicial", function () {
    return ECTSToken.deployed().then(function (instance) {
      var ects = instance;
      return ects.totalSupply.call();
    }).then(function (result) {
      assert.equal(result.toNumber(), 0, 'la cantidad desplegada inicialmente está mal');
    })
  });

  it("Test2: Despliegue de la plataforma correcto", function () {
    return ECTSToken.deployed().then(instance => {
      let ects = instance.address;
      return UniversityPlatform.deployed(ects).then(v => {
        return v.getECTSTokenAddress();
      }).then(n => {
        assert.equal(n, ects, 'El ECTSToken se asocia incorrectamente');
      })
    });
  });

  it("Test3: La plataforma puede leer la lista de universidades en el sistema vacia al principio", () => {
    return ECTSToken.deployed().then(instance => {
      let ects = instance.address;
      return UniversityPlatform.deployed(ects).then(v => {
        return v.getUniversities({ from: accounts[0] }).then(n => {
          assert.isEmpty(n, "Se han devuelto cosas");
        });
      });
    });
  });

  it("Test4: Un usuario no registrado no puede leer la lista de universidades", () => {
    return ECTSToken.deployed().then(instance => {
      let ects = instance.address;
      return UniversityPlatform.deployed(ects).then(v => {
        return v.getUniversities({ from: accounts[8] });
      }).then((response) => {
        console.log(response);
      }, (error) => {
        assert(error.message.indexOf('revert') >= 0, "Solo propietario");
      });
    });
  });

  it("Test5: Solo puede registrar una universidad desde la cuenta de la plataforma", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", ects.address, { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[8] })
            .then((response) => {
              console.log(response);
            }, (error) => {
              assert(error.message.indexOf('revert') >= 0, "Solo propietario");
            });
        });
      });
    });
  });

  it("Test6: Se registrar una universidad correctamente desde la cuenta de la plataforma", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", ects.address, { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[0] })
            .then((response) => {
              truffleAssert.eventEmitted(response, "UniversityRegistred", (evento) => {
                return evento.account == accounts[1];
              }, 'No se emite bien el evento.')
            });
        });
      });
    });
  });

  it("Test7: Una universidad registrada puede leer la lista de universidades", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", ects.address, { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[0] })
            .then(v => {
              return platform.getUniversities({ from: accounts[1] });
            }).then((response) => {
              //console.log(response);
            }, (error) => {
              assert(error.message.indexOf('revert') >= 0, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test8: Lista de estudiantes en el sistema vacia al principio", () => {
    return ECTSToken.deployed().then(instance => {
      let ects = instance.address;
      return UniversityPlatform.deployed(ects).then(v => {
        return v.getStudents();
      }).then(n => {
        assert.isEmpty(n);
      })
    });
  });

  it("Test9: Solo puede registrar estudiantes desde la cuenta de la plataforma", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return Student.deployed("Jose", { from: accounts[2] }).then(student => {
          return platform.registerStudent(accounts[2], student.address, { from: accounts[8] })
            .then((response) => {
              console.log(response);
            }, (error) => {
              assert(error.message.indexOf('revert') >= 0, "Solo propietario");
            });
        });
      });
    });
  });

  it("Test10: Se registra un estudiante desde la cuenta de la plataforma", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return Student.deployed("Jose", { from: accounts[2] }).then(student => {
          return platform.registerStudent(accounts[2], student.address, { from: accounts[0] })
            .then((response) => {
              truffleAssert.eventEmitted(response, 'studentRegistred', (evento) => {
                return evento.account == accounts[2];
              }, 'No se emite bien el evento.')
            });
        });
      });
    });
  });

  it("Test11: Un estudiante registrado puede leer la lista de universidades", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return Student.deployed("Jose", { from: accounts[2] }).then(student => {
          return platform.registerStudent(accounts[2], student.address, { from: accounts[0] })
            .then(v => {
              return platform.getUniversities({ from: accounts[2] });
            }).then((response) => {
              //console.log(response);
            }, (error) => {
              assert(error.message.indexOf('revert') >= 0, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test12: Una universidad registrada puede leer la lista de estudiantes", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[1] })
            .then(v => {
              return platform.getUniversities({ from: accounts[2] });
            }).then((response) => {
              //console.log(response);
            }, (error) => {
              assert(error.message.indexOf('revert') >= 0, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test13: Conseguir el SC de una cuenta de universidad desde una universidad", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[0] })
            .then(v => {
              return platform.getUniversity(accounts[1], { from: accounts[1] });
            }).then((response) => {
              assert(response == university.address, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test14: Un usuario no registrado no puede conseguir el SC de universidad", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[0] })
            .then(v => {
              return platform.getUniversity(accounts[1], { from: accounts[8] });
            }).then((response) => {
              //console.log(response);
            }, (error) => {
              assert(error, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test15: Conseguir el SC de una cuenta de universidad desde una estudiante", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return University.deployed("UNIR", { from: accounts[1] }).then(university => {
          return platform.registerUniversity(accounts[1], university.address, { from: accounts[0] })
            .then(v => {
              return platform.getUniversity(accounts[1], { from: accounts[2] });
            }).then((response) => {
              assert(response == university.address, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test16: Conseguir el SC de una cuenta de estudiante desde un estudiante", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return Student.deployed("Jose", { from: accounts[2] }).then(student => {
          return platform.registerStudent(accounts[2], student.address, { from: accounts[0] })
            .then(v => {
              return platform.getStudent(accounts[2], { from: accounts[2] });
            }).then((response) => {
              assert(response == student.address, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test17: Conseguir el SC de una cuenta de estudiante desde una universidad", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return Student.deployed("Jose", { from: accounts[2] }).then(student => {
          return platform.registerStudent(accounts[2], student.address, { from: accounts[0] })
            .then(v => {
              return platform.getStudent(accounts[2], { from: accounts[1] });
            }).then((response) => {
              assert(response == student.address, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test18: Se rechaza conseguir el SC de una cuenta de estudiante desde una cuenta no registrada", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        return Student.deployed("Jose", { from: accounts[2] }).then(student => {
          return platform.registerStudent(accounts[2], student.address, { from: accounts[0] })
            .then(v => {
              return platform.getStudent(accounts[2], { from: accounts[1] });
            }).then((response) => {
              //console.log(response);
            }, (error) => {
              assert(error, "Solo usuarios registrados");
            });
        });
      });
    });
  });

  it("Test19: Sube el precio de venta de los ECTS", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        let value = 1e18.toString()
        return platform.setTokenPrice(value, { from: accounts[0] })
          .then((response) => {
            truffleAssert.eventEmitted(response, "NewPrice", (evento) => {
              return evento.tokenpricewei > 0;
            }, 'No se emite bien el evento.');
          });
      });
    });
  });

  it("Test20: Sube el precio de recompra de los ECTS", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        let value = 1e18.toString()
        return platform.setTokenPriceForRefund(value, { from: accounts[0] })
          .then((response) => {
            truffleAssert.eventEmitted(response, "NewPriceForRefund", (evento) => {
              return evento.tokenpriceweiforrefund > 0;
            }, 'No se emite bien el evento.');
          });
      });
    });
  });

  it("Test21: Solo la plataforma puede subir el precio de venta de los ECTS", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        let value = 1e18.toString()
        return platform.setTokenPrice(value, { from: accounts[1] })
          .then((response) => {
            //console.log(response);
          }, (error) => {
            assert(error, "Solo propiertario");
          });
      });
    });
  });

  it("Test22: Solo la plataforma puede subir el precio de recompra de los ECTS", () => {
    return ECTSToken.deployed().then(ects => {
      return UniversityPlatform.deployed(ects.address, { from: accounts[0] }).then(platform => {
        let value = 1e18.toString()
        return platform.setTokenPriceForRefund(value, { from: accounts[1] })
          .then((response) => {
            //console.log(response);
          }, (error) => {
            assert(error, "Solo propietario");
          });
      });
    });
  });





});

