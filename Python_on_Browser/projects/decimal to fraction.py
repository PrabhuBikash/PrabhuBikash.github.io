N=float(input("enter the decimal you want as a fraction : "))
D=1
while (N*D)!=int(N*D) :
  D+=1
  if N*D==int(N*D) :
    N=N*D
for i in range(2,min(N:=(int(N)),D)+1):
  while N%i==D%i==0:
    N//=i
    D//=i
print(str(N)+"/"+str(D))