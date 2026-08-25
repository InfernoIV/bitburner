//Not all these functions are immediately available. -> SF 9
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.hacknet.md



/*
Faction 'Netburners': '[{"type":"skills","skills":{"hacking":80}},
{"type":"hacknetRAM","hacknetRAM":8},
{"type":"hacknetCores","hacknetCores":4},
{"type":"hacknetLevels","hacknetLevels":100}]'
*/


# BitNode 9
## Introduction
This BitNode replaces HackNet Node with HackNet Server.

HackNet Servers generate hash. You can sell hash for money or a variety of upgrades that boost other mechanics. You can also run scripts on these servers, but doing it reduces the amount of hash produced.

Among the benefits of its Source-File, 2 most important ones are:

    Source-File 9.2: Start with 128GB of RAM on your home computer when entering a new BitNode.
    Source-File 9.3: Grant a highly upgraded Hacknet Server when entering a new BitNode. This effect only applies when entering a new BitNode, not when installing augmentations.

This BitNode's multipliers are extremely harsh. You should prepare carefully before entering it.

This BitNode disables private servers and significantly raises the RAM cost of your home computer. It also heavily nerfs hacking-related multipliers. You must find a way to properly utilize HackNet servers and their variety of upgrades. Inside this BitNode, you get the effect of Source-File 9.3 even before getting that Source-File. The free highly upgraded Hacknet Server is an extremely important asset at the start of the run.


## Bitnode multipliers
HackingLevelMultiplier: 0.5,
StrengthLevelMultiplier: 0.45,
DefenseLevelMultiplier: 0.45,
DexterityLevelMultiplier: 0.45,
AgilityLevelMultiplier: 0.45,
CharismaLevelMultiplier: 0.45,

ServerMaxMoney: 0.01,
ServerStartingMoney: 0.1,
ServerStartingSecurity: 2.5,

HomeComputerRamCost: 5,

CloudServerLimit: 0,

CrimeMoney: 0.5,
ScriptHackMoney: 0.1,

HackExpGain: 0.05,

FourSigmaMarketDataCost: 5,
FourSigmaMarketDataApiCost: 4,

CorporationValuation: 0.5,
CorporationSoftcap: 0.75,
CorporationDivisions: 0.8,

BladeburnerRank: 0.9,
BladeburnerSkillCost: 1.2,

GangSoftcap: 0.8,
GangUniqueAugs: 0.25,

StaneksGiftPowerMultiplier: 0.5,
StaneksGiftExtraSize: 2,

DarknetMoneyMultiplier: 0.05,

WorldDaemonDifficulty: 2,


## Enums
Hacknet						Hacknet API
HacknetCoresRequirement		Player's Hacknet devices must have at least this many total cores.
HacknetLevelsRequirement	Player's Hacknet devices must have at least this many total levels.
HacknetMultipliers			Hacknet related multipliers.
HacknetNodeConstants		Hacknet node related constants
HacknetNodesFormulas		Hacknet Node formulas
HacknetRAMRequirement		Player's Hacknet devices must have at least this much total RAM.	
HacknetServerConstants		Hacknet server related constants
HacknetServersFormulas		Hacknet Server formulas
NodeStats					Object representing all the values related to a hacknet node.