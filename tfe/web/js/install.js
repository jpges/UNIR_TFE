async function install() {  
    let _auxContractInstance;
    await deploySmartContract(accountPlataforma, ABI_UniversityPlatform, DATA_UniversityPlatform).then(v => {
        _auxContractInstance = v;
    });
    accountSCPlataforma = _auxContractInstance.options.address;
    localStorage.setItem('accountSCPlataforma', accountSCPlataforma);

    //TODO: Llamar al smPlataforma para conseguir la cuenta del scECTSToken
    //accountSCECTSToken =
    localStorage.setItem('accountSCECTSToken', accountSCECTSToken);

    document.location = "config.html";
}

async function deploySmartContract(account, abi, data, _arguments) {
    let newContractInstance;
    var Contract = new web3.eth.Contract(abi)
    var tx = await Contract.deploy({
        data: '0x' + data,
        arguments: _arguments
    }).send({
        gas: 5000000,
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
            console.log("New Contract Instance: " + newContractInstance.options.address);
        });
    return newContractInstance;
}