import random

random_number = random.randint(1,10)

guess_number = int(input("guess the number: "))
number_of_tries = 1

while guess_number!=random_number:

    if guess_number < random_number :
        print("guess is less!")
    else:
        print("guess is more!")

    guess_number = int(input("guess the number: "))
    number_of_tries += 1

print(f"you won in {number_of_tries = }" )