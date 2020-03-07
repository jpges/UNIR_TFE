
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

	localStorage.setItem('accountUniversity', accountUniversity);

	//Desbloqueamos la cuenta
	await web3.eth.personal.unlockAccount(accountUniversity, password)
		.then(console.log('Cuenta desbloqueada!'));

	//Desplegamos un nuevo SC de Universidad
	let SCUniversity;
	await deploySmartContract('University', accountUniversity, ABI_University, DATA_University,
		[name, accountSCECTSToken]).then(v => {
			SCUniversity = v;
		});
	accountSCUniversity = SCUniversity._address;
	localStorage.setItem('accountSCUniversity', accountSCUniversity);

	//Llamamos a la plataforma para registrar la universidad
	SCPlataforma.methods.registerUniversity(accountUniversity, accountSCUniversity).send({
		gas: 3000000,
		from: accountPlataforma
	});
		.on('receipt', function (receipt) {
			console.log(`Registrada universidad ${name} con cuenta ${accountUniversity} y smartcontract asociado ${accountSCUniversity}`);
			console.log(receipt);
		})
		.on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
			console.log("ERROR CREANDO LA UNIVERSIDAD");
			console.log("Error: " + error);
		});

	//Bloqueamos nuevamente la cuenta
	web3.eth.personal.lockAccount(accountUniversity, password);

	return [accountUniversity, password];
}

function loginUniversidad() {
	let inputAccount = document.getElementById("inputAccount").value;
	let inputPassword = document.getElementById("inputPassword").value;

	try {
		web3.eth.personal.unlockAccount(inputAccount, inputPassword);

		var accSC = await SCPlataforma.methods.getUniversity(inputAccount).call({
			from: accountPlataforma,
			gas: 30000
		});

		if (accSC != "") {
			console.log(accSC);
			localStorage.setItem("accountUniversity", inputAccount);
			localStorage.setItem("accountSCUniversity", accSC);
			return true;
		} else {
			localStorage.removeItem("accountUniversity");
			localStorage.removeItem("accountSCUniversity");
			return false;
		};
	} catch (error) {
		localStorage.removeItem("accountUniversity");
		localStorage.removeItem("accountSCUniversity");
		console.log(error);
		return false;
	}
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

function publicarAsignatura(){
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

function toTimestamp(strDate){
	var datum = Date.parse(strDate);
	return datum/1000;
   }