pragma solidity ^0.6.0;

import "./openzeppelin/token/ERC721/ERC721Metadata.sol";
import "./openzeppelin/ownership/Ownable.sol";
import "./Limitable.sol";
import "./Expirable.sol";

contract SubjectToken is ERC721Metadata , Ownable, Expirable, Limitable {
    
    event SubjectMinted(address _to);
    event CreateNewSubject(address scAddress, string name, string symbol, string descriptionURI);
    event SubjectApproved(uint256 _id);
    event ActivityAdded(uint256 _id, string name);
    
    struct Activity {
      string name; //Nombre de la prueba, por ejemplo "Examen 16/04/20"
      string mark; //Nota obtenida en la prueba, dejo texto porque habrá quien puntue con números y otros digan aprobado
    }

    uint256 public lastTokenIndex;
    
    // Precio del SubjectToken
    uint256 private _price;
    
    // Control de si una matrícula está aprobada o no
    mapping (uint256 => bool) private _subjectApproved;
    
    // Mapeo de las pruebas realizadas en una asignatura
    mapping (uint256 => Activity[]) private _activities;

    constructor(string memory name, string memory symbol, uint256 limitmint, uint256 expirationtime, uint256 price, string memory descriptionURI)
        public ERC721Metadata(name, symbol) Limitable(limitmint) Expirable(expirationtime) {
        require(bytes(name).length > 0, "SubjectToken: name is empty");
        require(bytes(symbol).length > 0, "SubjectToken: symbol is empty");
        require(limitmint > 0, "SubjectToken: limit of minted tokens is 0");
        require(expirationtime > block.timestamp, "SubjectToken: expiration time is before today");
        require(price > 0, "SubjectToken: price is 0");
        
        _price = price;
        _setBaseURI(descriptionURI);
        emit CreateNewSubject(address(this), name, symbol, descriptionURI);
    }
    
    /**
     * @dev Devuelve el precio del SubjectToken.
     * @return uint256 con el valor del precio
     */
    function price() external view returns (uint256) {
        return _price;
    }

    /**
     * @dev Genera un nuevo token de la asignatura y pone de propietario al alumno que se ha matriculado. Únicamente permite
     * que el alumno se matricule una vez en la asignatura.
     */
    function mint(address to) public onlyOwner belowLimit onTime returns(uint256) {
        require(balanceOf(to)<1, "SubjectToken: this student is already enrolled");
        increase();
        _safeMint(to,lastTokenIndex+1);
        lastTokenIndex = lastTokenIndex + 1;
        emit SubjectMinted(to);
        return lastTokenIndex - 1;
    }

    /**
     * @dev Nos permite asociar una URI a la asignatura, por ejemplo una URI que nos lleve al temario de la asignatura.
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyOwner {
        _setTokenURI(tokenId,_tokenURI);
    }
    
    /**
     * @dev Nos permite marcar una asignatura como aprobada una vez el alumno la ha superado
     */
    function setSubjectApproved(uint256 tokenId) public onlyOwner {
        _subjectApproved[tokenId] = true;
        emit SubjectApproved(tokenId);
    }
    
    /**
     * @dev Nos permite comprobar si una asignatura está aprobada
     */
    function isSubjectApproved(uint256 tokenId) public view returns (bool) {
        return _subjectApproved[tokenId];
    }
    
    /**
     * @dev Nos permite crear una actividad asociada a la cadena, por ejemplo un examen, introduciendo su nombre,
     * las urls de los documentos asociados a la asignatura y la nota obtenida
     */
    function addActivityDone(uint256 tokenId, string memory name, string memory mark) public onlyOwner {
        _activities[tokenId].push(Activity(name, mark));
        emit ActivityAdded(tokenId, name);
    }
    
    /**
     * @dev Nos permite recuperar el número de actividades que se han informado de esta asignatura realizadas por el alumno.
     */
    function getActivitiesCount(uint256 tokenId) public view returns (uint256){
        return _activities[tokenId].length;
    }
    
    /**
     * @dev Nos permite recuperar de una actividad concreta el nombre y la calificación que obtuvo el alumno
     */
    function getActivity(uint256 tokenId, uint256 index) public view returns (string memory, string memory){
        Activity memory _activity = _activities[tokenId][index];
        return (_activity.name, _activity.mark);
    }
    
    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     * ADDED: Sobreescribimos la función para exigir que la universidad puede transferir a quien quiera, pero los demás sólo a ella
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require((from == owner()) || (to == owner()), "SubjectToken: student only can transfer to university");
        super.transferFrom(from, to, tokenId);
    }
    
    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * ADDED: Sobreescribimos la función para exigir que la universidad puede transferir a quien quiera, pero los demás sólo a ella
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        require((from == owner()) || (to == owner()), "SubjectToken: student only can transfer to university");
        super.safeTransferFrom(from, to, tokenId);
    }
    
    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the _msgSender() to be the owner, approved, or operator
     * ADDED: Sobreescribimos la función para exigir que la universidad puede transferir a quien quiera, pero los demás sólo a ella
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
        require((from == owner()) || (to == owner()), "SubjectToken: student only can transfer to university");
        super.safeTransferFrom(from, to, tokenId, _data);
    }
    
    /**
     * @dev Sets or unsets the approval of a given operator
     * An operator is allowed to transfer all tokens of the sender on their behalf.
     * ADDED: Sobreescribimos la función para exigir que el estudiante únicamente pueda aprobar a la universidad
     * @param operator operator address to set the approval
     * @param approved representing the status of the approval to be set
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        require(operator == owner(), "SubjectToken: student only can approve to university");
        super.setApprovalForAll(operator, approved);
    }
    
    /**
     * @dev Approves another address to transfer the given token ID
     * The zero address indicates there is no approved address.
     * There can only be one approved address per token at a given time.
     * Can only be called by the token owner or an approved operator.
     * ADDED: Sobreescribimos la función para exigir que el estudiante únicamente pueda aprobar a la universidad
     * @param to address to be approved for the given token ID
     * @param tokenId uint256 ID of the token to be approved
     */
    function approve(address to, uint256 tokenId) public virtual override {
        require(to == owner(), "SubjectToken: student only can approve to university");
        super.approve(to, tokenId);
    }
}