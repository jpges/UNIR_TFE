
function loginEstudiante(){
    location.replace("estudiantes.html");
    var address = document.getElementById("inputAccount").value;
  	var pss = document.getElementById("inputPassword").value;
  	try{
  		web3.personal.unlockAccount(address, pss, 0);
  		var exist = plataforma.existeEmpleado.call(address, {from: accounts[0], gas:30000});
  			if (exist){
  	    		localStorage.setItem("inputAccount", address);
  				location.replace("estudiantes.html");
  			}else{
  				alert("La cuenta de estudiante indicada no existe en el sistema");
  			}
  	}catch(error) {
  		alert("¡Contraseña incorrecta!");
  	}
  }

function encadenar(){
    var consola = document.getElementById('consola').innerHTML;
    document.getElementById('consola').innerHTML = consola.concat('ashkjdjl asdsad lkjlkasjd laksjda sdlkajsdlk jasldkja slkdjas dlkasjd laksdj');
}