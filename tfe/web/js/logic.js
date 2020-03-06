
// Registrar una nueva universidad
async function registrarUniversidad() {
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

	localStorage.setItem('accountUniversity', accountUniversity);

	//Desbloqueamos la cuenta
	try {
		web3.personal.unlockAccount(accountUniversity, password, 0);
	} catch { e => console.log(e) }

	//Desplegamos un nuevo SC de Universidad
	let SCUniversity;
	await deploySmartContract('University', accountUniversity, ABI_University, DATA_University,
		[name, accountSCECTSToken]).then(v => {
			SCUniversity = v;
		});
	accountSCUniversity = SCUniversity._address;
	localStorage.setItem('accountSCUniversity', accountSCUniversity);

	//Llamamos a la plataforma para registrar la universidad
	var tx = await SCPlataforma.methods.registerUniversity(accountUniversity, accountSCUniversity).send({
		gas: 700000,
		from: accountPlataforma
	})
	.then(function (result) {
		console.log(result);
			if (!error) {
				var msg = `OK! Se ha creado correctamente la universidad ${name}`;
				console.log(msg);
				var ask = window.confirm(msg);
				if (ask) {
					window.location.href = "index.html";
				}
			} else {
				console.log("Error" + error);
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