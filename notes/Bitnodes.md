BitNodeBooleanOptions
Note:
    restrictHomePCUpgrade: The home computer's maximum RAM and number of cores are lower than normal. Max RAM: 128GB. Max core: 1.

    disableSleeveExpAndAugmentation: Your Sleeves do not gain experience when they perform action. You also cannot buy augmentations for them.

BitNodeMultipliers		All multipliers affecting the difficulty of the current challenge.

BitNodeOptions
	Default value:
		sourceFileOverrides: an empty Map
		intelligenceOverride: undefined
		All boolean options: false
	If you specify intelligenceOverride, it must be a positive integer.

BitNodeRequirement		Player must be located in this BitNode.


1	This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode and increases all of the player's multipliers by: 16% / 24% / 28%

2	This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It also increases your crime success rate, crime money, and charisma multipliers by: 24% / 36% / 42%

3	This Source-File lets you create corporations on other BitNodes (although some BitNodes will disable this mechanic) and level 3 permanently unlocks the full API. This Source-File also increases your charisma and company salary multipliers by: 8% / 12% / 14%

4	This Source-File lets you access and use the Singularity functions outside of this BitNode. Each level of this Source-File reduces the RAM cost of singularity functions in other BitNodes: 16x / 4x / 1x

5	This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other stats. Higher Intelligence levels will boost your production for many actions in the game. In addition, this Source-File will unlock: getBitNodeMultipliers() Netscript function, formulas, Access to BitNode multiplier information on the Stats page, It will also raise all of your hacking-related multipliers by:8%, 12%, 14%

6	This Source-File allows you to access the NSA's Bladeburner division in other BitNodes. In addition, this Source-File will raise both the level and experience gain rate of all your combat stats by: 8% / 12% / 14%

7	This Source-File allows you to access the NSA's Bladeburner division in other BitNodes. In addition, this Source-File will increase all of your Bladeburner multipliers by: 8% / 12& / 14% & receive the Blades Simulacrum augmentation after joining the Bladeburner division

8	This Source-File grants the following benefits:
    Level 1: Permanent access to WSE and TIX API
    Level 2: Ability to short stocks in other BitNodes
	Level 3: Ability to use limit/stop orders in other BitNodes
    This Source-File also increases your hacking growth multipliers by: 12% / 18% / 21%
	
9	This Source-File grants the following benefits:
	Level 1: Permanently unlocks the Hacknet Server in other BitNodes
	Level 2: You start with 128GB of RAM on your home computer when entering a new BitNode
	Level 3: Grants a highly-upgraded Hacknet Server when entering a new BitNode
	(Note that the Level 3 effect of this Source-File only applies when entering a new BitNode, NOT when installing augmentations)
	This Source-File also increases hacknet production and reduces hacknet costs by: 12% / 18% / 21%
	
10	This Source-File unlocks Sleeve and Grafting API in other BitNodes. Each level of this Source-File also grants you a Sleeve.

11	This Source-File makes it so that company favor increases BOTH the player's salary and reputation gain rate at that company by 1% per favor (rather than just the reputation gain). This Source-File also increases the player's company salary and reputation gain multipliers by: 32% / 48% / 56%
	It also reduces the price increase for every augmentation bought by: 4% / 6% / 7%
		
12	This Source-File lets you start any BitNodes with Neuroflux Governor equal to the level of this Source-File.</>,

13	This Source-File lets the ChurchOfTheMachineGod appear in other BitNodes. 
	Each level of this Source-File increases the size of Stanek's Gift.
    Due to the effect of Source-File 7.3, you must accept Stanek's Gift before joining the Bladeburner division if you have that Source-File.

14	This Source-File grants the following benefits:
Level 1: 100% increased stat multipliers from Node Power
Level 2: Permanently unlocks the go.cheat API
Level 3: 25% additive increased success rate for the go.cheat API
	This Source-File also increases the maximum favor from winstreaks you can gain for each faction to: 
		Level 1: 200k rep equivalent
		Level 2: 300k rep equivalent
		Level 3: 400k rep equivalent
	and increases the reputation converted to favor for winning two games in a row to:
		Level 1: 1000 rep to favor
		Level 2: 1500 rep to favor
		Level 3: 2000 rep to favor
		
15	This Source-File grants the following benefits:
	Level 1: Permanently start with the TOR router and darkscape, and unlock the full dark web on all BitNodes.
	Level 2: Your charisma level increases job salary and rep gain. Also increases authentication speed by 20%
	Level 3: Your charisma level increases faction work rep gain. Also increases the xp and money gained from .cache files by 50%.
	








https://github.com/bitburner-official/bitburner-src/blob/dev/src/BitNode/BitNode.tsx

1.1		Base
4.1		Unlock singularity -> Automate
4.2		Reduce cost of singularity -> Automate
4.3		Reduce cost of singularity -> Automate

5.1		Unlock intelligence, GetBitNodeMultipliers and formulas -> determine the best route to take (hacking / combat / other) & improves hacking script
10.1	Unlock sleeves	-> perform multiple tasks at the same time
9.1		Unlock hacknet -> ?
9.2		Start with 128GB Home -> easier targeted hacking

2.1		Unlock gang -> money
3.1		Unlock corporation -> money
6.1 / 7.1	Unlock bladeburner -> alternative way to win
7.3		Start with Blades Simulacrum when joining Bladeburners -> easier bladeburner
8.1		Unlock stock API -> money
8.3		Short and limit stocks -> money
10.3	Maximize sleeves -> faster progression
13.1	Unlock Stanek's gift -> bonuses
13.3	Maximize Stanek's gift -> bonuses
14.2	Unlock go.cheat API -> bonuses
15.1	Start with TOR router + darkscape program -> ?

https://github.com/bitburner-official/bitburner-src/blob/dev/src/Documentation/doc/en/advanced/bitnode_recommendation_comprehensive_guide.md
# Order advice
# The first choice

## BitNode 1
Repeating BitNode 1 is the best choice.
There is no penalty modifier in BitNode 1. It's the best place for you to improve your scripts and prepare for harder BitNodes.
The buff is huge. When you upgrade Source-File 1.1 to Source-File 1.2, you get a buff equivalent to 8 levels of NFG.

You should repeat it at least once to get Source-File 1.2. Most people complete this BitNode in one go and get Source-File 1.3.


# Early BitNodes
## BitNode 2
If you want to try different gameplay, BitNode 2 is a good choice. Gang is simple and useful in most BitNodes.

## BitNode 5
This is another good choice. Intelligence boosts many things, and it's permanent. Free access to Formulas APIs is very nice. A buff to hacking-related multipliers is useful in all BitNodes.


# Situational BitNodes and Hard BitNodes

## BitNode 4.
If you hate doing things manually and want to automate everything, you will have to use Singularity APIs of BitNode 4. Note that this BitNode is not easy. Its multipliers are harsh, especially if you skip early BitNodes and only have Source-File 1. You also need to complete it entirely and get Source-File 4.3. Otherwise, you will have to pay the massive RAM cost. If you don't mind doing things manually, Source-File 4 is not really important.

## BitNode 6 and BitNode 7 
Both BitNode 6 and BitNode 7 unlock Bladeburner. It's slow, but it's a good choice to beat extremely hard BitNodes (BitNode 9, BitNode 13). Ideally, you should complete both of them. However, if you decide to only use Bladeburner when needed and do not want to spend too much time doing both BitNodes, you can choose to complete only one of them. BitNode 6 is easier than BitNode 7, but Source-File 7 buffs Bladeburner's multipliers and gives you free access to "The Blade's Simulacrum" augmentation.

## BitNode 10 
This unlocks 2 strong mechanics at the same time. 
### Sleeves
Sleeves synergize well with many mechanics, especially Gang and Bladeburner. Grafting is useful in all BitNodes. Most people complete this BitNode in one go to get 8 Sleeves, but if you are in a rush, you can complete it once and get only Source-File 10.1. If you buy all 5 Sleeves from "The Covenant" faction, you will have 6 Sleeves and access to Grafting. That's not ideal, but still good enough.

## BitNode 14 
This enhances IPvGO. IPvGO is not locked behind this BitNode. It's available at the start of the game. You can play it by going to CIA (Sector-12) or using APIs in ns.go. If you have not touched that mechanic, you should do it now. IPvGO is tuned so that it still gives adequate benefits even if your script is only a slightly improved version of the tutorial script. Source-File 14 improves IPvGO's benefits and unlocks cheat APIs, which you can use to improve your win rate.

## BitNode 9 and BitNode 13 
These unlock HackNet server and Stanek's Gift, respectively. They are powerful mechanics that buff other mechanics, but these BitNodes are extremely hard. You should prepare carefully before entering them.

## BitNode 15 
This enhances the dark net. Darknet is not locked behind this BitNode. It's available at the start of the game. You can unlock it by buying the DarkscapeNavigator.exe from the terminal once you have a TOR router. If you haven't experimented with the mechanic, you should do so before entering BN15. You can complete BN15 with a simple script that only solves a few of the basic server puzzle types to get passwords and copies itself around, but it will be much slower than going through and solving a good fraction of the authentication puzzles.

# Challenging BitNodes
It's hard to recommend the priority of these BitNodes. They offer unique challenges. Some people can tackle them as early BitNodes without any problems. Some people complete them at the end, for the sake of completion. Some people despise and never touch them.

## BitNode 3: 
This BitNode is not exactly hard. You can avoid the Corporation mechanic and complete it without any problems by using any mechanics that you have. Many people use Gang or just hacking scripts to beat it. However, that is not the point of BitNode 3. This BitNode unlocks Corporation, which is one of the most controversial mechanics in Bitburner. You either love it or hate it. Feel free to choose your path.

## BitNode 8: 
You are forced to engage the stock market in this BitNode. The hardest part is to write a good (or at least usable) pre-4S stock market script. Even with good scripts, it still takes a long time to complete this BitNode. This is an interesting challenge.


# Special BitNodes
## BitNode 12 
This is a unique BitNode. In the first dozen levels, it's an easy one, and you can beat it with any mechanics. When the difficulty ramps up due to increasingly harsher multipliers, you have to constantly change your strategy and use different mechanics. Thinking outside the box and exploiting oversights in the interaction of mechanics are the keys to success. You should try this BitNode after unlocking all mechanics.

# Bad BitNodes
## BitNode 11 
This bitnode is hard, but its rewards are mediocre. You should only do it at the end, for the sake of completion.