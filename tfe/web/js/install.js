function install() {
    //Desplegamos el UniversityPlatform
    return deployContract('UniversityPlatform', accountPlataforma, ABI_UniversityPlatform,
        DATA_UniversityPlatform).then(z => {
            console.log(z._address);
            accountSCPlataforma = z._address;
            return z.methods.getECTSTokenAddress().call({
                from: accountPlataforma,
                gas: 300000
            }).then(v => {
                console.log(v);
                if (v){
                    localStorage.setItem('accountSCPlataforma', accountSCPlataforma);
                    localStorage.setItem('accountSCECTSToken', v);
                    return true;
                }else{
                    return false;
                }
            });
        });
}