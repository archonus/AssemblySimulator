const processor = {
    r:[0,0,0,0],
    pc:0,
    cir:0,
    mar:0,
    m:[0,0,0,0],
    get r_bits() {
        return Math.ceil(Math.log2(this.r.length));
        },
    get m_bits(){
        return Math.ceil(Math.log2(this.m.length))
    },
    getRegister(n){
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
    getMemory(n){
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
    instructions:[]

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
        operand2 = operand2.toString(2).padStart(processor.m_bits);
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
            return 0; // Ignore everything else
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
    processor.instructions = instructions;
    txtArea_output.value = instructions.join('\n')

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

const code_input = document.getElementById("code_input");
const txtArea_output = document.getElementById("output");
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

const registers = document.querySelectorAll('.register')
for (let i = 0; i < processor.r.length; i++){
    processor.setRegister(i,0); 
}
for (let i = 0; i < processor.m.length; i++){
    processor.setMemory(i,0);
}