// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.
// Get Register 0 
	@R0
	D=M
// Set sum to val of R0
	@sum
	M=0
// Get Register 1
	@R1
	D=M
// Set i to val of R1
	@i
	M=D
(LOOP)
	@i
	D=M
	@END
	D;JLE
	@i
	M=M-1
	
// Add D to its self
	@R0
	D=M
	@sum
	M=M+D

// If M is 0 break the loop

// else keep adding D to its self
	@LOOP
	0;JMP
(END)
	@END
	@sum
	D=M
	@R2
	M=D
	0; JMP


	
	
