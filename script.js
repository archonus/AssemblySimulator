const processor = {
    r:[0,0,0,0],
    pc:0,
    cir:0,
    mar:0,

};



function run(){

}

function parseLine(expr){
    const parts = expr.split(" ")
    const op = parts[0];
    const operands = parts.slice(1); // Array of operands
    let opcode;
    switch (op) {
        case 'HLT':
            return 0; // Ignore everything else
        case 'ADD':
            opcode = 0b1;
            break;
        case 'MOV':
            opcode = 0b10;
            break;
        case 'STR':
            opcode = 0b11;
            break;    
        default:
            return null; // Not valid
    }
    if (operands.length != 2){ // Needs 2 arguments
        return null
    }
    let operand1 = parseInt(operands[0].substring(1))
    let operand2 = parseInt(operands[1].substring(1))
    if (isNaN(operand1) || isNaN(operand2)){
        return null
    }
    
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