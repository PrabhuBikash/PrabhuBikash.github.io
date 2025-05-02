import random
D={
#word:[[meaning,sentence],[correct,incorrect]]
}

#words

D["bequeath"]=[["To leave or give (personal property) by will.","In his will, the wealthy philanthropist decided to bequeath a significant portion of his estate to charity."],["Inherit","Banish"]]

D["customary"]=[["According to the customs or usual practices.","It is customary to exchange gifts during the holiday season."],["Traditional","Unusual"]]

D["dreary"]=[["Dull, bleak, and lacking in interest or excitement.","The long, dreary winter days made him yearn for warmer weather."],["Monotonous","Lively"]]

D["etiquette"]=[["The customary code of polite behavior in society or among members of a particular profession or group.","Observing proper etiquette is crucial in formal social gatherings."],["Manners","Chaos"]]

D["fragile"]=[["Easily broken or damaged; delicate.","The antique vase was beautiful but very fragile, requiring careful handling."],["Delicate","Sturdy"]]

D["grandiose"]=[["Impressive and imposing in appearance or style, especially pretentiously so.","The architect's grandiose design for the new building captivated everyone's attention."],["Majestic","Simple"]]

D["hunky-dory"]=[["Slang. Perfectly fine; going very well.","Despite some initial challenges, everything turned out hunky-dory in the end."],["Excellent","Disastrous"]]

D["intrinsic"]=[["Belonging naturally; essential.","The intrinsic beauty of nature is often overlooked in our busy lives."],["Fundamental","Superficial"]]

D["juvenile"]=[["Of, for, or relating to young people; immature.","His juvenile behavior during the meeting was quite unprofessional."],["Adolescent","Mature"]]

D["fortitude"]=[["Courage in facing difficulties or adversity; strength of mind.","Overcoming the challenges with fortitude, she pursued her dreams relentlessly."],["Resilience","Weakness"]]

D["lingering"]=[["Lasting for a long time; slow to end.","The lingering aroma of freshly baked bread filled the kitchen."],["Prolonged","Swift"]]

D["myopic"]=[["Nearsighted; lacking imagination or foresight.","The myopic decision to focus only on short-term gains led to long-term consequences."],["Shortsighted","Farsighted"]]

D["nondescript"]=[["Lacking distinctive or interesting features; dull.","The nondescript building blended into the background, unnoticed by many."],["Unremarkable","Striking"]]

D["oxymoron"]=[["A figure of speech in which apparently contradictory terms appear in conjunction.","The phrase 'bitter sweet' is an example of an oxymoron."],["Paradox","Harmony"]]

D["prejudice"]=[["Preconceived opinion that is not based on reason or actual experience.","Overcoming prejudice is essential for fostering a more inclusive society."],["Bias","Neutrality"]]

D["quintessential"]=[["Representing the most perfect or typical example of a quality or class.","The old bookstore was the quintessential place for literary enthusiasts."],["Classic","Average"]]

D["rejuvenated"]=[["Made young or fresh again.","A good night's sleep left her feeling rejuvenated and ready for the day ahead."],["Revitalized","Exhausted"]]

D["discordant"]=[["Disagreeing or incongruous; characterized by quarreling and disagreement.","The discordant opinions among team members hindered the project's progress."],["Disharmonious","Harmonious"]]

D["turbulent"]=[["Characterized by conflict, disorder, or confusion; not controlled or calm.","The turbulent waters made sailing through the storm challenging."],["Chaotic","Tranquil"]]

D["utopia"]=[["An imagined place or state of things in which everything is perfect.","The idea of a utopia, where everyone lives in harmony, is often explored in literature."],["Paradise","Dystopia"]]

D["victimize"]=[["Single out for cruel or unjust treatment.","It is essential to address and prevent any attempts to victimize vulnerable individuals."],["Exploit","Protect"]]

D["wrath"]=[["Extreme anger; intense resentment or retribution.","His careless actions incurred the wrath of his disappointed parents."],["Fury","Joy"]]

D["x_factor"]=[["A variable in a given situation that could have the most significant impact.","The unpredictability of the stock market is often considered the X factor for investors."],["Unforeseen element","Predictable factor"]]

D["yearn"]=[["Have an intense feeling of longing for something, typically something that one has lost or been separated from.","As the days passed, he began to yearn for the familiar comforts of home."],["Crave","Reject"]]

D["zealot"]=[["A person who is fanatical and uncompromising in pursuit of their religious, political, or other ideals.","The political zealot passionately campaigned for his candidate, often disregarding opposing views."],["Fanatic","Moderate"]]

D["aggravate"]=[["Make (a problem, injury, or offense) worse or more serious.","Continuing to ignore the issue will only aggravate the existing problems."],["Exacerbate","Alleviate"]]

D["alienate"]=[["Cause (someone) to feel isolated or estranged.","Constant criticism can alienate individuals, leading to a breakdown in communication."],["Isolate","Unite"]]

D["ambiguous"]=[["Open to more than one interpretation; not having a clear or definite meaning.","The ambiguous statement left everyone unsure about the true intentions."],["Uncertain","Clear"]]

D["dote"]=[["Be extremely and uncritically fond of.","Grandparents often dote on their grandchildren, showering them with love and attention."],["Adore","Neglect"]]

D["eccentric"]=[["Unconventional and slightly strange.","The eccentric artist was known for creating avant-garde and unusual pieces."],["Quirky","Conventional"]]

D["efface"]=[["Erase (a mark) from a surface; make oneself appear insignificant or inconspicuous.","Time seemed to efface the memories, leaving only faint traces of the past."],["Delete","Highlight"]]

D["fallacy"]=[["A mistaken belief, especially one based on unsound argument.","The idea that success guarantees happiness is a fallacy often debunked by real-life experiences."],["Misconception","Truth"]]

D["ingenuous"]=[["Innocent, unsuspecting; showing childlike simplicity and lack of guile.","His ingenuous remarks revealed a genuine and honest nature."],["Naive","Cynical"]]

D["ingenious"]=[["Clever, original, and inventive.","The ingenious solution to the problem surprised everyone with its simplicity and effectiveness."],["Creative","Dull"]]

D["mesmerize"]=[["Hold the attention of (someone) to the exclusion of all else or so as to transfix them.","The magician's performance never failed to mesmerize the audience with its mystique."],["Enchant","Bore"]]

D["obverse"]=[["The side of a coin or medal bearing the head or principal design.","The obverse of the coin featured the image of a prominent historical figure."],["Front","Back"]]

D["recede"]=[["Go or move back or further away from a previous position.","As the ship sailed away, the shoreline began to recede into the distance."],["Retreat","Advance"]]

D["rapture"]=[["A feeling of intense pleasure or joy.","The breathtaking sunset filled them with a sense of rapture and awe."],["Ecstasy","Despair"]]

D["rigmarole"]=[["A lengthy and complicated procedure.","Filling out the bureaucratic paperwork turned into a tiresome rigmarole."],["Complexity","Simplicity"]]

D["subvert"]=[["Undermine the power and authority of (an established system or institution).","The rebels sought to subvert the oppressive regime and bring about change."],["Overthrow","Strengthen"]]

D["senile"]=[["Showing a decline or deterioration of physical strength or mental functioning, typically associated with old age.","Unfortunately, the elderly man's senile condition made it challenging for him to remember recent events."],["Deteriorating","Improving"]]

D["travesty"]=[["A false, absurd, or distorted representation of something.","The trial was a travesty of justice, with evidence overlooked and crucial witnesses ignored."],["Mockery","Fairness"]]

D["vanity"]=[["Excessive pride in or admiration of one's appearance or achievements.","Her vanity was evident in the countless hours spent admiring herself in the mirror."],["Narcissism","Humility"]]

D["unequivocal"]=[["Leaving no doubt; clear and unambiguous.","The witness gave an unequivocal statement, providing a straightforward account of the events."],["Clear-cut","Ambiguous"]]

D["abstruse"]=[["Difficult to understand; obscure.","The professor's abstruse lecture left the students puzzled and seeking clarification."],["Complex","Simple"]]

D["allusion"]=[["An expression designed to call something to mind without mentioning it explicitly; an indirect or passing reference.","The novel is filled with allusions to classical literature, adding layers of meaning for attentive readers."],["Reference","Direct mention"]]

D["illusion"]=[["A false idea or belief; something that deceives the senses.","The magician created the illusion of a disappearing act through clever sleight of hand."],["Deception","Reality"]]

D["effectual"]=[["Successful in producing a desired or intended result; effective.","The new marketing strategy proved to be highly effectual in boosting sales."],["Efficient","Ineffective"]]

D["effective"]=[["Successful in producing a result; having a definite or desired effect.","The communication skills of the leader were effective in fostering collaboration among team members."],["Productive","Inefficient"]]

D["blatant"]=[["Done openly and unashamedly; obvious.","The blatant disregard for the rules resulted in swift disciplinary action."],["Evident","Hidden"]]

D["brusque"]=[["Blunt in manner or speech, often to the point of being rude.","His brusque response to the inquiry left everyone taken aback."],["Curt","Polite"]]

D["camouflage"]=[["The act of disguising or concealing by mimicry of the natural environment.","The soldiers wore camouflage uniforms to blend in with the forest during the mission."],["Disguise","Visibility"]]

D["candor"]=[["The quality of being open, honest, and straightforward.","The leader appreciated candor in the team, fostering a culture of open communication."],["Frankness","Deception"]]

D["captious"]=[["Tending to find fault or raise petty objections.","Her captious remarks during the meeting created a tense atmosphere."],["Critical","Supportive"]]

D["decadence"]=[["Moral or cultural decline, often characterized by excessive indulgence in pleasure or luxury.","The opulent lifestyle of the ruling class reflected a period of societal decadence."],["Decline","Advancement"]]

D["incorrigible"]=[["Incapable of being corrected, reformed, or improved.","Despite numerous interventions, the young delinquent remained incorrigible in his behavior."],["Unmanageable","Teachable"]]

D["preconceived"]=[["Formed before having the evidence for its truth or correctness.","It's important to approach new ideas with an open mind, avoiding preconceived notions."],["Prejudged","Impartial"]]

D["incredulous"]=[["Unwilling or unable to believe something.","The audience looked on with incredulous expressions as the illusionist performed seemingly impossible feats."],["Skeptical","Gullible"]]

D["appease"]=[["Pacify or placate (someone) by acceding to their demands.","Diplomats worked to find a compromise that would appease both parties in the conflict."],["Conciliate","Provoke"]]

D["decorous"]=[["In keeping with good taste and propriety; polite and restrained.","The formal event required guests to adhere to a decorous dress code."],["Proper","Improper"]]

#idioms

D["when_pigs_fly"]=[["Used to say that something will never happen.","You'll get him to agree when pigs fly."],["Improbable","Certain"]]

D["a_shot_in_the_dark"]=[["An attempt that has little chance of succeeding.","Trying to fix the issue without knowing the root cause is just a shot in the dark."],["Speculative","Surefire"]]

D["taste_of_your_own_medicine"]=[["Experiencing the same negative treatment that one has given to others.","After being teased for weeks, he finally got a taste of his own medicine."],["Retribution","Reward"]]

D["absence_makes_the_heart_grow_fonder"]=[["Being away from someone or something for a period of time makes one appreciate it more.","They realized how much they missed their hometown; absence makes the heart grow fonder."],["Longing","Indifference"]]

D["actions_speak_louder_than_words"]=[["What someone does is more significant and revealing than what they say.","She promised to help, but her actions spoke louder than words when she never showed up."],["Deeds","Speech"]]

D["its_all_greek_to_me"]=[["Something that is difficult to understand.","When he explained the technical details, it was all Greek to me."],["Confusing","Clear"]]

D["an_axe_to_grind"]=[["Having a dispute with someone.","I think he has an axe to grind with his coworker; they always argue."],["Grudge","Harmony"]]

D["at_the_drop_of_a_hat"]=[["Without any hesitation; instantly.","She was ready to help at the drop of a hat."],["Immediately","Delayed"]]

D["beating_around_the_bush"]=[["Avoiding the main topic; not getting to the point.","Stop beating around the bush and tell me what you really think."],["Evasive","Direct"]]

D["bend_over_backwards"]=[["To make a great effort, especially to be helpful or accommodating.","She would bend over backwards to assist her friends in need."],["Exert oneself","Be lazy"]]

D["birds_of_a_feather_flock_together"]=[["People with similar interests or characteristics tend to associate with each other.","It's no surprise they became friends; birds of a feather flock together."],["Similarity","Dissimilarity"]]

D["burning_the_candle_at_both_ends"]=[["Working or staying awake for long hours, often at the expense of one's health.","He's burning the candle at both ends with two jobs and little rest."],["Overextending","Balancing"]]

D["burning_the_midnight_oil"]=[["Working late into the night; putting in extra hours.","To meet the deadline, they were burning the midnight oil every night."],["Working hard","Slacking off"]]

D["cry_wolf"]=[["To give a false alarm; to warn of a danger that is not real.","After so many false alarms, nobody believed him when he cried wolf."],["False alarm","Real danger"]]

D["not_to_put_all_your_eggs_in_one_basket"]=[["Not to risk everything on a single venture or investment.","Diversify your investments; it's not wise to put all your eggs in one basket."],["Spread risk","Take risks"]]

D["every_cloud_has_a_silver_lining"]=[["Even in difficult situations, there is a positive aspect or opportunity.","Losing the job was tough, but every cloud has a silver lining; he found a better opportunity."],["Optimism","Pessimism"]]

D["flash_in_the_pan"]=[["Something or someone that initially shows great promise but quickly fails to deliver.","The band's success was just a flash in the pan; they faded away after one hit."],["Temporary success","Sustained success"]]

D["in_the_heat_of_the_moment"]=[["In the period of anger or excitement, without careful thought.","Regrettable words are often spoken in the heat of the moment."],["Impulsively","Thoughtfully"]]

D["its_a_small_world"]=[["Used to express surprise at meeting someone one knows in an unexpected place.","Running into an old friend at the airport made her exclaim, 'It's a small world!'"], ["Coincidence","Vast world"]]

D["let_the_cat_out_of_the_bag"]=[["Reveal a secret, often unintentionally.","I wasn't supposed to know about the surprise party, but someone let the cat out of the bag."],["Disclose","Keep a secret"]]

D["method_in_madness"]=[["An intelligent purpose in what seems to be foolish behavior.","His eccentric working style had a method in the madness; he produced innovative ideas."],["Purpose","Chaos"]]

D["on_top_of_the_world"]=[["Feeling extremely happy or successful.","Winning the championship made him feel on top of the world."],["Ecstatic","Depressed"]]

D["out_of_the_blue"]=[["Happening unexpectedly or suddenly.","His success in the competition came out of the blue; nobody expected it."],["Surprising","Predictable"]]

D["out_of_the_frying_pan_and_into_the_fire"]=[["From a bad situation to a worse one.","Leaving a stressful job but ending up with more responsibilities was like jumping out of the frying pan and into the fire."],["Worsening","Improving"]]

D["penny-wise_pound-foolish"]=[["Being careful with small amounts of money but wasteful with larger amounts.","Repairing the old car repeatedly instead of buying a new one is penny-wise, pound-foolish."],["Shortsighted","Prudent"]]

D["put_your_best_foot_forward"]=[["To make a good impression by presenting oneself well.","When attending the interview, remember to put your best foot forward."],["Show your best self","Hide your abilities"]]

D["rome_was_not_built_in_one_day"]=[["Important work takes time and effort.","Learning a new skill requires patience; after all, Rome was not built in one day."],["Patience","Impatience"]]

D["start_from_scratch"]=[["To begin from the very beginning, with nothing already prepared.","After the computer crash, he had to start from scratch and rebuild all his files."],["Begin anew","Continue from where you left off"]]

D["the_apple_of_one's_eye"]=[["Someone's favorite person or thing.","Her granddaughter was the apple of her eye; she adored her above all others."],["Favored person","Ignored person"]]

D["the_ball_is_in_your_court"]=[["It's your responsibility to make a decision or take action.","You have the job offer; now the ball is in your court to accept or decline."],["Your move","Not your concern"]]

D["best_of_both_worlds"]=[["The benefits of two different situations or options combined.","Working part-time allows her to spend time with family and pursue a career; it's the best of both worlds."],["Optimal situation","Compromise"]]

D["the_devil_is_in_the_details"]=[["The importance of small details in determining the success or failure of something.","When reviewing contracts, always be aware that the devil is in the details."],["Details matter","Details don't matter"]]

D["the_early_bird_catches_the_worm"]=[["Success comes to those who act promptly or arrive early.","He always arrives at the office early, believing that the early bird catches the worm."],["Promptness is rewarded","Procrastination leads to success"]]

D["the_straw_that_broke_the_camels_back"]=[["The final small burden that causes a large accumulated problem to become intolerable.","The canceled flight was the straw that broke the camel's back after a long day of delays."],["Last straw","Tolerable burden"]]

D["the_writing_on_the_wall"]=[["Clear indications that something bad is going to happen.","With declining sales and increasing competition, the writing on the wall suggests the company needs a new strategy."],["Warning signs","No warning signs"]]

D["to_err_is_human_to_forgive_divine"]=[["It is natural for humans to make mistakes, and forgiveness is a noble quality.","She acknowledged her mistake, understanding that to err is human, to forgive divine."],["Human nature","Perfection"]]

D["turn_over_a_new_leaf"]=[["To make a fresh start or change for the better.","After the accident, he decided to turn over a new leaf and adopt a healthier lifestyle."],["Start anew","Continue old habits"]]

D["when_in_rome_do_as_the_romans_do"]=[["Adapt to the customs or behavior of the people in a new environment.","When visiting a foreign country, it's essential to remember 'when in Rome, do as the Romans do.'"], ["Adaptation","Insistence on own customs"]]

D["water_under_the_bridge"]=[["A past conflict or problem that has been resolved and should not be dwelled upon.","The disagreement between them is water under the bridge now; they have moved on."],["Forgiven and forgotten","Ongoing issue"]]

D["you_cant_judge_a_book_by_its_cover"]=[["One should not judge someone or something based solely on appearance.","She may seem reserved, but you can't judge a book by its cover; she's very friendly."],["Look beyond appearances","Judge solely on appearances"]]

def Choose():
  n=input("choose (1 or 2)")
  return True if n=="2" else False if  n=="1" else [print("\033[31mchoose from[1,2]\033[0m"),Choose()][1]
def Ask(w):
  s=random.choice([True,False])
  o=D[w][1][::-1] if s else D[w][1]
  print(f'which one is more similar to " \033[1m{w}\033[0m"?\n\033[33m{o}\033[0m')
  c=Choose()
  print("\033[32mCORRECT\033[0m"if s==c else "\033[31mNOPE!\033[0m")
  print(f"Meaning :\n\033[32m{D[w][0][0]}\033[0m\nSentence:\n\033[32m{D[w][0][1]}\033[0m\n")
  return True if s==c else False
def Quiz():
  W,c,t=list(D.keys()),0,0
  random.shuffle(W)
  for w in W:
    t+=1
    c+=Ask(w)
  return (f"\n\033[1m{c}/{t}\033[0m")
print(Quiz())