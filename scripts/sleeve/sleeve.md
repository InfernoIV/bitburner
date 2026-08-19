//If you are not in BitNode-10, then you must have Source-File 10 in order to use this API.

/*
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.sleeve.md

SleeveBladeburnerTask		
SleeveClassTask
SleeveCompanyTask
SleeveCrimeTask
SleeveFactionTask
SleeveInfiltrateTask
SleevePerson
SleeveRecoveryTask
SleeveSupportTask
SleeveSynchroTask	

Sleeve						Sleeve API

Temporary (bitnode 10)
	getMemoryUpgradeCost(sleeveNumber, amount)		Get the cost of memory upgrades.
	upgradeMemory(sleeveNumber, amount)	Upgrade memory of a sleeve. You must be in BitNode 10 to use this API.
	getSleeveCost()		Get the cost of the next sleeve.
	purchaseSleeve()	Purchase a sleeve. You must be in BitNode 10 to use this API.


getNumSleeves()														Get the number of sleeves you own.
getSleeve(sleeveNumber)												Get information about a sleeve.
getSleeveAugmentationPrice(augName)									Get price of an augmentation.
getSleeveAugmentationRepReq(augName)								Get reputation requirement of an augmentation.
getSleeveAugmentations(sleeveNumber)								Get augmentations installed on a sleeve.
getSleevePurchasableAugs(sleeveNumber)								List purchasable augs for a sleeve.
getTask(sleeveNumber)												Get task of a sleeve.
purchaseSleeveAug(sleeveNumber, augName)							Purchase an aug for a sleeve.
setToBladeburnerAction(sleeveNumber, action, contract)				Set a sleeve to perform Bladeburner actions.
setToCommitCrime(sleeveNumber, crimeType)							Set a sleeve to commit crime.
setToCompanyWork(sleeveNumber, companyName)							Set a sleeve to work for a company.
setToFactionWork(sleeveNumber, factionName, factionWorkType)		Set a sleeve to work for a faction.
setToGymWorkout(sleeveNumber, gymName, stat)						Set a sleeve to workout at the gym.
setToIdle(sleeveNumber)												Set a sleeve to idle.
setToShockRecovery(sleeveNumber)									Set a sleeve to shock recovery.
setToSynchronize(sleeveNumber)										Set a sleeve to synchronize.
setToUniversityCourse(sleeveNumber, universityName, courseName)		Set a sleeve to take a class at a university.
travel(sleeveNumber, city)											Make a sleeve travel to another city. The cost for using this function is the same as for a player.

https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.sleevetask.md
SleeveTask type

Object representing a sleeve current task.

Signature:

export type SleeveTask =
  | SleeveBladeburnerTask
  | SleeveClassTask
  | SleeveCompanyTask
  | SleeveCrimeTask
  | SleeveFactionTask
  | SleeveInfiltrateTask
  | SleeveRecoveryTask
  | SleeveSupportTask
  | SleeveSynchroTask;

References: SleeveBladeburnerTask, SleeveClassTask, SleeveCompanyTask, SleeveCrimeTask, SleeveFactionTask, SleeveInfiltrateTask, SleeveRecoveryTask, SleeveSupportTask, SleeveSynchroTask

https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.nsenums.md
NSEnums type

Signature:

type NSEnums = {
  CityName: CityNameEnumType;
  CrimeType: CrimeEnumType;
  FactionWorkType: FactionWorkEnumType;
  GymType: GymEnumType;
  JobName: JobNameEnumType;
  JobField: JobFieldEnumType;
  LocationName: LocationNameEnumType;
  ToastVariant: ToastVariantEnumType;
  UniversityClassType: UniversityClassEnumType;
  CompanyName: CompanyNameEnumType;
  FactionName: FactionNameEnumType;
  CodingContractName: CodingContractNameEnumType;
  PositionType: PositionEnumType;
  OrderType: OrderEnumType;
  BladeburnerActionType: BladeburnerActionEnumType;
  SpecialBladeburnerActionTypeForSleeve: SpecialBladeburnerActionEnumTypeForSleeve;
  FragmentType: FragmentEnumType;
  DarknetResponseCode: DarknetResponseCodeType;
  ProgramName: ProgramNameEnumType;
  GangTaskName: GangTaskNameEnumType;
};

References: CityNameEnumType, CrimeEnumType, FactionWorkEnumType, GymEnumType, JobNameEnumType, JobFieldEnumType, LocationNameEnumType, ToastVariantEnumType, UniversityClassEnumType, CompanyNameEnumType, FactionNameEnumType, CodingContractNameEnumType, PositionEnumType, OrderEnumType, BladeburnerActionEnumType, SpecialBladeburnerActionEnumTypeForSleeve, FragmentEnumType, DarknetResponseCodeType, ProgramNameEnumType, GangTaskNameEnumType
*/



# BitNode 10
## Introduction
This BitNode unlocks Sleeves and Grafting.

Sleeves are your "copies", so they can do most things that you can do (studying, working, committing crimes, etc.). This mechanic synergizes well with mechanics involving slow tasks that can be boosted by doing things simultaneously (e.g., farming karma for Gang, generating contracts/operations for Bladeburner). You can buy up to 5 Sleeves from "The Covenant" faction. Each Source-File level grants you a Sleeve.

Grafting is a special way of installing augmentations.

    Grafting bypasses the need of resetting the main body and farming faction reputation.
        The augmentation is installed immediately after the grafting process finishes.
        The requirement of faction reputation is ignored when grafting.
    Grafting gives you a debuff that decreases many multipliers. This debuff can be removed by installing a special augmentation.

You should keep these things in mind:

    You cannot buy Sleeves and their memory upgrades outside this BitNode.
    Sleeves are expensive. The last Sleeve costs 100e15 (100q). You will need a batcher or a corporation.
    Due to the debuff, grafting is sometimes underestimated and underutilized. When grafting, you need to choose the augmentations carefully. If you choose appropriate ones, grafting is a very strong mechanic.

This BitNode's multipliers are fairly harsh. You will need a source of high income for the last Sleeve anyway, so harsh multipliers should not be a big problem. Utilizing the grafting mechanic properly lessens the harsh multipliers.


## Bitnode multipliers
HackingLevelMultiplier: 0.35,
StrengthLevelMultiplier: 0.4,
DefenseLevelMultiplier: 0.4,
DexterityLevelMultiplier: 0.4,
AgilityLevelMultiplier: 0.4,
CharismaLevelMultiplier: 0.4,

HomeComputerRamCost: 1.5,

CloudServerCost: 5,
CloudServerSoftcap: 1.1,
CloudServerLimit: 0.6,
CloudServerMaxRam: 0.5,

CompanyWorkMoney: 0.5,
CrimeMoney: 0.5,
HacknetNodeMoney: 0.5,
ManualHackMoney: 0.5,
ScriptHackMoney: 0.5,
CodingContractMoney: 0.5,

AugmentationMoneyCost: 5,
AugmentationRepCost: 2,

InfiltrationMoney: 0.5,

CorporationValuation: 0.5,
CorporationSoftcap: 0.9,
CorporationDivisions: 0.9,

BladeburnerRank: 0.8,

GangSoftcap: 0.9,
GangUniqueAugs: 0.25,

StaneksGiftPowerMultiplier: 0.75,
StaneksGiftExtraSize: -3,

DarknetMoneyMultiplier: 0.4,

WorldDaemonDifficulty: 2,


## Enums
Sleeve						Sleeve API
SleeveBladeburnerTask		
SleeveClassTask
SleeveCompanyTask
SleeveCrimeTask
SleeveFactionTask
SleeveInfiltrateTask
SleevePerson
SleeveRecoveryTask
SleeveSupportTask
SleeveSynchroTask	

Grafting		Grafting API
GraftingTask	Grafting Work
