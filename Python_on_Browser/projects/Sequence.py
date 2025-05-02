alphabets="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def f_(message):
  return[print(message,end=","),message][1]

def GenerateSequence_(formula,last=16):
  for i in formula:
    if i in alphabets:formula = formula.replace(i,"n")
  return[f_(eval(formula))for n in range(1,last+1)]

X=GenerateSequence_(input("type your sequence (for example: 3*x-1): "),int(input("upto !? : ") or 16))
#print(X)