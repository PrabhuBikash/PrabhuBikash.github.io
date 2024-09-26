middledots = {
    (1, 3): 2, (3, 1): 2,
    (1, 7): 4, (7, 1): 4,
    (1, 9): 5, (9, 1): 5,
    (2, 8): 5, (8, 2): 5,
    (3, 7): 5, (7, 3): 5,
    (4, 6): 5, (6, 4): 5,
    (3, 9): 6, (9, 3): 6,
    (7, 9): 8, (9, 7): 8,
}

def is_valid_move(current, next, visited):
    """Checks if a move from 'current' to 'next' is valid."""
    if (current, next) in middledots:
        middle = middledots[(current, next)]
        if middle not in visited:
            return False  # Must visit the middle dot if it hasn't been visited
    return True

def generate_patterns(current_pattern, visited, patterns_by_length):
    """Recursive function to generate patterns and store by length."""
    pattern_length = len(current_pattern)
    
    if pattern_length >= 4:
        patterns_by_length[pattern_length].append(''.join(map(str, current_pattern)))  # Store valid patterns as string and by length
    
    if pattern_length == 9:
        return  # Stop when the pattern length reaches 9

    for next_dot in range(1, 10):
        if next_dot not in visited and is_valid_move(current_pattern[-1], next_dot, visited):
            visited.add(next_dot)  # Mark this dot as visited
            current_pattern.append(next_dot)  # Add to the current pattern
            generate_patterns(current_pattern, visited, patterns_by_length)  # Recurse
            current_pattern.pop()  # Backtrack
            visited.remove(next_dot)  # Unmark for the next iteration

def get_all_patterns():
    # Predefine all patterns by length from 4 to 9
    patterns_by_length = {length: [] for length in range(4, 10)}
    
    for start_dot in range(1, 10):
        visited = {start_dot}  # Mark the starting dot as visited
        generate_patterns([start_dot], visited, patterns_by_length)
    return patterns_by_length

# Generate all patterns and organize by their length
all_patterns = get_all_patterns()

# --------------- Generate subpatterns and organize by length ----------------

linelength3 = [
    '123', '321',
    '147', '741',
    '159', '951',
    '258', '852',
    '357', '753',
    '456', '654',
    '369', '963',
    '789', '987'
]

def generate_immidiate_subpatterns(pattern):
    """Generate immediate subpatterns by removing middle dots for valid lines of 3."""
    sub_patterns = set()
    
    for i in range(len(pattern) - 2):
        line = ''.join(pattern[i:i+3])  # Get a slice of 3 digits (e.g., '123')

        if line in linelength3:
            new_pattern = pattern[:i+1] + pattern[i+2:]  # Keep first dots, remove middle, keep last dots
            sub_patterns.add(new_pattern)
    return sub_patterns

def generate_all_subpatterns(pattern, sub_patterns_found=None):
    """Recursively generate sub-patterns by progressively removing valid middle dots."""
    if sub_patterns_found is None:
        sub_patterns_found = set()

    sub_patterns_found.add(pattern)  # Mark the current pattern as processed
    new_patterns = generate_immidiate_subpatterns(pattern)
    
    for sub_pattern in new_patterns:
        if sub_pattern not in sub_patterns_found:
            generate_all_subpatterns(sub_pattern, sub_patterns_found)  # Recursively call to explore deeper sub-patterns
    
    return sub_patterns_found

def get_all_subpatterns(all_patterns):
    """Organize subpatterns by length."""
    # Predefine all subpatterns by length from 3 to 9
    subpatterns_by_length = {length: [] for length in range(3, 10)}

    for length, patterns in all_patterns.items():
        for pattern in patterns:
            sub_patterns = generate_all_subpatterns(pattern)
            for sub_pattern in sub_patterns:
                sub_pattern_length = len(sub_pattern)
                if sub_pattern not in subpatterns_by_length[sub_pattern_length]:
                    subpatterns_by_length[sub_pattern_length].append(sub_pattern)

    return subpatterns_by_length

# Organize all subpatterns by length
all_subpatterns = get_all_subpatterns(all_patterns)





import os
import json

def store_json(data, directory, length):
    """Store data in a JSON file under a specific directory and length."""
    # Create directory if it doesn't exist
    os.makedirs(directory, exist_ok=True)
    filename = os.path.join(directory, f"length_{length}.json")
    
    with open(filename, "w") as json_file:
        json.dump(data, json_file, indent=4)  # Make the file more readable

# Store all patterns
for length, patterns in all_patterns.items():
    store_json(patterns, "database/patterns", length)

# Store all subpatterns
for length, subpatterns in all_subpatterns.items():
    store_json(subpatterns, "database/subpatterns", length)
