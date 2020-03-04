pragma solidity 0.6.0;

import "./UniversityPlatform.sol";
import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "./openzeppelin/GSN/Context.sol";

/**
 * @dev El SM Students se encarga de la gestión de los estudiantes.
 * El estudiante comprará ECTSToken que luego intercambiará por matriculas en asignaturas mediante un deposito en la universidad
 */
contract Student is Context {
    
    //Campos de información privados
    address private _accountOwner; //Cuenta de estudiante propietaria de la instancia
    string private _name; //Nombre del estudiante


    
    // Objectos privados que apuntan a los SC relacionados
    ECTSToken private _token;
    UniversityPlatform private _univPlatform;
    
    // Events
    
    
    /**
     * @dev Inicializa el contrato apuntando a los SC que se relacionan con este.
     * @param addressUnivPlatform Es una address payable que apunta al SC que administra toda la plataforma
     * @param addressToken Es la address del ECTSToken desplegado por la plataforma para los pagos
     */
    constructor(address payable addressUnivPlatform, address addressToken) public{
        _token = ECTSToken(addressToken);
        _univPlatform = UniversityPlatform(addressUnivPlatform);
    }
    
    // Para poder acceder rapidamente a la informacion de un estudiante
    mapping(address => Student) _students;
    
    /**
     * @dev Devuelve el nombre del estudiante
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Devuelve la cuenta propietaria de la instancia del smart contract
     */
    function accountOwner() public view returns (address) {
        return _accountOwner;
    }

    //TODO: Recargar deposito. Cuando se recarga deposito mejor guardar en una variable dado una cuenta de cliente -> cuentas universidad -> cantidad
    //TODO: Get lista depositos
    //TODO: Matricular en una asignatura. Guardar un mapping cuenta usuario -> cuenta token asignatura de las asignaturas en las que estoy matriculado.
    
}
