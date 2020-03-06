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