#PRESETS
#COPYRIGHT:@PRABHUBIKASH
print("                        \033[1;4;36mMADE BY PRABHUBIKASH😇 \033[0m")
#Model matrix
print("\033[1;4mMODELMATRIX :\033[0m\n\033[1;36m        ▁           ▁ \n"
      "        ▏ a₁₁ a₁₂ a₁₃ ▕ \n"
      "        ▏ a₂₁ a₂₂ a₂₃ ▕ \n"
      "        ▏ a₃₁ a₃₂ a₃₃ ▕ \n"
      "        ▔           ▔ \033[0m")

#FUNCTIONS
#defining Input function
def Input(x):
    while True:
        try:
            n= input(f"(Press Enter to use default: 0) {x} = ")
            return (0 if not n else int(n) if float(n).is_integer() else float(n) if float(n) else None)
        except ValueError:
            print("\033[31mInput should be a \033[1mnumber\033[0m")
#defining Compacting Matrix
def Compact(m11, m12, m13, m21, m22, m23, m31, m32, m33) :
    M = [[R1, MR2, MR3], [C1, C2, C3]] = [[[m11, m12, m13], [m21, m22, m23], [m31, m32, m33]],[[m11, m21, m31], [m12, m22, m32], [m13, m23, m33]]]
    return M
#defining Matrix PRINTING
def Print(M,D=""):
    [[[m11, m12, m13], [m21, m22, m23], [m31, m32, m33]], [[m11, m21, m31], [m12, m22, m32], [m13, m23, m33]]] = [[R1, R2, R3], [C1, C2, C3]] = M
    [SC1,SC2,SC3]=[[len(str(m11)), len(str(m21)), len(str(m31))], [len(str(m12)), len(str(m22)), len(str(m32))], [len(str(m13)), len(str(m23)), len(str(m33))]]
    sc1,sc2,sc3=max(SC1),max(SC2),max(SC3)
    s11, s21, s31, s12, s22, s32, s13, s23, s33, s = (" " * (sc1 - len(str(m11)))," " * (sc1 - len(str(m21)))," " * (sc1 - len(str(m31)))," " * (sc2 - len(str(m12)))," " * (sc2 - len(str(m22)))," " * (sc2 - len(str(m32)))," " * (sc3 - len(str(m13)))," " * (sc3 - len(str(m23)))," " * (sc3 - len(str(m33)))," " * (sc1 + sc2 + sc3))
    print(f"\033[1;36m{D} = \033[0m")
    print(f"\033[1;36m        ▁      {s}▁ \n"
          f"        ▏ {m11}{s11}  {m12}{s12}  {m13}{s13} ▕ \n"
          f"        ▏ {m21}{s21}  {m22}{s22}  {m23}{s23} ▕ \n"
          f"        ▏ {m31}{s31}  {m32}{s32}  {m33}{s33} ▕ \n"
          f"        ▔      {s}▔ \033[0m")          
#defining list multiplication:
def X(A,B) :
    if len(A)==len(B) :
        AB=0
        for i in range(len(A)) :
            AB+=A[i]*B[i]
        return AB
    else :
            return("lists are of different length")
#defining Matrix Multiplication
def Multiply(A,B) :
    R,C=A[0],B[1]
    R1,R2,R3=R[0],R[1],R[2]
    C1,C2,C3=C[0],C[1],C[2]
    return Compact(X(R1,C1),X(R1,C2),X(R1,C3),X(R2,C1),X(R2,C2),X(R2,C3),X(R3,C1),X(R3,C2),X(R3,C3))

#INPUT
#FIRST MATRIX : A
a11 = Input("a₁₁")
print("a₁₁ =",a11)
a12 = Input("a₁₂")
print("a₁₂ =",a12)
a13 = Input("a₁₃")
print("a₁₃ =",a13)
a21 = Input("a₂₁")
print("a₂₁ =",a21)
a22 = Input("a₂₂")
print("a₂₂ =",a22)
a23 = Input("a₂₃")
print("a₂₃ =",a23)
a31 = Input("a₃₁")
print("a₃₁ =",a31)
a32 = Input("a₃₂")
print("a₃₂ =",a32)
a33 = Input("a₃₃")
print("a₃₃ =",a33)
A=Compact(a11,a12,a13,a21,a22,a23,a31,a32,a33)
Print(A,"A")
#SECOND MATRIX : B
b11 = Input("b₁₁")
print("b₁₁ =",b11)
b12 = Input("b₁₂")
print("b₁₂ =",b12)
b13 = Input("b₁₃")
print("b₁₃ =",b13)
b21 = Input("b₂₁")
print("b₂₁ =",b21)
b22 = Input("b₂₂")
print("b₂₂ =",b22)
b23 = Input("b₂₃")
print("b₂₃ =",b23)
b31 = Input("b₃₁")
print("b₃₁ =",b31)
b32 = Input("b₃₂")
print("b₃₂ =",b32)
b33 = Input("b₃₃")
print("b₃₃ =",b33)
B=Compact(b11,b12,b13,b21,b22,b23,b31,b32,b33)
Print(B,"B")

#Output
AB,BA=Multiply(A,B),Multiply(B,A)
Print(AB,"AB")
Print(BA,"BA")
print("\033[1;36mAB=BA\033[0m" if AB == BA else "\033[1;36mAB≠BA\033[0m")