const Calculadora = artifacts.require("./Calculadora.sol");

//const TruffleAssert = require('truffle-assertions');
//const Math = require('mathjs');

contract("Calculadora", accounts => {

	var calc;

	beforeEach("Deploy", async function() {
		if(!calc)
		{
			calc = await Calculadora.deployed();
			console.log("Calculadora Desplegada");
		}
	});

	afterEach("Exit", async function() {
		await calc.borrarMemoria();
		console.log("Memoria Borrada");
	});

	it("Memoria", async () => {
		var result = 0;
		await calc.almacenaMemoria(23, {from: accounts[0]});
		result = await calc.obtenerMemoria({from: accounts[0]});
		assert.equal(result, 23);
	});

	it("suma", async () => {
		var result = 0;
		result = await calc.suma(2, 5);
		assert.equal(result, 7);
	});

	it("resta", async () => {
		result = await calc.resta(4, 2);
		assert.equal(result, 2);
	});

	it("sumaMemoria", async () => {
		var result = 0;
		await calc.almacenaMemoria(22, {from: accounts[0]});
		result = await calc.sumaMemoria(5, {from: accounts[0]});
		assert.equal(result, 27);
	});

	it("restaMemoria", async () => {
		await calc.almacenaMemoria(7, {from: accounts[0]});
		var txdivcero = await calc.restaMemoria(5, {from: accounts[0]});
		assert.equal(result, 2);
	});
	/*
	await calc.almacenaMemoria(4, {from: accounts[0]});
	var tx = await calc.divideMemoria(2, {from: accounts[0]});

	TruffleAssert.eventEmitted(tx, 'DivisionPorCero', (ev) => {
		var isemitted = ev[0] == accounts[0] && ev[1] == 2;
		return isemitted;
	});
	*/
});