import random
print("\033[36mhere words mean just the combination of letters not necessarily meaningful\n\033[32mGREEN-> the letter is present in the correct word at exact position\n\033[33mYELLOW -> the leter is present in the correct word but at different position or already marked green \n\033[31mRED-> the leter is not in the letter or alredy marked green\033[0m\n\n")
a=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
while True:
    try:
        l= int(input(f"choose what level you wanna play! : "))
        break
    except ValueError:
        print("\033[31mInput should be a \033[1mWHOLE NUMBER\033[0m")
l+=1
W = ''.join(random.choices(a, k=l))
w=[i for i in W]
t=0
k=["_"]*l
m=[]
n=[]
while t<=l:
    L=l-t
    print(f"{L} CHANCES LEFT ",end="")
    print("🌕" if L>4*l/5 else "🌖"if L>3*l/5 else "🌗"if L>2*l/5 else "🌘"if L>l/5 else "🌑")
    g = (input(f"GUESS YOUR WORD ({l} letters) : ")).upper()
    if len(g)!=l or not all (i in a for i in g):
        print(f"\033[1;31m{l} LETTER WORD\033[0m")
        continue
    g=[i for i in g]
    f=g.copy()
    h=g.copy()
    c=0
    for i in range(l):
        if f[i]==w[i]:
            h[i]=f"\033[32m{h[i]}\033[0m"
            k[i]=f[i]
            f[i]="_"
            c+=1
    for i in range(l) :
        if f[i] in w :
            m.append(f[i])
            h[i]=f"\033[33m{h[i]}\033[0m"
        else:
            if f[i] not in n:
                n.append(f[i])
            h[i]=f"\033[31m{h[i]}\033[0m"
    m=list(set(m))
    m=[i for i in m if i not in k]
    n=list(set(n))
    if "_" in n:
        n.remove("_")
    print("\033[1m ",' \033[1m '.join(i for i in h),"\033[0m")
    print(f"HINTS : \n\033[32m{k}\n\033[33m{m}\n\033[31m{n}\033[0m")
    t+=1
    if c==l:
        print("\033[1;32mGOTCHA YOU GOT IT!\033[0m")
        break
print(f"\033[36mTHE RIGHT WORD IS \033[1;32m`{W}`\033[0m")