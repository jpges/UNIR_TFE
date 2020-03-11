//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funciones universidad

// Registrar una nueva universidad
function registrarUniversidad() {
	var name = document.getElementById("account").value;
	var password = document.getElementById("pss").value;
	var accountUniversity;

	switch (environment) {
		case TESTNET_PROVIDER:
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
	return getNameSCUniversidad(accountUniversity, accountSCUniversity);
}

function getNameSCUniversidad(caller, addressSCUniv) {
	let SCUniversity = new web3.eth.Contract(ABI_University, addressSCUniv);
	return SCUniversity.methods.name().call({
		from: caller,
		gas: 30000
	});
}

function getTablaAsignaturas(account, accountSC) {
	let SCUniversity = new web3.eth.Contract(ABI_University, accountSC);
	var result = SCUniversity.methods.getSubjects().call({
		from: account,
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
	return SCUniversity.methods.getDeposit(owner).call({
		from: accountUniversity,
		gas: 30000
	}).then(v => {
		return [owner, decodeURI(v[0]), v[1]];
	});
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
			gas: 6000000,
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

function getTablaAlumnos(accountUniversity, subject) {
	return getNumeroMatriculados(accountUniversity, subject).then(v => {
		let numeromatriculados = parseInt(v);
		let promises = [];
		for (var i = 1; i <= numeromatriculados; i++) {
			promises.push(getMatriculado(accountUniversity, subject, i));
		}
		return Promise.all(promises);
	});
}

function getNumeroMatriculados(accountUniversity, subject) {
	let SCSubject = new web3.eth.Contract(ABI_Subject, subject);
	return SCSubject.methods.lastTokenIndex().call({
		from: accountUniversity,
		gas: 30000
	});
}

function getMatriculado(accountUniversity, subject, tokenId) {
	let SCSubject = new web3.eth.Contract(ABI_Subject, subject);
	return SCSubject.methods.ownerOf(tokenId).call({
		from: accountUniversity,
		gas: 30000
	}).then(owner => {
		return SCSubject.methods.isSubjectApproved(tokenId).call({
			from: accountUniversity,
			gas: 30000
		}).then(aprobado => {
			return [tokenId, owner, aprobado];
		});
	}).then(function ([tokenId, owner, aprobado]) {
		return SCPlataforma.methods.getStudent(owner).call({
			from: accountUniversity,
			gas: 30000
		}).then(accountSCStudent => {
			return [tokenId, owner, aprobado, accountSCStudent];
		});
	}).then(function ([tokenId, owner, aprobado, accountSCStudent]) {
		let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
		return SCStudent.methods.name().call({
			from: accountUniversity,
			gas: 30000
		}).then(name => {
			return [tokenId, owner, aprobado, accountSCStudent, name];
		});
	});
}

function getNameAsignatura(account, subject){
	let SCSubject = new web3.eth.Contract(ABI_Subject, subject);
	return SCSubject.methods.name().call({
		from: account,
		gas: 30000
	});
}

function aprobarAsignatura(account, accountSC, subject, tokenId){
	let SCUniversity = new web3.eth.Contract(ABI_University, accountSC);
	return SCUniversity.methods.setSubjectApproved(subject, tokenId).send({
		from: account,
		gas: 100000
	});
}

function reembolsar(accountUniversity, cantidad){
	return SCECTSToken.methods.approve(accountSCPlataforma, cantidad).send({
		gas: 5000000,
		from: accountUniversity
	}).then(function (result) {
		return SCPlataforma.methods.refundECTS(accountUniversity, cantidad).send({
			gas: 5000000,
			from: accountUniversity
		});
	}); 
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
		case TESTNET_PROVIDER:
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

function getBalanceOfECTS(account) {
	return SCECTSToken.methods.balanceOf(account).call({
		from: account,
		gas: 30000
	});
}

function getListUniversities() {
	let accountStudent = localStorage.getItem("accountStudent");
	return SCPlataforma.methods.getUniversities().call({
		from: accountStudent,
		gas: 30000
	}).then(function (universities) {
		let promises = [];
		universities.forEach(univ => {
			promises.push(getUniversityStudent(univ));
		});
		return Promise.all(promises);
	});
}

function getUniversityStudent(univ) {
	let accountStudent = localStorage.getItem("accountStudent");
	return SCPlataforma.methods.getUniversity(univ).call({
		from: accountStudent,
		gas: 30000
	}).then(function (addressSC) {
		return getNameSCUniversidad(accountStudent, addressSC).then(v => {
			return [addressSC, v];
		});
	});
}

function getTablaMatriculas() {
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	return SCStudent.methods.getSubjectsInWitchEnrolled().call({
		from: accountStudent,
		gas: 30000
	}).then(function (_subjects) {
		let promises = [];
		_subjects.forEach(_subject => {
			promises.push(getInfoSubject(_subject));
		});
		return Promise.all(promises);
	}).then(function (_subjects) {
		let promises = [];
		_subjects.forEach(_subject => {
			promises.push(getMatricula(accountStudent, accountSCStudent, _subject));
		});
		return Promise.all(promises);
	});
}

function getMatricula(accountStudent, accountSCStudent, subject) {
	return getIdToken(accountStudent, accountSCStudent, subject[0]).then(v => {
		return [subject[0], v, subject[1], subject[2], subject[3], subject[4]];
	}).then(v => {
		return isSubjectApproved(accountStudent, v[0], v[1]).then(z => {
			return [v[0], v[1], v[2], v[3], v[4], v[5], z];
		});
	});
}

function getIdToken(accountStudent, accountSCStudent, subjectaccount) {
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	return SCStudent.methods.getEnrollementTokenId(subjectaccount).call({
		from: accountStudent,
		gas: 30000
	});
}

function isSubjectApproved(accountStudent, subjectaccount, tokenId) {
	let SCSubject = new web3.eth.Contract(ABI_Subject, subjectaccount);
	var result = SCSubject.methods.isSubjectApproved(tokenId).call({
		from: accountStudent,
		gas: 30000
	});
	return result;
}

function getTablaDepositosPropios() {
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	return SCStudent.methods.getUniversitiesWithDeposit().call({
		from: accountStudent,
		gas: 30000
	}).then(function (accountSCUnivs) {
		let promises = [];
		accountSCUnivs.forEach(accountSC => {
			promises.push(getDepositosPropio(accountStudent, accountSC));
		});
		return Promise.all(promises);
	});
}

function getDepositosPropio(accountStudent, accountSC) {
	let promises = [];
	promises.push(accountSC);
	promises.push(getNameSCUniversidad(accountStudent, accountSC));
	promises.push(getDepositInUniversity(accountSC));
	return Promise.all(promises);
}

function getDepositInUniversity(scuniv) {
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);
	return SCStudent.methods.getDepositInUniversity(scuniv).call({
		from: accountStudent,
		gas: 30000
	});
}

function closeStudentSession() {
	var accountStudent = localStorage.getItem("accountStudent");
	var password = localStorage.getItem("pps");
	web3.eth.personal.lockAccount(accountStudent, password);
	localStorage.removeItem("accountSCStudent");
	localStorage.removeItem('accountStudent');
	localStorage.removeItem('pps');
}

function buyECTSTokens(cantidadECTS, accountStudent) {
	/*
	TODO: Aquí hemos supuesto que el precio del ECTS es fijo a 760 miliEthers
	Lo correcto sería preguntarle el precio a la plataforma de la universidad que es la que lo fija, pero por
	falta de tiempo y el caracter académico de este trabajo lo dejo así.
	*/
	//Calculamos el precio exacto para que no haya devoluciones
	let cantidad = cantidadECTS * 760;
	let toWei = web3.utils.toWei(cantidad.toString(), "milliether");

	console.log("Vamos a comprar (miliether): " + toWei);
	return SCPlataforma.methods.buyTokens(accountStudent).send({
		gas: 5000000,
		from: accountStudent,
		value: toWei
	}).then(v => {
		console.log("Ejecutada compra de tokens.");
		console.log(v);
	});;
}


function depositarECTSTokens(studentname) {
	let cantidadECTS = document.getElementById("cantidad").value;
	let accountSCUniv = document.getElementById("universidad").value;
	let accountStudent = localStorage.getItem("accountStudent");
	let accountSCStudent = localStorage.getItem("accountSCStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student, accountSCStudent);

	return SCECTSToken.methods.approve(accountSCUniv, cantidadECTS).send({
		gas: 5000000,
		from: accountStudent
	}).then(function (result) {
		return SCStudent.methods.addDeposit(studentname, accountSCUniv, cantidadECTS).send({
			gas: 5000000,
			from: accountStudent
		}).then(v => {
			console.log("Ejecutada transferencia de deposito.");
			console.log(v);
		});
	});
}

function matricularEnAsignatura(univSC, asignatura) {
	let accountStudent = localStorage.getItem("accountStudent");
	let SCStudent = new web3.eth.Contract(ABI_Student,localStorage.getItem("accountSCStudent"));
	let SCUniversity = new web3.eth.Contract(ABI_University, univSC);
	return SCUniversity.methods.enrollInSubject(asignatura).send({
		gas: 5000000,
		from: accountStudent
	}).then( result => {
		let tokenId=result.events.EnrolledInSubject.returnValues.tokenId;
		return SCStudent.methods.recordEnrollInSubject(univSC, asignatura, tokenId).send({
			gas: 5000000,
			from: accountStudent
		}).then(v => {
			return [v,tokenId];
		});
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
			newCell.innerHTML = cell;
		}
	}
}

function addContentSelect(selectname, array) {
	var sel = document.getElementById(selectname);
	for (let row of array) {
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(row[1]));
		opt.value = row[0];
		sel.appendChild(opt);
	}
}

$.urlParam = function (name) {
	var results = new RegExp('[\?&]' + name + '=([^&#]*)')
		.exec(window.location.search);
	return (results !== null) ? results[1] || 0 : false;
}