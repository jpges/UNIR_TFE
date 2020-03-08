function install() {
    //Desplegamos el UniversityPlatform
    return deployContract('UniversityPlatform', accountPlataforma, ABI_UniversityPlatform,
        DATA_UniversityPlatform).then(z => {
            accountSCPlataforma = z._address;
            z.methods.getECTSTokenAddress().call({
                from: accountPlataforma,
                gas: 30000
            }).then(v => {
                localStorage.setItem('accountSCPlataforma', accountSCPlataforma);
                localStorage.setItem('accountSCECTSToken', v);
                return true;
            });
            return true;
        });
}