
// Registrar una nueva universidad
function registrarUniversidad() {
	var name = document.getElementById("name").value;
	var password = document.getElementById("password").value;
	var accountUniversity;

	switch (environment) {
		case 'testnet':
			accountUniversity = web3.personal.newAccount(password);
			break;
		default: //En este caso tirará de Ganache y Alastria
			accountUniversity = accounts[indexAccount];
			indexAccount += 1;
			localStorage.setItem('indexAccount', indexAccount);
	}
	//Desbloqueamos la cuenta
	web3.personal.unlockAccount(accountUniversity, password, 0);

	//TODO: Desplegamos un SC de Universidad


	//TODO: Llamamos a la plataforma para registrar la universidad
	SCPlataforma.registerUniversity(accountSCUniversity);

	plataforma.registrarEmpresa.sendTransaction(address, nombre, cif, { from: accounts[0], gas: 200000 },
		function (error, result) {
			if (!error) {
				var event = plataforma.EmpresaRegistrada({}, { fromBlock: 'latest', toBlock: 'latest' },
					function (error, result) {
						if (!error) {
							var msg = "OK! Se ha creado correctamente la cuenta " + address + " para " + result.args._nombre + " con contraseña " + pss
								+ "\n\n¡Apunta bien tu direccion para poder hacer login!";
							console.log(msg);
							var ask = window.confirm(msg);
							if (ask) {
								window.location.href = "index.html";
							}
						} else {
							console.log("Error" + error);
						}
					});
			} else {
				console.error("Error" + error);
			}
		});

	//Bloqueamos nuevamente la cuenta
	web3.personal.lockAccount(accountUniversity, password);
}

function loginEstudiante() {
	location.replace("estudiantes.html");
	var address = document.getElementById("inputAccount").value;
	var pss = document.getElementById("inputPassword").value;
	try {
		web3.personal.unlockAccount(address, pss, 0);
		var exist = plataforma.existeEmpleado.call(address, { from: accounts[0], gas: 30000 });
		if (exist) {
			localStorage.setItem("inputAccount", address);
			location.replace("estudiantes.html");
		} else {
			alert("La cuenta de estudiante indicada no existe en el sistema");
		}
	} catch (error) {
		alert("¡Contraseña incorrecta!");
	}
}

function encadenar() {
	var consola = document.getElementById('consola').innerHTML;
	document.getElementById('consola').innerHTML = consola.concat('ashkjdjl asdsad lkjlkasjd laksjda sdlkajsdlk jasldkja slkdjas dlkasjd laksdj');
}