def setify_(num):return "{}" if num == 0 else "{{}}" if num == 1 else "{"+setify_(num-2)+","+setify_(num-1)+"}"
print("Large numbers can break this website so limit to around 20\r\n you can ask for even larger but that might get too big to fit in here!")
for i in range(int(input("till:"))+1):
  print(i,setify_(i),"\n")