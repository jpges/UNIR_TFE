async function install() {  
    let _auxContractInstance;

    //Desplegamos el ECTSToken
    await deploySmartContract('ECTSToken', accountPlataforma, ABI_ECTSToken, DATA_ECTSToken).then(v => {
        _auxContractInstance = v;
    });
    accountSCECTSToken = _auxContractInstance._address;
    localStorage.setItem('accountSCECTSToken', accountSCECTSToken);

    //Desplegamos el UniversityPlatform
    await deploySmartContract('UniversityPlatform',accountPlataforma, ABI_UniversityPlatform, DATA_UniversityPlatform, [accountSCECTSToken]).then(v => {
        _auxContractInstance = v;
    });
    accountSCPlataforma = _auxContractInstance._address;
    localStorage.setItem('accountSCPlataforma', accountSCPlataforma);

    document.location = "config.html";
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
        .on('error', function (error) {
            if (error) console.log(error);
        })
        .on('transactionHash', function (transactionHash) {
            //console.log(transactionHash);
        })
        .on('receipt', function (receipt) {
            //console.log(receipt.contractAddress)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            //console.log(confirmationNumber);
        })
        .then(function (_newContractInstance) {
            newContractInstance = _newContractInstance;
            console.log(`Nueva instancia contrato ${scname}: ${newContractInstance._address}`);
        });
    return newContractInstance;
}
