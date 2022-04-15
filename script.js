"use strict";

class instruction{
    constructor(opcode, addressMode, regNum, op2){
        this.opcode = opcode;
        this.addressMode = addressMode;
        this.regNum = regNum;
        this.operand2 = op2;
    }
    OPCODE_SIZE = 2;
    ADDRESS_MODES = 3;

    static get haltInstr(){
        return new instruction(0,0,0,0);
    }
    static get Op2Size(){
        return Math.max(processor.r_bits, processor.m_bits);
    }

    static get maxOp2Value(){
        return Math.pow(2, instruction.Op2Size);
    }

    get instructionSize(){
        return this.OPCODE_SIZE + numBits(this.ADDRESS_MODES) + processor.r_bits + instruction.Op2Size;
    }
    static getBinaryRepresentation(num, length){
        return num.toString(2).padStart(length,'0');
    }

    toString(){
        return instruction.getBinaryRepresentation(this.opcode, this.OPCODE_SIZE) 
        + instruction.getBinaryRepresentation(this.addressMode,numBits(this.ADDRESS_MODES)) 
        + instruction.getBinaryRepresentation(this.regNum,processor.r_bits) 
        + instruction.getBinaryRepresentation(this.operand2,instruction.Op2Size);
    }
}

function numBits(n){
    return Math.ceil(Math.log2(n));
}

const processor = {
    r:[0,0,0,0],
    pc:0,
    cir:'0',
    m:[0,0,0,0],
    halted:false,
    instructions:[],

    loadInstructions(instructions){
        this.instructions = instructions;
        this.PC = 0;
        this.halted = false;
        txtArea_output.value = instructions.map(instr => instr.toString()).join('\n');
    },

    get r_bits() {
        return numBits(this.r.length);
        },
    get m_bits(){
        return numBits(this.m.length);
    },


    get PC(){
        return this.pc;
    },
    set PC(val){
        this.pc = val;
        pc.innerHTML = val;
    },


    get CIR(){
        return this.cir;
    },
    set CIR(val){
        this.cir = val;
        cir.innerHTML = val;
    },


    getRegisterValue(n){
        return this.r[n]
    },
    setRegister(n,val){
        this.r[n] = val;
        registers.forEach(
            element =>{
                if(element.id == 'r' + n.toString()){
                    element.innerHTML = val;
                }
            }
        );
    },


    getMemoryValue(n){
        return this.m[n];
    },
    setMemory(n,val){
        this.m[n] = val;
        memoryInputs.forEach(
            element => {
                if(element.id == 'm' + n.toString()){
                    element.value = val;
                }
            }
        );
    },

    getOperand2(addressMode, op2) {
        switch (addressMode) {
            case 0: // Immediate addressing
                return op2;
            case 1: // Register
                return this.getRegisterValue(op2);
            case 2: // Direct addressing
                return this.getMemoryValue(op2);
            default:
                throw new Error("Invalid address mode");
        }
    },

    reset() { // Set registers to 0 and clear instructions
        this.PC = 0;
        this.CIR = '0';
        this.halted = false;
        for (let i = 0; i < this.r.length; i++) {
            this.setRegister(i, 0);
        }
        txtArea_output.value = "";
        this.instructions = [];
    },

    add(regNum, op2){
        const x = this.getRegisterValue(regNum);
        this.setRegister(regNum,x+op2);
    },
    mov(regNum,op2){
        this.setRegister(regNum,op2);
    },
    halt(){ // Reset processor
        this.reset();
        this.halted = true; // Set halted to true - once halted cannot run until instructions restored
    },

    store(regNum, mref){
        const x = this.getRegisterValue(regNum);
        this.setMemory(mref,x);
    },

    runCycle(){
        if(this.halted){
            return;
        }
        const instr = this.instructions[this.PC]
        this.CIR = instr.toString();
        this.PC += 1
        const opcode = instr.opcode;
        const addressMode = instr.addressMode;
        const regNum = instr.regNum;
        const op2 = this.getOperand2(addressMode, instr.operand2);
        switch (opcode) {
            case 0:
                this.halt();
            case 1:
                this.add(regNum,op2);
                break;
            case 2:
                this.mov(regNum,op2);
                break;
            case 3:
                this.store(regNum,instr.operand2);
                break;       
            default:
                this.halt();
                break;
        }
    }

};

function run(){ // TODO : Implement run all

}

function isValidRegister(num){
    if(isNaN(num) || num >= processor.r.length){
        return false;
    }
    else{
        return true;
    }
}

function isValidMref(num){
    if(isNaN(num) || num >= processor.m.length){
        return false;
    }
    else{
        return true;
    }
}
function parseRegister(regString){
    if(regString[0] != 'R'){
        throw new Error("Not a register");
    }
    let regNum = parseInt(regString.substring(1))
    if(isValidRegister(regNum)){
        return regNum
    }
    else{
        throw new Error("Invalid regiser number");
    }
}

function parseOperand2(op2String,opcode){
    let operand2;
    let addressMode;
    if(op2String[0] == 'R'){
        addressMode = 1; // Register contents
        if(opcode == 3){ // Str requires second operand to be mref
            throw new Error("Str requires a memory address as second operand")
        }
        else{
            operand2 = parseRegister(op2String);
        }
    }
    else if(op2String[0] == '#'){
        addressMode = 0;
        if(opcode == 3){ // Str requires second operand to be mref
            throw new Error("Str requires a memory address as second operand")
        }
        operand2 = parseInt(op2String.substring(1));
        if (operand2 > instruction.maxOp2Value){
            throw new Error("Operand 2 is too large to use immediate addressing");
        }

    }
    else{
        addressMode = 2 // Mref
        operand2 = parseInt(op2String);
        if(!isValidMref(operand2)){
            throw new Error("Not a valid memory address");
        }
    }
    return {op2: operand2, adrMode : addressMode};
}

function parseLine(expr){
    const parts = expr.toUpperCase().split(" ") // Split by spaces
    const op = parts[0];
    const operands = parts.slice(1); // Array of operands
    let opcode;
    switch (op) {
        case 'HLT':
            return instruction.haltInstr; // Ignore everything else
        case 'ADD':
            opcode = 1;
            break;
        case 'MOV':
            opcode = 2;
            break;
        case 'STR':
            opcode = 3;
            break;    
        default:
            throw Error("Not valid operation"); // Not valid
    }
    if (operands.length != 2){ // Needs 2 arguments
        throw new Error("Invalid syntax");
    }
    let registerNum = parseRegister(operands[0])
    let {op2,adrMode} = parseOperand2(operands[1],opcode);
    return new instruction(opcode,adrMode,registerNum,op2);
}

function assemble(){
    txtArea_output.innerHTML = "";
    const text = code_input.value;
    const lines = text.split('\n');
    const instructions = [];
    for (const line of lines) {
        try {
            const instruction = parseLine(line);
            instructions.push(instruction);        
        }
        catch (err) {
            console.error(err);
            return;
            // TODO Display error message            
        }
    }
    processor.loadInstructions(instructions);
}

function reset(){
    processor.reset();
    for (let i = 0; i < processor.m.length; i++){
        processor.setMemory(i,0);
    }
}

function autoResize(){
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}

function memoryChanged(){
    const address = parseInt(this.id[1]);
    const temp = parseInt(this.value);
    if(isNaN(temp)){
        this.value = processor.m[address];
    }
    else{
        processor.m[address] = temp;
    }
}

function btn_runClicked(){
    try{
        processor.runCycle();
    }
    catch(err){ // TODO Display error
        console.error(err);
        processor.halt();
    }
}

const code_input = document.getElementById("code_input");
const txtArea_output = document.getElementById("output");
const pc = document.getElementById("pc");
const cir = document.getElementById("cir")
const textareas = document.querySelectorAll("textarea"); //Get all the textarea and attach listeners
textareas.forEach(element => {
    element.addEventListener('change',autoResize);
});
const memoryInputs = document.querySelectorAll(".mem_input");
memoryInputs.forEach(element =>{
    element.addEventListener('change',memoryChanged);
});

const btn_assemble = document.getElementById("btn_assemble")
btn_assemble.addEventListener('click',assemble)

const btn_run = document.getElementById('btn_run');
btn_run.addEventListener('click',btn_runClicked);

const registers = document.querySelectorAll('.register');
reset();