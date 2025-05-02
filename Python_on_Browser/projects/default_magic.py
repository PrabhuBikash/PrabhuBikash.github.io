import js,asyncio

async def magic_start():
    colors = ["#FFEBEE", "#E3F2FD", "#E8F5E9", "#FFF3E0"]
    for color in colors:
        js.changeBackground(color)
        await asyncio.sleep(0.5)
    js.toggleMenu(True)
    await asyncio.sleep(0.5)
    
    await js.typeToOutput("🔮 Welcome...\n🎯 Here is a random project for you...", 50)
    
    chosen = js.pickRandomProject()
    await asyncio.sleep(1)
    js.highlightAndScrollToProject(chosen)

await magic_start()