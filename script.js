const processor = {
    r:[0,0,0,0],
    pc:0,
    cir:0,
    mar:0,



};



function run(){

}

function getByteCode(expr){
    const op = expr.substring(0,3)
    console.log(op)
}

function assemble(){
    const code_input = document.getElementById("code_input");
    const text = code_input.value;
    const lines = text.split('\n');
    for (const line of lines) {
        const byteCode = getByteCode(line)
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