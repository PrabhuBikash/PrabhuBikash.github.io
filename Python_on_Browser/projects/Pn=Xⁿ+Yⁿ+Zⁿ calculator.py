P0=3
while True:
    try:
        P1=float(input("X+Y+Z = "))
        if P1==int(P1) :
            P1=int(P1)
        break
    except ValueError:
        print("\033[31minput should be a \033[1mnumber\033[0m")
while True:
    try:
        P2=float(input("X²+Y²+Z² = "))
        if P2==int(P2) :
            P2=int(P2)
        break
    except ValueError:
        print("\033[31minput should be a \033[1mnumber\033[0m")
while True:
    try:
        P3=float(input("X³+Y³+Z³ = "))
        if P3==int(P3) :
            P3=int(P3)
        break
    except ValueError:
        print("\033[31minput should be a \033[1mnumber\033[0m")
while True:
    try:
        n=int(input("want to compute Xⁿ+Yⁿ+Zⁿ but for what value of n? "))
        break
    except ValueError:
        print("\033[31mn should be an \033[1minteger\033[0m")

a=P1
b=((P1**2) - P2)/2
c=((2*P3)+(P1**3)-(3*P1*P2))/6
L=[P0,P1, P2,P3]

def __P__(n) :
    if [P1,P2,P3,n]==[0,0,0,0] :
        L[0]="UNDEFINED"
    elif n>3:
        i=4
        while i<n+1:
           Pi=(a*L[i-1]) -(b*L[i-2])+(c*L[i-3])
           if Pi==int(Pi) :
               Pi=int(Pi)
           L.append(Pi)
           i+=1
    return L[n]
Pn=__P__(n)
print(f"\033[1m{Pn}\033[0m",end="")
if "UNDEFINED"!=Pn!=int(Pn) :
    j=1
    while (Pn*j)!=int(Pn*j) :
        j+=1
        if Pn*j==int(Pn*j) :
            Pn=str(int(Pn*j))+"/"+str(j)
            break
    print(f"\033[1m={Pn}\033[0m")