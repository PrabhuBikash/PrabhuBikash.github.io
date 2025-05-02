#PRESETS
import random
D={}
O={}
#Dictionary[word],Options[word]=[meaning],[correct,incorrect]
D["ruminate"],O["ruminate"]=["to think deeply and carefully about something"],["Contemplate","Vacillate"]
D["complacent"],O["complacent"]=["feeling too satisfied with yourself or with a situation, so that you think that there is no need to worry"],["Smug","Smelly"]
D["credentials"],O["credentials"]=["the qualities, experience, etc. that make somebody suitable for something"],["Expertise","Refusal"]
D["platitude"],O["platitude"]=["a remark or statement that has been made very often before and is therefore not interesting"],["cliché","Cleaver"]
D["wicked"],O["wicked"]=["morally bad; evil\nINFORMAL : slightly bad but in a way that is amusing and/or attractive"],["Evil","Eventual"]
D["imbecile"],O["imbecile"]=["a stupid person"],["foolish","Intelligent"]
D["aphorism"],O["aphorism"]=["FORMAL : (noun)\na short phrase that expresses in a clever way something that is true"],["saying","Shelving"]
D["Dialectic"],O["Dialectic"]=["dialogue between people holding different points of view about a subject but wishing to arrive at the truth through reasoned argumentation."],["Discussion","Dislocation"]
D["whimper"],O["whimper"]=["to cry softly, especially with fear or pain"],["Whine","Wheeze"]
D["invective"],O["invective"]=["insulting, abusive, or highly critical language."],["Abuse","Praise"]
D["archetypal"],O["archetypal"]=["having all the qualities that make somebody/something a typical example of a particular kind of person or thing"],["Quintessential","Extraterrestial"]
D["emollient"],O["emollient"]=["adjective : having the quality of softening or soothing the skin."],["Soothing","Self-Sealing"]
D["grunt"],O["grunt"]=["to make a short low sound in the throat. People grunt when they do not like something or are not interested and do not want to talk"],["Snort","consume"]
D["convivial"],O["convivial"]=["FORMAL: (adjective)happy and friendly in atmosphere or character"],["fun-loving","Dull"]

#FUNCTIONS
def Choose():
        n=input("choose (1 or 2)")
        return True if n=="2" else False if  n=="1" else [print("\033[31mchoose from[1,2]\033[0m"),Choose()][1]
def Ask(w):
    s=random.choice([True,False])
    o=O[w][::-1] if s else O[w]
    print(f'which one is more similar to "\033[1m{w}\033[0m"?\n\033[33m{o}\033[0m')
    c=Choose()
    print("\033[32mCORRECT\033[0m"if s==c else "\033[31mNOPE!\033[0m")
    print(f"Meaning :\n\033[32m{D[w][0]}\033[0m\n\n")
    return True if s==c else False
def Quiz():
    W,c,t=list(D.keys()),0,0
    random.shuffle(W)
    for w in W:
        t+=1
        c+=Ask(w)
    return (f"\n\033[1m{c}/{t}\033[0m")
print(Quiz())