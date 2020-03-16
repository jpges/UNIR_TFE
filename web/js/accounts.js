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
const ALASTRIA_PROVIDER = "http://10.141.8.11:8545";
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
                await web3.eth.getAccounts().then(c => {accounts = c;});
            }
            catch (error) {
                die(error, "La TestNet no responde en http://localhost:22001, por favor, comprueba que se encuentra en ejecución.");
            }
            break;
        case ALASTRIA:
            web3 = new Web3(new Web3.providers.HttpProvider(ALASTRIA_PROVIDER));
            accounts = [
                "0xbc869c21d631e122d35789942a573241ec04d2e4",
                "0xad11f232919a54696791387e3a74a63394c2dafb",
                "0x35ad6e72cb2ec714b80154b796c7835f97053d3e",
                "0xa3fefd78a13f6b6bb1cf60c20bb854c7ed2d8d17",
                "0x09702705ebed2c925b3c56662e4982ebec8bce7d",
                "0xc35fdb9f41a34e998f4d094922e190b4c6fd8e32",
                "0x11c5395d602289b7407ceebb4fdde5707772c6ae",
                "0x48d095879b4ebde16b74129c4ec9d3d78d984b80",
                "0xea66394b0ecc0175b7b4889a24ea959e84b2d32c",
                "0x241bae338d230276f8bc1d38e7ac7bc6a1cbdf22"
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
            await web3.eth.personal.unlockAccount(accountPlataforma, "Passw0rd", 0);
            break;
        case ALASTRIA:
            await web3.eth.personal.unlockAccount(accountPlataforma, "4mFmfbLsSlUS9b5msSfx", 0);
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

