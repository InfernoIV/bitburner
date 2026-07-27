//If you are not in BitNode-10, then you must have Source-File 10 in order to use this API.


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class sleeve_obj {
    constructor() {
      this.available = true
    }


    init(ns) {
        //ns.disableLog("")
    }

    manage(ns) {
      
    }
}


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

