// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.


// Reset counters and start loop
(BLACK)
@SCREEN
D=A
@sAddressCounter
M=D

// Start loop
(FILL)
// Get Keyboard value
@KBD
D=M
// If keyboard has NO value then clear the screen
@WHITE
D;JEQ

//Stop infinite loop from passing past a certain place
@KBD
D=A
@sAddressCounter
D=D-M
@FILL
D;JEQ

// blacken the first address
@sAddressCounter // Get register
D=M
M=M+1

@temp
A=D
M=-1


@FILL // Cont the FILL loop
0;JMP


(WHITE) // Reset vals for loop
@SCREEN
D=A
@sAddressCounter
M=D



(CLEAR)
@KBD // Get Keyboard value
D=M
// If keyboard has value then FILL the screen
@BLACK 
// Jump to START_FILL if val > 0
D;JGT 

//Stop infinite loop from passing past a certain place
@KBD
D=A
@sAddressCounter
D=D-M
@CLEAR
D;JEQ

@sAddressCounter // Get register
D=M
M=M+1

@temp
A=D
M=0

@CLEAR // Cont the loop
0;JMP

(END)
  @END
  0;JMP
