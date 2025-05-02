maze = [
    ["#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", "#"],
    ["#", " ", "#", " ", "#"],
    ["#", "P", "#", "E", "#"],
    ["#", "#", "#", "#", "#"]
]

def print_maze():
  for row in maze:print(' '.join(row))

def move(player, direction):
  x, y = player
  maze[x][y] = " "
  if direction=="u":x-=1
  elif direction=="d":x+=1
  elif direction=="l":y-=1
  elif direction=="r":y+=1
  if maze[x][y]=="#":
    maze[x][y]="\033[31m#P\33[0m"
    return False
  else: maze[x][y]="P"
  return (x, y)

player_pos = (3, 1)
print_maze()
while player_pos != (3, 3):
    move_dir = (input("Move (u/d/l/r): ")).lower()
    player_pos = move(player_pos, move_dir)
    print_maze()
    if not player_pos:break
print("You've reached the exit!" if player_pos else "GAME OVER!")
