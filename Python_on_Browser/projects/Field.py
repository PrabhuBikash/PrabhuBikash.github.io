from itertools import permutations

def TransmitError_(function):
  try:function()
  except Exception:return Exception

#AXIOMS
##addition
def is_addition_commutative(x,y):return x+y==y+x

@TransmitError_
def is_addition_associative(x,y,z):return (x+y)+z==x+(y+z)

def is_additive_identity(identity,elements):
  for element in list(elements):
    if element!=element+identity:return False
  return True

##multiplication
def is_multiplication_commutative(x,y):return x*y==y*x

def is_multiplication_associative(x,y,z):return (x*y)*z==x*(y*z)

def is_multiplicative_identity(identity,elements):
  for element in list(elements):
    if element!=element*identity:return False
  return True

##distribution
def is_distributive(x,y,z):return (x+y)*z==(x*z)+(y*z)

##all together
def is_field(field,elements,details=False):
  field_elements=[field(element) for element in elements]
  properties=dict(
  addition_closure=True,
  addition_commutative=True,
  addition_associative=True,
  additive_identity=False,
  multiplication_closure=True,
  multiplication_commutative=True,
  multiplication_associative=True,
  multiplicative_identity=False,
  distributive=True
  )
  conclusion=True
  pairs=permutations(field_elements,2)
  triplets=permutations(field_elements,3)
  
  #addition
  try:
    for i,j in pairs:
      if not is_addition_commutative(i,j):properties["addition_commutative"]=False;break
    
    for i,j,k in triplets:
      if not is_addition_associative(i,j,k):properties["addition_associative"]=False;break
    
    for element in elements:
      if is_additive_identity(element,elements):properties["additive_identity"]=str(element);break
  except ValueError:properties["addition_closure"]=False
  
  #multiplication
  try:
    for i,j in pairs:
      if not is_multiplication_commutative(i,j):properties["multiplication_commutative"]=False;break
    
    for i,j,k in triplets:
      if not is_multiplication_associative(i,j,k):properties["multiplication_associative"]=False;break
    
    for element in elements:
      if is_multiplicative_identity(element,elements):properties["multiplicative_identity"]=str(element);break
  except ValueError:properties["multiplication_closure"]=False
  
  #distribution
  if properties["addition_closure"] and properties["multiplication_closure"]:
    for i,j,k in triplets:
      if not is_distributive(i,j,k):properties["distributive"]=False;break
  else:properties["distributive"]=False
  
  #isField:
  for truthvalue in properties.values():
    if not truthvalue:conclusion=False
  
  print(f"{conclusion = }\n")
  if details:
    for property in properties:print(property,":",properties[property])
  return conclusion

# --------------------------- Define Your Field Here --------------------------- #
#defining field : Z2 field
class mod2:
  def __init__(self,value):self.value=value
  def __add__(self,other):return(self.value+other.value)%2
  def __mul__(self,other):return self.value*other.value
  def __str__(self):return str(self.value)
#print(mod2(0)+mod2(1))  
is_field(mod2,[0,1],details = True)