

# BitNode 5
## Introduction
This BitNode unlocks:
Intelligence: It's a permanent stat that buffs many things.
BitNode's multiplier data in UI and NS APIs.
Permanent access to Formulas.exe. Formulas APIs are useful for many mechanics, not just hacking. Having free access to them is a very good benefit.

Source-File 5 also buffs hacking-related multipliers. Hacking is a core mechanic, so it's always good to have higher hacking-related multipliers.

Intelligence

Intelligence is a stat that is unlocked by having Source-File 5 (i.e. Destroying BitNode-5).

Intelligence is unique because it is permanent and persistent. It never gets reset back to 1. However, gaining Intelligence experience is extremely slow. It is a stat that gradually builds up as you continue to play the game.

Intelligence will boost your production for many actions in the game, including:

0 - Hacking
0 - Infiltration
0/2 - Crime success rate
6/7 - Bladeburner actions
0 - Reputation gain for Companies & Factions
10 - Augmentation Grafting speed


https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/formulas/intelligence.ts
Share: increases effect
Hacking: chance, time
Grafting: time
Sleeve: synchronisation effect, shock recovery
Crime: chance
Create program: time
Darknet: authentication time
bladeburner: success chance

How to grow intelligence?
Reset (either by installing augments or soft reset) when factions are unlocked: more factions = more intelligence gain
Manual hacking (in the terminal) -> does it matter which server?


## Bitnode multipliers
ServerStartingSecurity: 2,
ServerStartingMoney: 0.5,

CloudServerSoftcap: 1.2,

CrimeMoney: 0.5,
HacknetNodeMoney: 0.2,
ScriptHackMoney: 0.15,

HackExpGain: 0.5,

AugmentationMoneyCost: 2,

InfiltrationMoney: 1.5,
InfiltrationRep: 1.5,

CorporationValuation: 0.75,
CorporationDivisions: 0.75,

GangUniqueAugs: 0.5,

StaneksGiftPowerMultiplier: 1.3,
StaneksGiftExtraSize: 0,

DarknetMoneyMultiplier: 0.7,

WorldDaemonDifficulty: 1.5,