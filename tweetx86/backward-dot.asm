org 100h
section .text

start:

; Graphics mode 320x200x8bpp
mov     al, 13h
int     10h

; Segment a000h
mov     ax, 0a000h
mov     es, ax

mov di, 320*100+160

loop:
mov ax, 2727h
mov [es:di], al

mov al, 0
mov ah, 86h
mov cx, 1
mov dx, 2
int 15h

push di
push cx
xor di, di
mov cx, 320*200/2
xor ax,ax
rep stosw

pop cx
pop di

dec di
jnz loop

; Wait for keypress
xor     ah, ah
int     16h

; Textmode
mov     ax, 0003h
int     10h

; Exit
ret
        
section .data
    ; put data items here

section .bss
    ; put uninitialized data here
