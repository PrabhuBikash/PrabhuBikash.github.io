import itertools, time

def all_combinations(s,min_length=3):
    combinations = []
    for r in range(min_length, len(s) + 1):
        combinations.extend([''.join(comb) for comb in itertools.permutations(s, r)])
    return combinations

def are_words(letter_combinations):
    with open('words_alpha.txt') as word_file:
        english_words = set(word_file.read().split())
    words = []
    for word in letter_combinations:
        if word in english_words:
            words.append(word)
    return words

print(are_words(all_combinations(input("string = "),int(value if (value:=input("min length (default: 3) = ")) else 3))))