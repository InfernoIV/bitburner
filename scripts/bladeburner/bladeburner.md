# BitNode 6 and BitNode 7
## Introduction
These BitNodes unlock Bladeburner. Bladeburner gives you an alternative way to destroy WD. In Bladeburner, you can do many actions (General, Contracts, Operations, Black Operations) to get money, experience, Bladeburner's rank, etc. You can destroy WD after completing the last Black Operation.

Bladeburner is a slow mechanic, but it's rarely nerfed in other BitNodes. 
Even when it's nerfed, the nerf is not too severe. 
This is why Bladeburner is a good choice in extremely hard BitNodes (e.g., BitNode 9, BitNode 13).

Both BitNodes grant Bladeburner access outside these BitNodes. 
The differences are:
    BitNode 6 does not have Bladeburner's penalty modifiers. Its Source-File buffs combat stats' multipliers.
    BitNode 7 has Bladeburner's penalty modifiers. Its Source-File buffs Bladeburner's multipliers. Source-File 7.3 gives you free access to "The Blade's Simulacrum" augmentation. You will immediately receive this augmentation after joining the Bladeburner division.

When you are performing Bladeburner action, you cannot do other actions (working, committing crimes, etc.). 
It's a downside of Bladeburner. "The Blade's Simulacrum" augmentation removes this restriction by allowing you to perform Bladeburner actions and other actions at the same time.

This mechanic is time-gated by the slow generation speed of contracts/operations. 
Sleeves speed it up a lot.

You must be careful with chaos and Synthoid population. The UI shows you many hints about the effect of dangerous actions on chaos and Synthoid population. You should keep an eye on those hints. Generally, you must keep the chaos level low and not kill too much Synthoid population.


## Bitnode Multipliers
### Bitnode 6 / 7
HackingLevelMultiplier:         0.35,   0.35,

ServerMaxMoney:                 0.2,    0.2,
ServerStartingMoney:            0.5,    0.5,
ServerStartingSecurity:         1.5,    1.5,

CloudServerSoftcap:             2,      2,

CompanyWorkMoney:               0.5,    0.5,
CrimeMoney:                     0.75,   0.75,
HacknetNodeMoney:               0.2,    0.2,
ScriptHackMoney:                0.75,   0.5,    <-- 25% less hack script money 

HackExpGain:                    0.25,   0.25,

AugmentationMoneyCost:          1,      3,      <-- 200% more augment money cost

InfiltrationMoney:              0.75,   0.75,

FourSigmaMarketDataCost:        1,      2,      <-- 200% stock market data cost
FourSigmaMarketDataApiCost:     1,      2,      <-- 200% stock market data api cost

CorporationValuation:           0.2,    0.2,
CorporationSoftcap:             0.9,    0.9,
CorporationDivisions:           0.8,    0.8,

BladeburnerRank:                1,      0.6,    <-- 40% slower rank gain
BladeburnerSkillCost:           1,      2,      <-- 200% more cost for skills

GangSoftcap:                    0.7,    0.7,
GangUniqueAugs:                 0.2,    0.2,

DaedalusAugsRequirement:        35,

StaneksGiftPowerMultiplier:     0.5,    0.9,    <-- 40% improved stanek gift effect
StaneksGiftExtraSize:           2,      -1,     <-- 3 smaller stanek size 

WorldDaemonDifficulty:          2,      2,

### Bitnode 6 
HackingLevelMultiplier: 0.35,

ServerMaxMoney: 0.2,
ServerStartingMoney: 0.5,
ServerStartingSecurity: 1.5,

CloudServerSoftcap: 2,

CompanyWorkMoney: 0.5,
CrimeMoney: 0.75,
HacknetNodeMoney: 0.2,
ScriptHackMoney: 0.75,

HackExpGain: 0.25,

InfiltrationMoney: 0.75,

CorporationValuation: 0.2,
CorporationSoftcap: 0.9,
CorporationDivisions: 0.8,

GangSoftcap: 0.7,
GangUniqueAugs: 0.2,

DaedalusAugsRequirement: 35,

StaneksGiftPowerMultiplier: 0.5,
StaneksGiftExtraSize: 2,

WorldDaemonDifficulty: 2,

### Bitnode 7
HackingLevelMultiplier: 0.35,

ServerMaxMoney: 0.2,
ServerStartingMoney: 0.5,
ServerStartingSecurity: 1.5,

CloudServerSoftcap: 2,

CompanyWorkMoney: 0.5,
CrimeMoney: 0.75,
HacknetNodeMoney: 0.2,
ScriptHackMoney: 0.5,

HackExpGain: 0.25,

AugmentationMoneyCost: 3,

InfiltrationMoney: 0.75,

FourSigmaMarketDataCost: 2,
FourSigmaMarketDataApiCost: 2,

CorporationValuation: 0.2,
CorporationSoftcap: 0.9,
CorporationDivisions: 0.8,

BladeburnerRank: 0.6,
BladeburnerSkillCost: 2,

GangSoftcap: 0.7,
GangUniqueAugs: 0.2,

DaedalusAugsRequirement: 35,

StaneksGiftPowerMultiplier: 0.9,
StaneksGiftExtraSize: -1,

WorldDaemonDifficulty: 2,


## Enums
Bladeburner API 
BladeburnerCurAction    Bladeburner current action.
BladeburnerFormulas     Bladeburner formulas
BladeburnerRankRequirement  Player must have at least this rank in the Bladeburner Division.

//You have to be employed in the Bladeburner division and be in BitNode 6/7 or have Source-File 6/7 in order to use this API.
/*
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.bladeburner.md
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.bladeburneractionenumtype.md
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.specialbladeburneractionenumtypeforsleeve.md
*/

/*
// Get whether an action is set to autolevel.
ns.bladeburner.getActionAutolevel(type, name)

//Get the current level of an action.
ns.bladeburner.getActionCurrentLevel(type, name)       
               

//Get the maximum level of an action.
ns.bladeburner.getActionMaxLevel(type, name)
		



	


	

	



BladeburnerActionEnumType				Action types of Bladeburner
BladeburnerActionName
BladeburnerActionType
BladeburnerActionTypeForSleeve
BladeburnerBlackOpName
BladeburnerBlackOpNameEnumType			Black Operation names of Bladeburner
BladeburnerContractName
BladeburnerContractNameEnumType			Contract names of Bladeburner
BladeburnerGeneralActionName
BladeburnerGeneralActionNameEnumType	General action names of Bladeburner
BladeburnerOperationName
BladeburnerOperationNameEnumType		Operation names of Bladeburner
BladeburnerSkillName
BladeburnerSkillNameEnumType			Skill names type of Bladeburner




*/