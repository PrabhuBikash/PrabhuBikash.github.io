a="\\_____(<v<)______"
b="/\\____(0v0)______"
c="_/\\___(ovo)______"
d="__/\\__(*v*)______"
e="___/\\_(-v-)______"
f="____/\\(+v+)______"
g="_____/(×v×)______"
h="______(=v=)______"
i="______(÷v÷)\\_____"
j="______(•v•)/\\____"
k="______(°v°)_/\\___"
l="______('v')__/\\__"
m="______(^v^)___/\\_"
n="______(`v`)____/\\"
o="______(>v>)_____/"
p="______(₹v₹)______"
frames=[a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p]
frame_dict,frame={p:a},p
for i in range(len(frames)-1):
    frame_dict[frames[i]]=frames[i+1]
import time
while True:
    print(frame);time.sleep(0.25)
    print("\033[1A\x1b[2K",end="")
    frame=frame_dict[frame]