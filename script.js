const processor = {
    r:[0,0,0,0],
    pc:0,
    cir:0,
    mar:0,
    memory:[0,0,0,0],
    get r_bits() {
        return Math.ceil(Math.log2(this.r.length));
        },
    get m_bits(){
        return Math.ceil(Math.log2(this.memory.length))
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
    if(isNaN(num) || num >= processor.memory.length){
        return false;
    }
    else{
        return true;
    }
}

function parseOperand2(op2String,opcode){
    let operand2;
    let n;
    if(op2String[0] == 'R'){
        n = processor.r_bits;
        if(opcode == '11'){ // Str requires second operand to be mref
            return null;
        }
        else{
            operand2 = parseInt(op2String.substring(1))
            if(!isValidRegister(operand2)){
                return null;
            }
        }
    }
    else{
        n = processor.m_bits;
        operand2 = parseInt(operands[1]);
        if(!isValidMref(operand2)){
            return null;
        }
    }
    return operand2.toString(2).padStart(n); // Ensure it is padded to right size
}

function parseLine(expr){
    const parts = expr.toUpperCase().split(" ") // Split by spaces
    const op = parts[0];
    const operands = parts.slice(1); // Array of operands
    let opcode;
    let addressMode;
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
        return null
    }
    if(operands[0][0] != 'R'){
        return null;
    }
    let registerNum = parseInt(operands[0].substring(1))
    if(!isValidRegister(registerNum)){
        return null;
    }
    let operand2 = parseOperand2(operands[1],opcode);
}

function assemble(){
    const code_input = document.getElementById("code_input");
    const text = code_input.value;
    const lines = text.split('\n');
    for (const line of lines) {
        const byteCode = parseLine(line);
        if(byteCode == null){
            alert("Could not parse");
            return;
        }
        alert(byteCode)

    }
}

function autoResize(){
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}


const textareas = document.querySelectorAll("textarea"); //Get all the textarea and attach listeners
textareas.forEach(element => {
    element.addEventListener('input',autoResize);
});

const btn_run = document.getElementById("btn_run")
btn_run.addEventListener('click',assemble)