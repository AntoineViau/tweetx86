; Code by Alok Menghrajani
; https://www.quaxio.com/bootable_cd_retro_game_tweet/
; Thank you for the inspiration ! 

          org 100h
          mov bl, 1                    ; Starting direction for the worm.
          push 0xa000                  ; Load address of VRAM into es.
          pop es

restart_game:
          mov       si, 320*100+160    ; worm's starting position, center of
                                       ; screen

          ; Set video mode. Mode 13h is VGA (1 byte per pixel with the actual
          ; color stored in a palette), 320x200 total size. When restarting,
          ; this also clears the screen.
          mov       ax, 0x0013
          int       0x10

          ; Draw borders. We assume the default palette will work for us.
          ; We also assume that starting at the bottom and drawing 2176 pixels
          ; wraps around and ends up drawing the top + bottom borders.
          mov       di, 320*199
          mov       cx, 2176
          rep
draw_loop:
          stosb                        ; draw right border
          stosb                        ; draw left border
          add       di, 318
          jnc       draw_loop          ; notice the jump in the middle of the
                                       ; rep stosb instruction.

game_loop:
          ; We read the keyboard input from port 0x60. This also reads bytes from
          ; the mouse, so we need to only handle [up (0x48), left (0x4b),
          ; right (0x4d), down (0x50)]
          in        al, 0x60
          cmp       al, 0x48
          jb        kb_handle_end
          cmp       al, 0x50
          ja        kb_handle_end

          ; At the end bx contains offset displacement (+1, -1, +320, -320)
          ; based on pressed/released keypad key. I bet there are a few bytes
          ; to shave around here given the bounds check above.
          aaa
          cbw
          dec       ax
          dec       ax
          jc        kb_handle
          sub       al, 2
          imul      ax, ax, byte -0x50
kb_handle:
          mov       bx, ax

kb_handle_end:
          add       si, bx

          ; The original code used set pallete command (10h/0bh) to wait for
          ; the vertical retrace. Today's computers are however too fast, so
          ; we use int 15h 86h instead. This also shaves a few bytes.

          ; Note: you'll have to tweak cx+dx if you are running this on a virtual
          ; machine vs real hardware. Casual testing seems to show that virtual machines
          ; wait ~3-4x longer than physical hardware.
          mov       ah, 0x86
          mov       dh, 0xef
          int       0x15

          ; Draw worm and check for collision with parity
          ; (even parity=collision).
          mov ah, 0x45                 ; Color (must have odd parity)
          xor [es:si], ah

          ; Go back to the main game loop.
          jpo       game_loop

          ; We hit a wall or the worm. Restart the game.
          jmp       restart_game