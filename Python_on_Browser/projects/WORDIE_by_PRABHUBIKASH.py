import random
print("                    \033[1;4;36mMADE BY PRABHUBIKASH\033[0m😎  \n                        \033[1;4mINSTRUCTIONS\033[0m\n\033[36mHere words are collected from\n'level 1- https://chat.openai.com\nlevel 2-https://wordfinder.yourdictionary.com '\n\033[32mGREEN-> the letter is present in the correct word at exact position\n\033[33mYELLOW -> the leter is present in the correct word but at different position or already marked green \n\033[31mRED-> the leter is not in the letter or alredy marked green\033[0;1;4;36m\nIN GUESS :\033[0;1m\nEND-> enter L00SE to end\nHINT-> enter H1NT for HINT\n\033[4;36mIN MODE :\033[0;1m\nEnter to play with default no. of chances\nOR enter no. of chances\nOR type 'UNLIMITED' for unlimited chance mode : \033[0m\n\n")
D={}
D[1]=["A","I","O"]
D[2]=["AA","AB","AD","AE","AG","AH","AI","AL","AM","AN","AR","AS","AT","AW","AX","AY","BA","BE","BI","BO","BY","DA","DE","DO","ED","EF","EH","EL","EM","EN","ER","ES","ET","EW","EX","FA","FE","GI","GO","HA","HE","HI","HM","HO","ID","IF","IN","IS","IT","JO","KA","KI","LA","LI","LO","MA","ME","MI","MM","MO","MU","MY","NA","NE","NO","NU","OD","OE","OF","OH","OI","OK","OM","OP","OR","OS","OW","OX","OY","PA","PE","PI","PO","QI","RE","SH","SI","SO","TA","TE","TI","TO","UH","UM","UN","UP","US","UT","WE","WO","XI","XU","YA","YE","YO","ZA"]
def level():
    while True:
        try:
            print("\033[1;36mChoose level (1-2) : \033[0m",end="")
            l = int(input())
            return [print("\033[35mLEVEL NOT ADDED 😅 \033[0m"), int("E")][1] if l > len(D) else int("E") if l < 1 else l
        except ValueError:
            print(f"\033[31mIt should be a \033[1mNatural Number smaller than {len(D)+1}\033[0m")
def mode():
    while True:
        try:
            print("\033[1;36mMODE : \033[0m",end="")
            chance = (input()).upper()
            return "UNLIMITED" if chance == "UNLIMITED" else "DEFAULT" if not chance else int(chance) if int(chance) > 0 else int("E")
        except ValueError:
            print("\033[31mREAD CAREFULLY\033[0m")
def guess(l):
    while True:
        g = (input(f"GUESS YOUR WORD ({l} letters) : ")).upper()
        if g == "L00SE" or g == "H1NT" or (len(g) == l and g.isalpha()):
            return g
        else:
            print(f"\033[31mInvalid input. Please enter a {l}-letter word, 'L00SE', or 'H1NT'.\033[0m")
def check(w,g,G,Y,R):
    l=len(w)
    C,P=g.copy(),["_"]*l
    c=0
    for i in range(l):
        if C[i]==w[i]:
            P[i]=f"\033[32m{C[i]}\033[0m"
            G[i]=C[i]
            C[i]="_"
            c+=1
        elif C[i] in w:
            P[i]=f"\033[33m{C[i]}\033[0m"
            Y.append(C[i])
        else:
                if C[i] not in R and C[i]!="_":
                    R.append(C[i])
                if C[i] in R:
                    P[i]=f"\033[31m{C[i]}\033[0m"
    Y,R=list(set(Y)),list(set(R))
    Y=[i for i in Y if i not in G]
    print("    \033[1m ",' \033[1m '.join(i for i in P),"\033[0m")
    print(f"SUMMARY of your Input result : \n    \033[32m{G}\n\033[33m    {Y}\n\033[31m    {R} \033[0m")
    return c,G,Y,R
def hint(g,L,G,Y,R) :
    Lh,Gh,Yh,Rh,H=L.copy(),G.copy(),Y.copy(),R.copy(),[]
    for i in Lh[:]:
        for j in i:
            if j in R:
                Lh.remove(i)
                break
    for i in Lh[:]:
        for j in Y:
            if j not in i:
                Lh.remove(i)
                break
        if all(i[j]==G[j]or G[j]=="_" for j in range(len(i))):
            H.append(i)
    return H
def play():
    l=level()
    m=mode()
    chance=l + 1 if m=="DEFAULT" else m
    print("                \033[1;4m","UNLIMITED MODE : UNLIMITED CHANCES" if m == "UNLIMITED" else f"DEFAULT MODE : {l+1} CHANCES" if chance == l + 1 else f"NORMAL MODE : {chance} CHANCES","\033[0m")
    L = D[l]
    w = random.choice(L)
    t = 1
    print(f"\033[1mtry no. : {t}                  |                  chances left : \033[0m", chance if m != "UNLIMITED" else "∞")
    G, Y, R = ["_"] * l, [], []
    while chance=="UNLIMITED" or chance > 0:
        g_ = guess(l)
        g = [i for i in g_]
        if g_=="L00SE":
            print("                    \033[1;31mToo early to give up 😒 \033[0m")
            break
        if g_!="H1NT":
            c,G,Y,R=check(w,g,G,Y,R)
            if c==l:
                print("                  \033[1;32mGOTCHA! YOU GOT THAT!🥳 \033[0m")
                break
        if chance!="UNLIMITED":
            chance-=1
        if g_=="H1NT":
            print(f"\033[1;36mHINT (possible words):\n\033[0;33m{hint(g, L, G, Y, R)}\033[0m")
            print(f"\033[1mtry no. : {t}                  |                  chances left : \033[0m", chance if m != "UNLIMITED" else "∞")
            continue
        t += 1
        if chance=="UNLIMITED" or chance>0:
            print(f"\033[1mtry no. : {t}                  |                  chances left : \033[0m", chance if m != "UNLIMITED" else "∞")
play()
while (input('\n WANNA PLAY AGAIN! \n (type"NO" to end else type something/enter to play) : ')).upper()!="NO":
    play()
print("\n© ALL COPY RIGHTS RESERVED")