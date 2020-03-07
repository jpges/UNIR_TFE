function install() { 
    //Desplegamos el ECTSToken
    return deployContract('ECTSToken', accountPlataforma, ABI_ECTSToken, DATA_ECTSToken).then(v => {
        accountSCECTSToken = v._address;
        localStorage.setItem('accountSCECTSToken', accountSCECTSToken);
        //Desplegamos el UniversityPlatform
        return deployContract('UniversityPlatform',accountPlataforma, ABI_UniversityPlatform,
        DATA_UniversityPlatform, [accountSCECTSToken]).then(z => {
            accountSCPlataforma = z._address;
            localStorage.setItem('accountSCPlataforma', accountSCPlataforma);
            return true;
        });
    });        
}