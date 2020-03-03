pragma solidity ^0.4.24;
contract Asignatura is ERC721{
    
    struct Asignatura{
        string name; // Nombre de la asignatura
        uint ECTS; // Item Level
        uint Activa;  // 1 = Activa, 2 = Cancelada
    }
    
    Asignatura[] public asignaturas; // La primera asignatura tiene indice 0
    address public universidad_propietaria;
    
    function Asignatura() public {
        universidad_propietaria = msg.sender; // The Sender is the Owner; Ethereum Address of the Owner
    }
    
    function createItem(string _name, uint ects) public{
        require(universidad_propietaria == msg.sender); // Solo la universidad puede crear asignaturas
        uint id = asignaturas.length; // Item ID = Length of the Array Items
        asignaturas.push(Asignatura(_name,ects,1)) // Asignatura ("Matemáticas",10,1)
        
    }
    
    function asignar_a_alumno(uint id, address _to){
        _mint(_to,id); // Asigno la asingtura al alumna que la ha contratado
    }
}