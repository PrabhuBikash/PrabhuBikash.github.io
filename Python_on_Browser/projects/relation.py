flames = list('FLAMES')

dct = { 'F': 'Friend',
        'L': 'Lover',
        'A': 'Affection',
        'M': 'Marriage',
        'E': 'Enemy',
        'S': 'Sister'
      }

name1 = input("Enter your name: ")
name1.lower()
name2 = input("Enter your crush or friend name: ")
name2.lower()

print(f'\n{name1 = }')
print(f'{name2 = }\n')

n1 = name1
name1 = list(name1)
name2 = list(name2)

while ' ' in name1: name1.remove(' ')
while ' ' in name2: name2.remove(' ')

for i in n1:
    if i in name2:
        name1.remove(i)
        name2.remove(i)

while len(flames) > 1:
    rltn = flames[((len(name1) +len(name2)) % len(flames)) - 1]
    index = flames.index(rltn)
    flames = flames[index+1:] + flames[: index]

print('\n', dct[flames[0]], sep = '')