; 64 bytes interactive 3D raycaster for
; msdos/dosbox by HellMood of DESiRE
; released at "Function" demoparty 2018
;
; click inside window and move your mouse!
; press ESC to exit ; needs a LOT of CPU
; power with DosBox! ( 200000+ cycles )
;
;           download and comment
; http://www.pouet.net/prod.php?which=78044
;
;            G R E E T I N G S
;
; sensenstahl,homecoded,rrrola,frag,T$
; Optimus,Trixter,igor,gentleman,VileR
; Whizart,g0blinish,Rudi,ryg,Orby a.k.a.
; orbitaldecay,wysiwtf,Kuemmel,p01,Lara
; Oscar Toledo,Drift,maugli,Harekiet,etc
;
;           +all DESiRE members
;
;cycles=200000

push 0xa000+10
pop es
inc ax
int 0x33
mov al,0x13
int 0x10
X mov bl,-9
L dec bx
mov ax,0xcccd
mul di
lea ax,[bx-80]
add al,dh
imul bl
xchg ax,dx
imul bl
mov al,dh
sub ah,cl
xor al,ah
add al,8
lea dx,[bx+si]
and al,dl
test al,16
jz L
and al,31
stosb
mov ax,3
int 0x33
mov si,dx
imul di,byte 53
in al,0x60
dec ax
jnz X
ret
