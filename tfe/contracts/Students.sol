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

    /*
    * Para obtener la informacion del nombre de un alumno a partir de su direccion
    */
    function getStudentName(address account) public view onlyRegistredUser returns (string memory){
        return _students[account].name;
    }

    //TODO: Recargar deposito. Cuando se recarga deposito mejor guardar en una variable dado una cuenta de cliente -> cuentas universidad -> cantidad
    //TODO: Get lista depositos
    //TODO: Matricular en una asignatura. Guardar un mapping cuenta usuario -> cuenta token asignatura de las asignaturas en las que estoy matriculado.
    
}
