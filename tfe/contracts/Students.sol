pragma solidity 0.6.0;

import "./UniversityPlatform.sol";
import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "./openzeppelin/GSN/Context.sol";

/**
 * @dev El SM Students se encarga de la gestión de los estudiantes.
 * El estudiante comprará ECTSToken que luego intercambiará por matriculas en asignaturas mediante un deposito en la universidad
 */
contract Students is Context {
    
    /*
    * @dev Struct que almacena la información de un estudiante
    */
    struct Student {
      address account;
      string name;
      bool isValue;
    }
    
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
    
}
