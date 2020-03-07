//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funciones universidad

// Registrar una nueva universidad
function registrarUniversidad() {
	var name = document.getElementById("account").value;
	var password = document.getElementById("pss").value;
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
	localStorage.setItem('pps', password);

	//Desbloqueamos la cuenta
	return web3.eth.personal.unlockAccount(accountUniversity, password)
		.then(function () {
			console.log('Cuenta desbloqueada!');
			//Desplegamos un nuevo SC de Universidad
			let SCUniversity;
			return deployContract('University', accountUniversity, ABI_University, DATA_University,
				[name, accountSCECTSToken]).then(v => {
					SCUniversity = v;
					accountSCUniversity = SCUniversity._address;
					localStorage.setItem('accountSCUniversity', accountSCUniversity);
					console.log(`Desplegado el smart contract para la universidad: ${accountSCUniversity}`);

					//Llamamos a la plataforma para registrar la universidad
					return SCPlataforma.methods.registerUniversity(accountUniversity, accountSCUniversity).send({
						gas: 3000000,
						from: accountPlataforma
					}).on('receipt', function (receipt) {
						console.log(`Registrada universidad ${name} con cuenta ${accountUniversity} y smartcontract asociado ${accountSCUniversity}`);
						console.log(receipt);
					}).on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
						console.error("ERROR CREANDO LA UNIVERSIDAD");
						console.error("Error: " + error);
						return null;
					}).then(function () {
						//Bloqueamos nuevamente la cuenta
						closeUniversitySession();
						return [accountUniversity, password];
					});
				});

		}).catch(err => {
			//Bloqueamos nuevamente la cuenta
			closeUniversitySession();
			console.error("ERROR REGISTERUNIVERSITY:" + err);
			return null;
		});;
}

function loginUniversidad() {
	let inputAccount = document.getElementById("inputAccount").value;
	let inputPassword = document.getElementById("inputPassword").value;
	var accSC;
	try {
		web3.eth.personal.unlockAccount(inputAccount, inputPassword);

		accSC = SCPlataforma.methods.getUniversity(inputAccount).call({
			from: accountPlataforma,
			gas: 30000
		}).then(function (v) {
			localStorage.setItem('accountUniversity', inputAccount);
			localStorage.setItem('pps', inputPassword);
			localStorage.setItem("accountSCUniversity", v);
			return true;
		});
	} catch (err) {
		console.error(`ERROR: Intento acceso erroneo cuenta ${inputAccount}`);
		closeUniversitySession();
		console.log(err);
		return false;
	};
	return accSC;
}

function getNameUniversidad() {
	let accountUniversity = localStorage.getItem("accountUniversity");
	let accountSCUniversity = localStorage.getItem("accountSCUniversity");
	let SCUniversity = new web3.eth.Contract(ABI_University, accountSCUniversity);
	var name = SCUniversity.methods.name().call({
		from: accountUniversity,
		gas: 30000
	});
	return name;
}

function getTablaAsignaturas() {
	let accountUniversity = localStorage.getItem("accountUniversity");
	let accountSCUniversity = localStorage.getItem("accountSCUniversity");
	let SCUniversity = new web3.eth.Contract(ABI_University, accountSCUniversity);
	var result = SCUniversity.methods.getSubjects().call({
		from: accountUniversity,
		gas: 30000
	}).then(function (_subjects) {
		let promises = [];
		_subjects.forEach(_subject => {
			promises.push(getInfoSubject(_subject));
		});
		return Promise.all(promises);
	});
	return result;
}

function getInfoSubject(subjectaccount) {
	let accountUniversity = localStorage.getItem("accountUniversity");
	let accountSCUniversity = localStorage.getItem("accountSCUniversity");
	let SCSubject = new web3.eth.Contract(ABI_Subject, subjectaccount);
	let promises = [];
	promises.push(subjectaccount);
	promises.push(SCSubject.methods.name().call({
		from: accountUniversity,
		gas: 30000
	}));
	promises.push(SCSubject.methods.symbol().call({
		from: accountUniversity,
		gas: 30000
	}));
	promises.push(SCSubject.methods.price().call({
		from: accountUniversity,
		gas: 30000
	}));
	promises.push(SCSubject.methods.baseURI().call({
		from: accountUniversity,
		gas: 30000
	}));

	return Promise.all(promises);
}

function getTablaDepositos() {
	let accountUniversity = localStorage.getItem("accountUniversity");
	let accountSCUniversity = localStorage.getItem("accountSCUniversity");
	let SCUniversity = new web3.eth.Contract(ABI_University, accountSCUniversity);
	var result = SCUniversity.methods.getDeposits().call({
		from: accountUniversity,
		gas: 30000
	}).then(function (deposits) {
		let promises = [];
		deposits.forEach(owner => {
			promises.push(getDeposito(owner));
		});
		return Promise.all(promises);
	});
	return result;
}

function getDeposito(owner) {
	let accountUniversity = localStorage.getItem("accountUniversity");
	let accountSCUniversity = localStorage.getItem("accountSCUniversity");
	let SCUniversity = new web3.eth.Contract(ABI_University, accountSCUniversity);
	var result = SCUniversity.methods.getDeposit(owner).call({
		from: accountUniversity,
		gas: 30000
	})
	return result;
}

function publicarAsignatura() {
	let accountUniversity = localStorage.getItem("accountUniversity");
	let accountSCUniversity = localStorage.getItem("accountSCUniversity");

	let subjectname = document.getElementById("subjectname").value;
	let symbol = document.getElementById("symbol").value;
	let limitmint = document.getElementById("limitmint").value;
	let expirationtime = toTimestamp(document.getElementById("expirationtime").value);
	let price = document.getElementById("price").value;
	let descriptionURI = document.getElementById("descriptionURI").value;

	let SCUniversity = new web3.eth.Contract(ABI_University, accountSCUniversity);

	//Llamamos a la plataforma para registrar la universidad
	var tx = SCUniversity.methods.createSubject(subjectname, symbol, limitmint,
		expirationtime, price, descriptionURI).send({
			gas: 3000000,
			from: accountUniversity
		});
	return tx;
}

function closeUniversitySession() {
	var accountUniversity = localStorage.getItem("accountUniversity");
	var password = localStorage.getItem("pps");
	web3.eth.personal.lockAccount(accountUniversity, password);
	localStorage.removeItem("accountSCUniversity");
	localStorage.removeItem('accountUniversity');
	localStorage.removeItem('pps');
}

////////////////////////////////////////////////////////////////////////////////////////////////
//////////    Funciones estudiante
///////////////////////////////////////////////
// Registrar una nuev estudiante
function registrarEstudiante() {
	var name = document.getElementById("account").value;
	var password = document.getElementById("pss").value;
	var accountStudent;

	switch (environment) {
		case 'testnet':
			accountStudent = web3.personal.newAccount(password);
			break;
		default: //En este caso tirará de Ganache y Alastria
			accountStudent = accounts[indexAccount];
			indexAccount += 1;
			localStorage.setItem('indexAccount', indexAccount);
	}

	localStorage.setItem('accountStudent', accountStudent);
	localStorage.setItem('pps', password);

	//Desbloqueamos la cuenta
	return web3.eth.personal.unlockAccount(accountStudent, password, 100)
		.then(function () {
			console.log('Cuenta desbloqueada!');
			//Desplegamos un nuevo SC de Student
			let SCStudent;
			return deployContract('Student', accountStudent, ABI_Student, DATA_Student,
				[name, accountSCECTSToken]).then(v => {
					SCStudent = v;
					accountSCStudent = SCStudent._address;
					localStorage.setItem('accountSCStudent', accountSCStudent);
					console.log(`Desplegado el smart contract para el estudiante: ${accountSCStudent}`);

					//Llamamos a la plataforma para registrar al estudiante
					return SCPlataforma.methods.registerStudent(accountStudent, accountSCStudent).send({
						gas: 3000000,
						from: accountPlataforma
					}).on('receipt', function (receipt) {
						console.log(`Registrado estudiante ${name} con cuenta ${accountStudent} y smartcontract asociado ${accountSCStudent}`);
						console.log(receipt);
					}).on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
						console.error("ERROR CREANDO AL ESTUDIANTE");
						console.error("Error: " + error);
						return null;
					}).then(function () {
						//Bloqueamos nuevamente la cuenta
						closeStudentSession();
						return [accountStudent, password];
					});
				});

		}).catch(err => {
			//Bloqueamos nuevamente la cuenta
			closeStudentSession();
			console.error("ERROR REGISTERSTUDENT:" + err);
			return null;
		});
}

function loginEstudiante() {
	let inputAccount = document.getElementById("inputAccount").value;
	let inputPassword = document.getElementById("inputPassword").value;
	var accSC;
	try {
		web3.eth.personal.unlockAccount(inputAccount, inputPassword);
		accSC = SCPlataforma.methods.getStudent(inputAccount).call({
			from: accountPlataforma,
			gas: 30000
		}).then(function (v) {
			localStorage.setItem('accountStudent', inputAccount);
			localStorage.setItem('pps', inputPassword);
			localStorage.setItem("accountSCStudent", v);
			return true;
		});
	} catch (err) {
		console.error(`ERROR: Intento acceso erroneo cuenta ${inputAccount}`);
		closeStudentSession();
		console.log(err);
		return false;
	};
	return accSC;
}

function getNameEstudiante() {
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	var name = SCStudent.methods.name().call({
		from: accountStudent,
		gas: 30000
	});
	return name;
}

function getTablaMatriculas() {
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	var result = SCStudent.methods.getSubjectsInWitchEnrolled().call({
		from: accountStudent,
		gas: 30000
	}).then(function (_subjects) {
		let promises = [];
		_subjects.forEach(_subject => {
			promises.push(getIdToken(_subject));
			promises.push(getInfoSubject(_subject));
		});
		return Promise.all(promises);
	});
	return result;
}

function getIdToken(subjectaccount) {
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	var result = SCStudent.methods.getEnrollementTokenId(subjectaccount).call({
		from: accountStudent,
		gas: 30000
	});
	return result;
}

function getTablaDepositosPropios(){
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	var result = SCStudent.methods.getUniversitiesWithDeposit().call({
		from: accountStudent,
		gas: 30000
	});
	return result;
}

function closeStudentSession() {
	var accountStudent = localStorage.getItem("accountStudent");
	var password = localStorage.getItem("pps");
	web3.eth.personal.lockAccount(accountStudent, password);
	localStorage.removeItem("accountSCStudent");
	localStorage.removeItem('accountStudent');
	localStorage.removeItem('pps');
}

function getTablaDepositosPropios(){
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	var result = SCStudent.methods.getUniversitiesWithDeposit().call({
		from: accountStudent,
		gas: 30000
	});
	return result;
}

function buyECTSTokens() {
	let cantidad = document.getElementById("cantidad").value;
	let accountStudent = localStorage.getItem("accountStudent");

	return SCPlataforma.methods.buyTokens(accountStudent).send({
		gas: 5000000,
		from: accountPlataforma,
		value: web3.utils.toWei( cantidad, 'ether')
	}).on('receipt', function (receipt) {
		console.log(receipt);
		return true
	}).on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
		console.error("ERROR COMPRANDO TOKENS");
		console.error(error);
		return false;
	});
}


////////////////////////////////////////////////////////////////////////////////////////////////
//////////    Funciones comunes
///////////////////////////////////////////////

function toTimestamp(strDate) {
	var datum = Date.parse(strDate);
	return datum / 1000;
}

function addContentTable(tablename, arraytable) {
	var table = document.getElementById(tablename);
	for (let row of arraytable) {
		table.insertRow();
		for (let cell of row) {
			let newCell = table.rows[table.rows.length - 1].insertCell();
			newCell.textContent = cell;
		}
	}
}
