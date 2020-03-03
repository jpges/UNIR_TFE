pragma solidity ^0.4.25;

contract Empresas {
    
    struct Empresa {
      address cuenta;
      string nombre;
      string cif;
      bool isValue; // para comprobar que existe la empresa
    }
    
    // Para poder acceder rapidamente a la informacion de una empresa a partir de su direccion
    mapping(address => Empresa) empresas;
    // Para obtener un listado por el que iterar con todas las direcciones de las empresas existentes
    address[] empresasList;
    
    
    /*
    * Para comprobar que el msg.sender es una empresa existente en el sistema
    */
    modifier esEmpresaValida(address _cuenta){
        if(empresas[_cuenta].isValue){
            _;
        }
    }
    
    
    /*
    * Para obtener una lista con todas las direcciones de empresas en la que iterar
    */
    function listarEmpresas() public view returns (address[]) {
        return empresasList;
    }
    
    
    /*
    * Para obtener la informacion del nombre de una empresa a partir de su direccion
    */
    function getEmpresaNombre(address _cuenta) public view esEmpresaValida(_cuenta) returns (string){
        return (empresas[_cuenta].nombre);
    }
    
    
    /*
    * Para obtener la informacion del cif de una empresa a partir de su direccion
    */
    function getEmpresaCIF(address _cuenta) public view esEmpresaValida(_cuenta) returns (string){
        return (empresas[_cuenta].cif);
    }
    
    
     /*
    * Comprobar si existe una empresa en el sistema a partir de una direccion valida
    */
    function existeEmpresa(address _cuenta) public view returns (bool){
        return (empresas[_cuenta].isValue);
    }
    
}