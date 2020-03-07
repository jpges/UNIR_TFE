var web3 = null;
var accounts = null;
var accountPlataforma = null;
var SCPlataforma;
var SMECTSToken;

if (localStorage.getItem('indexAccount')===null){
    localStorage.setItem('indexAccount', 1); // Control de cuentas utilizadas. La cuenta 0 siempre la utiliza la plataforma, por eso marcamos el indice a 1 inicialmente
}
var indexAccount = parseInt(localStorage.getItem('indexAccount')); 

async function initWeb3(){
    await settingAccounts();
    await unlockPlatformAccount();
}

async function settingAccounts() {
    switch (environment) {
        case 'testnet':
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:22001"));
            try {
                accounts = await web3.eth.getAccounts();
            }
            catch (error) {
                die(error, "La TestNet no responde en http://localhost:22001, por favor, comprueba que se encuentra en ejecución.");
            }
            break;
        case 'alastria':
            web3 = new Web3(new Web3.providers.HttpProvider("http://138.4.143.82:8545"));
            accounts = [
                "0x994319e1b1de09aac4aa5b225a7d5cade79d04ed",
                "0x66c5a820d0e743fc7030f02aa873875c84a88f3f",
                "0x34322a678b16ce26fc0e2bdde1e3c1b666a34a66",
                "0xfc3b00c03b74ee1d94fa10e21aef4e6e9710e8a8",
                "0xf76c62480a8a6a83451eeef40d331ed179da7f89",
                "0x7b1b6d29cb425887d1bc4849d0708091bcbaf16b",
                "0x12e3bb9f253bd233e03bd696b1c558a056179b87",
                "0x59bedaa81edfd70b8e370a96cf29ee327e84e551",
                "0x9a63729158a93f502935bc322af78e4f25a5cc02",
                "0xab2c680816421e56ba3274a37c3df455fba32725"
            ];
            break;
        default: //En este caso tirará de Ganache
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
            try {
                accounts = await web3.eth.getAccounts();
            }
            catch (error) {
                die(error, "Ganache no responde en http://localhost:7545, por favor, comprueba que se encuentra en ejecución.");
            }
            break;
    }
    accountPlataforma = accounts[0];
    localStorage.setItem("accountPlataforma", accountPlataforma);
    console.log("CUENTAS INICIALIZADAS\n" + accounts);
}

function die(error, errorMessage){
    alert(errorMessage);
    window.location.href = "about:blank";
    console.error(errorMessage + error);
}

async function unlockPlatformAccount() {
    switch (environment) {
        case 'testnet':
            web3.personal.unlockAccount(accountPlataforma, "Passw0rd");
            break;
        case 'alastria':
            web3.eth.personal.unlockAccount(accountPlataforma, "Alumnos_2018_Q4_IKx5srvT");
            break;
        default: //En este caso tirará de Ganache
        // En ganache todas las cuentas están desbloqueadas
    }
    web3.eth.defaultAccount = accountPlataforma;
    console.log("Desbloqueada cuenta de la plataforma: " + accountPlataforma);
}

async function deploySmartContract(scname, account, abi, data, _arguments) {
    let newContractInstance;
    var Contract = new web3.eth.Contract(abi)
    var tx = await Contract.deploy({
        data: data,
        arguments: _arguments
    }).send({
        gas: 6000000,
        from: account
    }, function (error, transactionHash) {
        if (error) console.log(error);
    })
        .on('error', function (error, receipt) {
            console.log(`ERROR DESPLEGANDO CONTRATO ${scname}`);
		    console.log("Error: " + error);
        })
        .on('receipt', function (receipt) {
            console.debug(receipt);
        })
        .then(function (_newContractInstance) {
            newContractInstance = _newContractInstance;
            console.log(`Nueva instancia contrato ${scname}: ${newContractInstance._address}`);
        });
    return newContractInstance;
}

function getSmartContrats() {
    SCPlataforma = new web3.eth.Contract(ABI_UniversityPlatform, accountSCPlataforma);
    SCECTSToken = new web3.eth.Contract(ABI_ECTSToken, accountSCECTSToken);
}