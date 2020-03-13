function install() {
    //Desplegamos el UniversityPlatform
    return deployContract('ECTSToken', accountPlataforma, ABI_ECTSToken,
        DATA_ECTSToken).then(z => {
            accountSCECTSToken = z._address;
            localStorage.setItem('accountSCECTSToken', accountSCECTSToken);
            return deployContract('UniversityPlatform', accountPlataforma, ABI_UniversityPlatform, DATA_UniversityPlatform, [accountSCECTSToken])
                .then(v => {
                    accountSCPlataforma = v._address;
                    localStorage.setItem('accountSCPlataforma', accountSCPlataforma);
                    SCECTSToken = new web3.eth.Contract(ABI_ECTSToken, accountSCECTSToken);
                    return SCECTSToken.methods.transferOwnership(accountSCPlataforma).send({
                        gas: 3000000,
						from: accountPlataforma
					}).then( n => {
                        return true;
                    });
                });
        }).catch(err => {
            console.log(err);
            return false;
        });
}