const { readFileSync } = require('fs');



/* Pre-defined Address */ 
const builtInRAdresses = () => {
    const rAddresses = new Array(16);
    for( let i=0; i< rAddresses.length; i++ ){
        rAddresses[i] = [`R${i}`, i]
    }
    return Object.fromEntries(rAddresses);
}

const ramAddressTable = {
    SP : 0,
    LCL: 1,
    ARG: 2,
    THIS: 3,
    THAT: 4,
    ...builtInRAdresses(),
    SCREEN: 16384,
    KBD: 24576
}

const C_COMP_TABLE = {
    '0': '0101010',
    '1': '0111111',
    '-1': '0111010',
    'D': '0001100',
    'A': '0110000',
    'M': '1110000',
    '!D': '0001111',
    '!A': '0110001',
    '!M': '1110001',
    '-D': '0001111',
    '-A': '0110011',
    '-M': '1110011',
    'D+1': '0011111',
    'A+1': '0110111',
    'M+1': '1110111',
    'D-1': '0001110',
    'A-1': '0110010',
    'M-1': '1110010',
    'D+A': '000010',
    'D+M': '100010',
    'D-A': '0010011',
    'D-M': '1010011',
    'A-D': '0000111',
    'M-D': '1000111',
    'D&A': '0000000',
    'D&M': '1000000',
    'D|A': '0010101',
    'D|M': '1010101'
}
const C_DEST_TABLE = {
    'M': '001',
    'D': '010',
    'MD': '011',
    'A': '100',
    'AM': '101',
    'AD': '110',
    'AMD': '111'
}

const C_JUMP_TABLE = {
    'JGT': '001',
    'JEQ': '010',
    'JGE': '011',
    'JLT': '100',
    'JNE': '101',
    'JLE': '110',
    'JMP': '111'
}
/* Reading File */
const getFileFromInput = () => {
    if(process.argv.length < 3 ){
        return new Error("File has not been passed in corretly");
    }
    const assemblyCode = process.argv[2];
    return readFileSync(assemblyCode, {encoding:'utf8', flag:'r'});
}

function Token(type, value){
    // Type of Command
    this.type = type;
    // Command
    this.value = value;
}
// input assebmly instructions
// output hack binary
function Parser (instructions) {
    this.instructions = instructions;
    this.nextAvailableAddress = 16;
    this.output = '';
    this.tokens = [];
    this.isAInstruction = (instruction) => instruction.includes("@");
    this.isCInstruction = (instruction) => instruction.includes("=") || instruction.includes(";");
    this.symbolMemmoryRegister = (symbol) => {
        let usedAddress = Object.values(ramAddressTable);
        if(!(symbol in ramAddressTable)){
            ramAddressTable[symbol] = this.nextAvailableAddress;
            this.nextAvailableAddress++;
            // So it doesent overwrite current address that are used up
            if(usedAddress.includes(this.nextAvailableAddress)){
                this.nextAvailableAddress++;
            }
        }
        return symbol;
    };
    this.isWhiteSpaceOrComments = (instruction) => instruction.includes("//") || instruction === " ";
    this.tokenType = (instructionLine) => {
        if(this.isAInstruction(instructionLine)){
            return 'A_INSTRUCTION';
        }else if(this.isCInstruction(instructionLine)){
            return 'C_INSTRUCTION';
        }
        return 'WHITE_SPACE';
    }
    this.stripAwayComments = (instruction) => {
        const INDEX_OF_COMMENT = instruction.indexOf("//");
        // make everything after comments whitespace
        let textArray = instruction.split('');
        textArray.splice(INDEX_OF_COMMENT, textArray.length, '');
        return textArray.join('')
        
    }
    this.Tokenizer = () => {
        // split on new line
        const fileContents = this.instructions.split('\n');
        // loop through content and determine what current command is
        // and create tokens based on that 
        // a Token will have the type, value
        let instructionCounter = 0;
        while(instructionCounter < fileContents.length){
            const currentInstruction = fileContents[instructionCounter].includes("//") ? 
            this.stripAwayComments(fileContents[instructionCounter]) : fileContents[instructionCounter];

            const TokenType = this.tokenType(currentInstruction);
            this.tokens.push(new Token(TokenType, currentInstruction));  
            instructionCounter++;    
        };
        return 0;
    };
    // Doing first pass to register all Symbols in mem address
    this.firstPassForSymbols = () => {
        const fileContents = this.instructions.split('\n');
        let instructionCounter = 0;
        while(instructionCounter < fileContents.length){
            const currentInstruction = fileContents[instructionCounter].includes("//") ? 
            this.stripAwayComments(fileContents[instructionCounter]) : fileContents[instructionCounter];
            const isSymbol = currentInstruction.includes("@") || currentInstruction.includes("(");
            if(isSymbol){
                const cleanedSymbol = currentInstruction
                .replace("@", "")
                .replace("(", "")
                .replace(")", "")
                .trim();
                const symbol = this.symbolMemmoryRegister(cleanedSymbol);
                const address = ramAddressTable[symbol];
                fileContents[instructionCounter] = `@${address}`;
            }
            instructionCounter++;
        }
        this.instructions = fileContents.join("\n");
        return 0;
    }
    this.handleABinary = (AInstruction) => {
        const address = AInstruction.split("@")[1];
        const addressToBinary = parseInt(address).toString(2);
        const numberOfZeros = addressToBinary.length;
        return [ ...Array(16-numberOfZeros).fill(0), addressToBinary].join('');
    }
    this.handleCBinary = (CInstruction) => {
        const C_BINARY_HEAD = '111';
        const InstructionSplit = CInstruction.split('=');
        const INSTRUCTION_LEFT_SIDE = InstructionSplit[0];
        const INSTRUCTION_RIGHT_SIDE = InstructionSplit[1];
        const dest = () => {
            if(INSTRUCTION_LEFT_SIDE in C_DEST_TABLE){
                return C_DEST_TABLE[INSTRUCTION_LEFT_SIDE];
            }
            throw Error('C Instruction is not in DEST Table', INSTRUCTION_LEFT_SIDE);
        }

        const comp = () => {
            const COMP = INSTRUCTION_RIGHT_SIDE.split(';')[0];
            if(COMP in C_COMP_TABLE){
                return C_COMP_TABLE[COMP];
            }
            return Error('C Instruction is not in DEST Table', COMP);
        } 
        const jump = () => {
            const JUMP = INSTRUCTION_RIGHT_SIDE.split(';');
            if(JUMP.length < 2){
                return '000'
            }
            if(JUMP in C_JUMP_TABLE){
                return C_JUMP_TABLE[JUMP];
            }
            return Error('C Instruction is not in DEST Table', JUMP);

        }
        return `${C_BINARY_HEAD}${dest()}${comp()}${jump()}`
    } 
    this.convertTokensIntoBinary = () => {
        this.tokens.filter(token => token.type != 'WHITE_SPACE').forEach(token => {
            const { type, value } = token;

            if(type === 'A_INSTRUCTION'){
                this.output += this.handleABinary(value)+"\n";
            }
            if(type === 'C_INSTRUCTION'){
                this.output += this.handleCBinary(value)+"\n";
            }
        })
    }
}

const assemblyCode = getFileFromInput();
const parser = new Parser(assemblyCode);

parser.firstPassForSymbols(assemblyCode);
// console.log(parser.instructions)
parser.Tokenizer();
console.log(parser.tokens)
parser.convertTokensIntoBinary();
// console.log(parser.output);


