//Requires SF 13
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.md

/*

Stanek		Stanek's Gift API.


acceptGift()											Accept Stanek's Gift by joining the Church of the Machine God
activeFragments()										List of fragments in Stanek's Gift.
canPlaceFragment(rootX, rootY, rotation, fragmentId)	Check if fragment can be placed at specified location.
chargeFragment(rootX, rootY)							Charge a fragment, increasing its power.
clearGift()												Clear the board of all fragments.
fragmentDefinitions()									List possible fragments.
getFragment(rootX, rootY)								Get placed fragment at location.
giftHeight()											Stanek's Gift height.
giftWidth()												Stanek's Gift width.
placeFragment(rootX, rootY, rotation, fragmentId)		Place fragment on Stanek's Gift.
removeFragment(rootX, rootY)							Remove fragment at location.

*/

# Bitnode 13
## Introduction


## Bitnode multipliers
HackingLevelMultiplier: 0.25,
StrengthLevelMultiplier: 0.7,
DefenseLevelMultiplier: 0.7,
DexterityLevelMultiplier: 0.7,
AgilityLevelMultiplier: 0.7,
CharismaLevelMultiplier: 0.7,

CloudServerSoftcap: 1.6,

ServerMaxMoney: 0.3375,
ServerStartingMoney: 0.75,
ServerStartingSecurity: 3,

CompanyWorkMoney: 0.4,
CrimeMoney: 0.4,
HacknetNodeMoney: 0.4,
ScriptHackMoney: 0.2,
CodingContractMoney: 0.4,

ClassGymExpGain: 0.5,
CompanyWorkExpGain: 0.5,
CrimeExpGain: 0.5,
FactionWorkExpGain: 0.5,
HackExpGain: 0.1,

FactionWorkRepGain: 0.6,

FourSigmaMarketDataCost: 10,
FourSigmaMarketDataApiCost: 10,

CorporationValuation: 0.001,
CorporationSoftcap: 0.4,
CorporationDivisions: 0.4,

BladeburnerRank: 0.45,
BladeburnerSkillCost: 2,

GangSoftcap: 0.3,
GangUniqueAugs: 0.1,

StaneksGiftPowerMultiplier: 2,
StaneksGiftExtraSize: 1,
DarknetMoneyMultiplier: 0.1,

WorldDaemonDifficulty: 3,


## Enums
Stanek		Stanek's Gift API.