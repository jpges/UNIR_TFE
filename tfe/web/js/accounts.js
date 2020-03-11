var web3 = null;
var accounts = null;
var accountPlataforma = null;
var SCPlataforma;
var SMECTSToken;

//TODO: El precio del ECTS debería capturarse de la plataforma lo tomamos de aquí porque en el servidor
//aún así saltaría un error si superase el precio.
var priceECTSInMilliEtherForBuy = 760;
var priceECTSInMilliEtherForSale = 560;

const GANACHE_PROVIDER = "http://localhost:7545";
const ALASTRIA_PROVIDER = "http://138.4.143.82:8545";
const TESTNET_PROVIDER = "http://localhost:22001";
const TESTNET = "testnet";
const GANACHE = "ganache";
const ALASTRIA = "alastria";

if (localStorage.getItem('indexAccount') === null) {
    localStorage.setItem('indexAccount', 1); // Control de cuentas utilizadas. La cuenta 0 siempre la utiliza la plataforma, por eso marcamos el indice a 1 inicialmente
}
var indexAccount = parseInt(localStorage.getItem('indexAccount'));

async function initWeb3() {
    await settingAccounts();
    await unlockPlatformAccount();
}

async function settingAccounts() {
    switch (environment) {
        case TESTNET:
            web3 = new Web3(new Web3.providers.HttpProvider(TESTNET_PROVIDER));
            try {
                var account = web3.eth.accounts.create(web3.utils.randomHex(32));
                accounts = [account.address.toString()];
            }
            catch (error) {
                die(error, "La TestNet no responde en http://localhost:22001, por favor, comprueba que se encuentra en ejecución.");
            }
            break;
        case ALASTRIA:
            web3 = new Web3(new Web3.providers.HttpProvider(ALASTRIA_PROVIDER));
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
        case GANACHE: //En este caso tirará de Ganache
            web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_PROVIDER));
            try {
                accounts = await web3.eth.getAccounts();
            }
            catch (error) {
                die(error, "Ganache no responde en http://localhost:7545, por favor, comprueba que se encuentra en ejecución.");
            }
            break;
        default:
    }
    if (environment != TESTNET && accounts.length <= indexAccount) {
        console.error("************************************************************************************");
        console.error("************************************************************************************");
        console.error(" NO QUEDAN CUENTAS EN SU SISTEMA. SI NECESITA CREAR ALGUNA, DEBE REINICIARLO TODO");
        console.error("************************************************************************************");
        console.error("************************************************************************************");
    }
    accountPlataforma = accounts[0];
    localStorage.setItem("accountPlataforma", accountPlataforma);
    console.log("CUENTAS INICIALIZADAS\n" + accounts);
}

function die(error, errorMessage) {
    alert(errorMessage);
    console.error(errorMessage + error);
    //window.location.href = "about:blank";
    $('input[name=optradio]').prop('checked', false);
    throw new Error(errorMessage);
}

async function unlockPlatformAccount() {
    switch (environment) {
        case TESTNET:
            web3.eth.personal.unlockAccount(accountPlataforma, "Passw0rd");
            break;
        case ALASTRIA:
            web3.eth.personal.unlockAccount(accountPlataforma, "Alumnos_2018_Q4_IKx5srvT");
            break;
        default: //En este caso tirará de Ganache
        // En ganache todas las cuentas están desbloqueadas
    }
    web3.eth.defaultAccount = accountPlataforma;
    console.log("Desbloqueada cuenta de la plataforma: " + accountPlataforma);
}

async function asyncDeployContract(scname, account, abi, data, _arguments) {
    return await deployContract(scname, account, abi, data, _arguments);
}

function deployContract(scname, account, abi, data, _arguments) {
    let newContractInstance;
    var Contract = new web3.eth.Contract(abi)

    return Contract.deploy({
        data: data,
        arguments: _arguments
    }).send({
        gas: 6700000,
        from: account
    }, function (error, transactionHash) {
        if (error) console.log(error);
    }).once('confirmation', function (confirmationNumber, receipt) {
        console.log(`DESPLEGANDO CONTRATO ${scname} confirmation: ` + confirmationNumber)
    }).on('transactionHash', function (hash) {
        console.log(`DESPLEGANDO CONTRATO ${scname} trans hash: ` + hash)
    }).on('error', function (error) {
        console.log(`DESPLEGANDO CONTRATO ${scname} error: ` + error);
    }).on('receipt', function (receipt) {
        console.debug(`DESPLEGANDO CONTRATO ${scname} receipt: ` + receipt.contractAddress)
    }).then(function (_newContractInstance) {
        newContractInstance = _newContractInstance;
        console.log(`Nueva instancia contrato ${scname}: ${newContractInstance._address}`);
        return newContractInstance;
    }).catch(function (error) {
        console.log(`ERROR DESPLEGANDO CONTRATO: ${scname}` + error);
    });
}

function getSmartContrats() {
    SCPlataforma = new web3.eth.Contract(ABI_UniversityPlatform, accountSCPlataforma);
    SCECTSToken = new web3.eth.Contract(ABI_ECTSToken, accountSCECTSToken);
}

function getBalanceOfMilliEther(address) {
    let balance = web3.eth.getBalance(address).then(v => {
        return web3.utils.fromWei(v, "milliether");
    }).then(z => {
        return z;
    }); //Will give value in.
    return balance;
}

