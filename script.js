const processor = {
    r:[0,0,0,0],
    pc:0,
    cir:0,
    m:[0,0,0,0],
    halted:false,
    instructions:[],
    OPCODE_SIZE: 2,
    ADDRESS_MODES: 3,

    loadInstructions(instructions){
        this.instructions = instructions;
        this.PC = 0;
        this.halted = false;
        txtArea_output.value = instructions.join('\n');
    },

    get r_bits() {
        return Math.ceil(Math.log2(this.r.length));
        },
    get m_bits(){
        return Math.ceil(Math.log2(this.m.length))
    },

        
    get instructionSize(){
        return this.OPCODE_SIZE + Math.ceil(Math.log2(this.ADDRESS_MODES)) + this.r_bits + this.m_bits;
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

    getOperand2(addressMode, op2str) {
        switch (addressMode) {
            case 0:
                throw new Error("Not implemented");
            case 1: // Register
                var n = parseInt(op2str.substring(1),2);
                return this.getRegisterValue(n);
            case 2: // Memory
                var n = parseInt(op2str,2);
                return this.getMemoryValue(n);
            default:
                throw new Error("Invalid address mode");
        }
    },

    reset() { // Set registers to 0 and clear instructions
        this.PC = 0;
        this.CIR = 0;
        for (let i = 0; i < this.r.length; i++) {
            this.setRegister(i, 0);
        }
        txtArea_output.value = "";
        this.instructions = [];
    },

    add(addressMode, regNum, op2str){
        const x = this.getRegisterValue(regNum);
        const y = this.getOperand2(addressMode, op2str);
        this.setRegister(regNum,x+y);
    },
    mov(addressMode,regNum,op2str){
        const val = this.getOperand2(addressMode,op2str);
        this.setRegister(regNum,val);
    },
    halt(){ // Reset processor
        this.reset();
        this.halted = true; // Set halted to true - once halted cannot run until instructions restored
    },

    runCycle(){
        if(this.halted){
            return;
        }
        this.CIR = this.instructions[this.PC]
        this.PC += 1
        const opcode = this.CIR.substring(0,2) // TODO Convert this to constant OPCODE_SIZE
        const addressMode = parseInt(this.CIR.substring(2,4),2); //Convert to number from binary string
        const regNum = parseInt(this.CIR.substring(4,6),2); //Parse as binary
        const op2str = this.CIR.substring(6);
        switch (opcode) {
            case '01':
                this.add(addressMode,regNum,op2str);
                break;
            case '10':
                this.mov(addressMode,regNum,op2str);
                break;
        
            default:
                this.halt();
                break;
        }
    }

};

function run(){

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
        return regNum.toString(2).padStart(processor.r_bits,'0')
    }
    else{
        throw new Error("Invalid regiser number");
    }
}

function parseOperand2(op2String,opcode){ // TODO: Make opcode and address mode smarter
    let operand2;
    let addressMode;
    if(op2String[0] == 'R'){
        addressMode = '01' // Register contents
        if(opcode == '11'){ // Str requires second operand to be mref
            throw new Error("Str requires a memory address as second operand")
        }
        else{
            operand2 = parseRegister(op2String);
        }
    }
    else{
        addressMode = '10' // Mref
        operand2 = parseInt(op2String);
        if(!isValidMref(operand2)){
            throw new Error("Not a valid memory address");
        }
        operand2 = operand2.toString(2).padStart(processor.m_bits,'0');
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
            return '0'; // Ignore everything else
        case 'ADD':
            opcode = '01';
            break;
        case 'MOV':
            opcode = '10';
            break;
        case 'STR':
            opcode = '11';
            break;    
        default:
            return null; // Not valid
    }
    if (operands.length != 2){ // Needs 2 arguments
        throw new Error("Invalid syntax");
    }
    let registerNum = parseRegister(operands[0])
    let op2Details = parseOperand2(operands[1],opcode);
    return opcode + op2Details.adrMode + registerNum + op2Details.op2
}

function assemble(){
    txtArea_output.innerHTML = "";
    const text = code_input.value;
    const lines = text.split('\n');
    const instructions = [];
    for (const line of lines) {
        try {
            const byteCode = parseLine(line);
            instructions.push(byteCode);        
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
    processor.halted = false;
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
    processor.runCycle();
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