import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

//object programs
import {
    root_obj
} from "scripts/sub/root.js"
import {
    hack_obj
} from "scripts/sub/hack.js"
import {
    darknet_obj
} from "scripts/sub/darknet.js"
import {
    cloud_obj
} from "scripts/sub/cloud.js"
import {
    go_obj
} from "scripts/sub/go.js"
import {
    coding_contract_obj
} from "scripts/sub/coding_contract.js"
import {
    stock_obj
} from "scripts/sub/stock.js"
import {
    ui_obj
} from "scripts/sub/ui.js"
import {
    infiltration_obj
} from "scripts/sub/infiltration.js"
import {
    singularity_obj
} from "scripts/sub/singularity.js"
import {
    sleeve_obj
} from "scripts/sub/sleeve.js"
import {
    bladeburner_obj
} from "scripts/sub/bladeburner.js"
import {
    stanek_obj
} from "scripts/sub/stanek.js"
import {
    gang_obj
} from "scripts/sub/gang.js"
import {
    hacknet_obj
} from "scripts/sub/hacknet.js"
import {
    grafting_obj
} from "scripts/sub/grafting.js"
import {
    corporation_obj
} from "scripts/sub/corporation.js"
import {
    share_exec
} from "scripts/sub/share.js"


// Declaration
export class ram_obj {
    constructor() {
        //keeps track of registered handles
        this.handles = {}
        //keep track of ram usage
        this.ram_used = 0
        //keep track of what claimed what
        this.registration = new Map()       
    }


    //sets the basic information
    async init(ns) {
        //ns.disableLog("")
        //save initial ram cost
        this.ram_used = Math.ceil((CONSTANTS.RAM.MAIN + CONSTANTS.RAM.RAM)*100) / 100
        //allocate ram
        ns.ramOverride(this.ram_used)
        //log
        log.info(ns, "Ram", "Starting with RAM: " + this.ram_used, true)
        //get reset info
        const reset_information = ns.getResetInfo()
        //get source files
        this.source_files_owned = reset_information.ownedSF
        //keep track of which node you are in (this also unlocks functionality)
        this.current_node = reset_information.currentNode
        //set bitnode multipliers
        this.bitnode_multipliers = { //set to generic values, to be corrected later
            //1: cloud
            CloudServerLimit: 1,
            CloudServerMaxRam: 1,
            //2: gang
            GangSoftcap: 1,
            //3: corporation
            CorporationSoftcap: 1,
            //4: singularity
            //nothing
            //5: intelligence
            //nothing
            //6&7: bladeburner
            BladeburnerRank: 1,
            //8: stock
            //nothing
            //9: hacknet
            //HacknetNodeMoney can be 0
            //10: sleeve / grafting
            //nothing
            //13: stanek
            StaneksGiftExtraSize: 0,
            //14: go
            //GoPower
            //15: darknet
            //DarknetMoneyMultiplier
        }
        //check if we have intelligence to fill bitnode multipliers
        if (this.get_source_file_level(5) > 0) {
            //register handle
            if (await this.register_handle(ns, CONSTANTS.HANDLE.INTELLIGENCE, {}, 4)) {
                //get bitnode multipliers
                this.bitnode_multipliers = ns.getBitNodeMultipliers()
            }
        }
    }   


    //function that kicks off all other manage functions
    async manage_functionalities(ns) {
        //for each functionality
        for (const handle in this.handles) {
            //check if it has an manage function
            if (typeof this.handles[handle].manage === "function") { 
                //manage the functionality
                await this.handles[handle].manage(ns, this.handles)
            }
        }
    }
    

    //function that registers a class to init and manage (assumes the object has both functions!)
    async register_handle(ns, handle, object, sf_required = 0, sf_level_required = 1, dependency = "") {
        //log.info(ns, "Ram", "Registering handle: '" + handle + "' => '" + JSON.stringify(object) + "'", true)
        //check if we already have this functionality handles
        if (this.registration.has(handle)) {
            //log.info(ns, "Ram", "Handle '" + + "' was already registered", true)
            //stop
            return true
        }
        //check for dependencies
        if (dependency != "") {
            //if we don't have an object handles
            if (!this.registration.has(dependency)) {
                //stop
                return false
            }
        }
        //check if we can run this
        if (sf_required > 0) {
            const level = this.get_source_file_level(sf_required)
            if(level < sf_level_required) {
                //log.info(ns, "Ram", "SF " + sf_required + " has too little level: " + level + ", need: " + sf_level_required, true)
                //not enough levels, stop
                return false
            }
        }
        //get ram cost
        const ram_cost = CONSTANTS.RAM[handle]
        //get ram left
        const ram_max = ns.getServer(CONSTANTS.SERVER.HOME).maxRam
        //check if we can register
        if ((this.ram_used + ram_cost) > ram_max) {
            //log.info(ns, "Ram", "Not enoug ram" + this.ram_used + " + " + ram_cost + " = " + (this.ram_used + ram_cost) + " > " + ram_max + " GB", true)
            //not enough ram, stop
            return false
        } 
        //kill all other scripts (share.js)
        ns.killall(CONSTANTS.SERVER.HOME, true)

         //log
        log.success(ns, "Ram", "Registered handle '" + handle + "' for " + this.ram_used + " + " + ram_cost + " = " + (this.ram_used + ram_cost) +  " / " + ram_max + " GB", true)
        //update ram
        this.ram_used += ram_cost
        //apply ram
        ns.ramOverride(this.ram_used)
        //register object
        this.handles[handle] = object
        //register in registry as well
        this.registration.set(handle, ram_cost)
        //check if it has an init function
        if (typeof this.handles[handle].init === "function") { 
            //init object
            await this.handles[handle].init(ns, this.handles)
        }
        
        //start share (again)
        share_exec(ns)

        //return success
        return true
    }


    //gets the source file level, including counting if you're in the bitnode
    get_source_file_level(source_file) {
        var level = 0
        //check if we have the source file
        if (this.source_files_owned.hasOwnProperty(source_file)) {
            //get the level
            level = this.source_files_owned[source_file]
        }
        //check if we are in the node
        if (this.current_node == source_file) {
            //add a level, but cap to 3
            level = Math.min(level+1, 3)
        }
        //return the level
        return level
    }


    //function that manages the imports (in this order)
    async import(ns) {
        //loop for easy breaking
        while(true) {
            //register each handle and return if not successfull (e.g. no ram)
            //indicate if stanek is available to join asap
            await this.register_handle(ns, CONSTANTS.HANDLE.STANEK_AVAILABLE, {}, 13)
            
            
            //AUTOMATION
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.SINGULARITY, new singularity_obj(), 4)) break
            //if darknet is available, we save 2 GBs (on singularity)
            await this.register_handle(ns, CONSTANTS.HANDLE.DARKNET_AVAILABLE, {}, 15, 1, CONSTANTS.HANDLE.SINGULARITY)
            //IMPROVE AUTOMATION
            await this.register_handle(ns, CONSTANTS.HANDLE.SLEEVE, new sleeve_obj(), 10)
            
            //BASE
            await this.register_handle(ns, CONSTANTS.HANDLE.ROOT, new root_obj())
            await this.register_handle(ns, CONSTANTS.HANDLE.HACK, new hack_obj())
            await this.register_handle(ns, CONSTANTS.HANDLE.DARKNET, new darknet_obj())
            

            //GO
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.GO, new go_obj())) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.GO_ANALYSIS, {}, 0, 0, CONSTANTS.HANDLE.GO)) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.GO_CHEAT, {}, 14, 2, CONSTANTS.HANDLE.GO_ANALYSIS)) break

            //EXTEND SINGULARITY
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.BLADEBURNER, new bladeburner_obj(), 6, 1, CONSTANTS.HANDLE.SINGULARITY) || 
                !await this.register_handle(ns, CONSTANTS.HANDLE.BLADEBURNER, new bladeburner_obj(), 7, 1, CONSTANTS.HANDLE.SINGULARITY) ) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.GRAFTING, new grafting_obj(), 10, 1, CONSTANTS.HANDLE.SINGULARITY)) break
            
            //EXTEND FUNCTIONALITY
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.STANEK, new stanek_obj(), 13)) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.CLOUD, new cloud_obj())) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.CODING_CONTRACT, new coding_contract_obj())) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.STOCK, new stock_obj())) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.INFILTRATION, new infiltration_obj())) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.GANG, new gang_obj(), 2)) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.HACKNET, new hacknet_obj(), 9)) break
            if (!await this.register_handle(ns, CONSTANTS.HANDLE.CORPORATION, new corporation_obj(), 3)) break
            
            break
        }
        //log.info(ns, "Ram", "Import complete: '" + [...this.registration.entries()] + "'", true)
    }
}

/*
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Netscript/RamCostGenerator.ts

export const RamCostConstants = {
  Base: 1.6,
  Dom: 25,
  CorporationInfo: 10,
  CorporationAction: 20,
  Max: 1024,
  Hack: 0.1,
  HackAnalyze: 1,
  Grow: 0.15,
  GrowthAnalyze: 1,
  Weaken: 0.15,
  WeakenAnalyze: 1,
  Scan: 0.2,
  RecentScripts: 0.2,
  PortProgram: 0.05,
  Run: 1.0,
  Exec: 1.3,
  Spawn: 2.0,
  Scp: 0.6,
  Kill: 0.5,
  HasRootAccess: 0.05,
  GetHostname: 0.05,
  GetHackingLevel: 0.05,
  GetServer: 0.1,
  GetServerMaxRam: 0.05,
  GetServerUsedRam: 0.05,
  FileExists: 0.1,
  IsRunning: 0.1,
  Hacknet: 0.5,
  HNUpgLevel: 0.4,
  HNUpgRam: 0.6,
  HNUpgCore: 0.8,
  GetStock: 2.0,
  BuySellStock: 2.5,
  Round: 0.05,
  ArbScript: 1.0,
  GetScript: 0.1,
  GetRunningScript: 0.3,
  GetHackTime: 0.05,
  GetFavorToDonate: 0.1,
  CodingContractBase: 10,
  SleeveBase: 4,
  ClearTerminalCost: 0.2,
  GetMoneySourcesCost: 1.0,

  SingularityFn1: 2,
  SingularityFn2: 3,
  SingularityFn3: 5,

  GangApiBase: 4,

  BladeburnerApiBase: 4,

  StanekWidth: 0.4,
  StanekHeight: 0.4,
  StanekCharge: 0.4,
  StanekFragmentDefinitions: 0,
  StanekPlacedFragments: 5,
  StanekClear: 0,
  StanekCanPlace: 0.5,
  StanekPlace: 5,
  StanekFragmentAt: 2,
  StanekDeleteAt: 0.15,
  StanekAcceptGift: 2,

  InfiltrationCalculateDifficulty: 2.5,
  InfiltrationCalculateRewards: 2.5,
  InfiltrationGetInfiltrations: 15,

  CycleTiming: 0,
} as const;

// Hacknet API
const hacknet = {
  numNodes: RamCostConstants.Hacknet,
  purchaseNode: RamCostConstants.Hacknet,
  getPurchaseNodeCost: RamCostConstants.Hacknet,
  getNodeStats: RamCostConstants.Hacknet,
  upgradeLevel: RamCostConstants.Hacknet,
  upgradeRam: RamCostConstants.Hacknet,
  upgradeCore: RamCostConstants.Hacknet,
  upgradeCache: RamCostConstants.Hacknet,
  getLevelUpgradeCost: RamCostConstants.Hacknet,
  getRamUpgradeCost: RamCostConstants.Hacknet,
  getCoreUpgradeCost: RamCostConstants.Hacknet,
  getCacheUpgradeCost: RamCostConstants.Hacknet,
  numHashes: RamCostConstants.Hacknet,
  hashCost: RamCostConstants.Hacknet,
  spendHashes: RamCostConstants.Hacknet,
  maxNumNodes: RamCostConstants.Hacknet,
  hashCapacity: RamCostConstants.Hacknet,
  getHashUpgrades: RamCostConstants.Hacknet,
  getHashUpgradeLevel: RamCostConstants.Hacknet,
  getStudyMult: RamCostConstants.Hacknet,
  getTrainingMult: RamCostConstants.Hacknet,
} as const;

// Stock API
const stock = {
  getConstants: 0,
  hasWseAccount: 0.05,
  hasTixApiAccess: 0.05,
  has4SData: 0.05,
  has4SDataTixApi: 0.05,
  getBonusTime: 0,
  nextUpdate: RamCostConstants.CycleTiming,
  getSymbols: RamCostConstants.GetStock,
  getPrice: RamCostConstants.GetStock,
  getOrganization: RamCostConstants.GetStock,
  getAskPrice: RamCostConstants.GetStock,
  getBidPrice: RamCostConstants.GetStock,
  getPosition: RamCostConstants.GetStock,
  getMaxShares: RamCostConstants.GetStock,
  getPurchaseCost: RamCostConstants.GetStock,
  getSaleGain: RamCostConstants.GetStock,
  buyStock: RamCostConstants.BuySellStock,
  sellStock: RamCostConstants.BuySellStock,
  buyShort: RamCostConstants.BuySellStock,
  sellShort: RamCostConstants.BuySellStock,
  placeOrder: RamCostConstants.BuySellStock,
  cancelOrder: RamCostConstants.BuySellStock,
  getOrders: RamCostConstants.BuySellStock,
  getVolatility: RamCostConstants.BuySellStock,
  getForecast: RamCostConstants.BuySellStock,
  purchase4SMarketData: RamCostConstants.BuySellStock,
  purchase4SMarketDataTixApi: RamCostConstants.BuySellStock,
  purchaseWseAccount: RamCostConstants.BuySellStock,
  purchaseTixApi: RamCostConstants.BuySellStock,
} as const;

// Singularity API
const singularity = {
  universityCourse: SF4Cost(RamCostConstants.SingularityFn1),
  gymWorkout: SF4Cost(RamCostConstants.SingularityFn1),
  travelToCity: SF4Cost(RamCostConstants.SingularityFn1),
  goToLocation: SF4Cost(RamCostConstants.SingularityFn3),
  purchaseTor: SF4Cost(RamCostConstants.SingularityFn1),
  purchaseProgram: SF4Cost(RamCostConstants.SingularityFn1),
  getCurrentServer: SF4Cost(RamCostConstants.SingularityFn1),
  getCompanyPositionInfo: SF4Cost(RamCostConstants.SingularityFn1),
  getCompanyPositions: SF4Cost(RamCostConstants.SingularityFn1),
  cat: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  connect: SF4Cost(RamCostConstants.SingularityFn1),
  manualHack: SF4Cost(RamCostConstants.SingularityFn1),
  installBackdoor: SF4Cost(RamCostConstants.SingularityFn1),
  getDarkwebProgramCost: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  getDarkwebPrograms: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  hospitalize: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  isBusy: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  stopAction: SF4Cost(RamCostConstants.SingularityFn1 / 2),
  upgradeHomeRam: SF4Cost(RamCostConstants.SingularityFn2),
  upgradeHomeCores: SF4Cost(RamCostConstants.SingularityFn2),
  getUpgradeHomeRamCost: SF4Cost(RamCostConstants.SingularityFn2 / 2),
  getUpgradeHomeCoresCost: SF4Cost(RamCostConstants.SingularityFn2 / 2),
  workForCompany: SF4Cost(RamCostConstants.SingularityFn2),
  applyToCompany: SF4Cost(RamCostConstants.SingularityFn2),
  quitJob: SF4Cost(RamCostConstants.SingularityFn2),
  getCompanyRep: SF4Cost(RamCostConstants.SingularityFn2 / 3),
  getCompanyFavor: SF4Cost(RamCostConstants.SingularityFn2 / 3),
  getCompanyFavorGain: SF4Cost(RamCostConstants.SingularityFn2 / 4),
  getFactionInviteRequirements: SF4Cost(RamCostConstants.SingularityFn2),
  getFactionEnemies: SF4Cost(RamCostConstants.SingularityFn2),
  checkFactionInvitations: SF4Cost(RamCostConstants.SingularityFn2),
  joinFaction: SF4Cost(RamCostConstants.SingularityFn2),
  workForFaction: SF4Cost(RamCostConstants.SingularityFn2),
  getFactionWorkTypes: SF4Cost(RamCostConstants.SingularityFn2 / 3),
  getFactionRep: SF4Cost(RamCostConstants.SingularityFn2 / 3),
  getFactionFavor: SF4Cost(RamCostConstants.SingularityFn2 / 3),
  getFactionFavorGain: SF4Cost(RamCostConstants.SingularityFn2 / 4),
  donateToFaction: SF4Cost(RamCostConstants.SingularityFn3),
  createProgram: SF4Cost(RamCostConstants.SingularityFn3),
  getHackingLevelRequirementOfProgram: SF4Cost(RamCostConstants.SingularityFn3),
  commitCrime: SF4Cost(RamCostConstants.SingularityFn3),
  getCrimeChance: SF4Cost(RamCostConstants.SingularityFn3),
  getCrimeStats: SF4Cost(RamCostConstants.SingularityFn3),
  getOwnedAugmentations: SF4Cost(RamCostConstants.SingularityFn3),
  getOwnedSourceFiles: SF4Cost(RamCostConstants.SingularityFn3),
  getAugmentationFactions: SF4Cost(RamCostConstants.SingularityFn3),
  getAugmentationsFromFaction: SF4Cost(RamCostConstants.SingularityFn3),
  getAugmentationPrereq: SF4Cost(RamCostConstants.SingularityFn3),
  getAugmentationPrice: SF4Cost(RamCostConstants.SingularityFn3 / 2),
  getAugmentationBasePrice: SF4Cost(RamCostConstants.SingularityFn3 / 2),
  getAugmentationRepReq: SF4Cost(RamCostConstants.SingularityFn3 / 2),
  getAugmentationStats: SF4Cost(RamCostConstants.SingularityFn3),
  purchaseAugmentation: SF4Cost(RamCostConstants.SingularityFn3),
  softReset: SF4Cost(RamCostConstants.SingularityFn3),
  installAugmentations: SF4Cost(RamCostConstants.SingularityFn3),
  isFocused: SF4Cost(0.1),
  setFocus: SF4Cost(0.1),
  getSaveData: SF4Cost(RamCostConstants.SingularityFn1 / 2),
  exportGame: SF4Cost(RamCostConstants.SingularityFn1 / 2),
  exportGameBonus: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  hasExportGameBonus: SF4Cost(RamCostConstants.SingularityFn1 / 4),
  b1tflum3: SF4Cost(16),
  destroyW0r1dD43m0n: SF4Cost(32),
  getCurrentWork: SF4Cost(0.5),
  getUnlockedAchievements: SF4Cost(RamCostConstants.SingularityFn3),
} as const;

const cloud = {
  getServerLimit: 0.05,
  getRamLimit: 0.05,
  getServerCost: 0.25,
  getServerUpgradeCost: 0.1,
  getServerNames: 1.05,
  upgradeServer: 0.25,
  renameServer: 0,
  purchaseServer: 2.25,
  deleteServer: 2.25,
} as const;

// Darknet API
const dnet = {
  authenticate: 0.4,
  connectToSession: 0.05,
  freezeServer: 2,
  heartbleed: 0.6,
  openCache: 2,
  probe: RamCostConstants.Scan,
  setStasisLink: 12,
  getStasisLinkLimit: 0,
  getStasisLinkedServers: 0,
  getServer: 2,
  getServerDetails: RamCostConstants.GetServer,
  induceServerMigration: 4,
  unleashStormSeed: 0.1,
  isDarknetServer: RamCostConstants.GetServer,
  memoryReallocation: 1,
  getBlockedRam: 0,
  getDepth: RamCostConstants.GetServer,
  promoteStock: 2,
  phishingAttack: 2,
  getDarknetInstability: 0,
  nextMutation: RamCostConstants.CycleTiming,
  getServerRequiredCharismaLevel: RamCostConstants.GetServer,
  labreport: 0,
  labradar: 0,
} as const;

const format = {
  number: 0,
  ram: 0,
  percent: 0,
  time: 0,
  money: 0,
} as const;

// Gang API
const gang = {
  createGang: RamCostConstants.GangApiBase / 4,
  inGang: 0,
  getMemberNames: RamCostConstants.GangApiBase / 4,
  renameMember: 0,
  getGangInformation: RamCostConstants.GangApiBase / 2,
  getAllGangInformation: RamCostConstants.GangApiBase / 2,
  getMemberInformation: RamCostConstants.GangApiBase / 2,
  canRecruitMember: RamCostConstants.GangApiBase / 4,
  getRecruitsAvailable: RamCostConstants.GangApiBase / 4,
  respectForNextRecruit: RamCostConstants.GangApiBase / 4,
  recruitMember: RamCostConstants.GangApiBase / 2,
  getTaskNames: 0,
  getTaskStats: RamCostConstants.GangApiBase / 4,
  setMemberTask: RamCostConstants.GangApiBase / 2,
  getEquipmentNames: 0,
  getEquipmentCost: RamCostConstants.GangApiBase / 2,
  getEquipmentType: RamCostConstants.GangApiBase / 2,
  getEquipmentStats: RamCostConstants.GangApiBase / 2,
  purchaseEquipment: RamCostConstants.GangApiBase,
  ascendMember: RamCostConstants.GangApiBase,
  getAscensionResult: RamCostConstants.GangApiBase / 2,
  getInstallResult: RamCostConstants.GangApiBase / 2,
  setTerritoryWarfare: RamCostConstants.GangApiBase / 2,
  getChanceToWinClash: RamCostConstants.GangApiBase,
  getBonusTime: 0,
  nextUpdate: RamCostConstants.CycleTiming,
} as const;

// Go API
const go = {
  makeMove: 4,
  passTurn: 0,
  getBoardState: 4,
  getMoveHistory: 0,
  getCurrentPlayer: 0,
  getGameState: 0,
  getOpponent: 0,
  opponentNextTurn: 0,
  resetBoardState: 0,
  analysis: {
    getValidMoves: 8,
    getChains: 16,
    getLiberties: 16,
    getControlledEmptyNodes: 16,
    getStats: 0,
    resetStats: 0,
    setTestingBoardState: 4,
    highlightPoint: 0,
    clearPointHighlight: 0,
    clearAllPointHighlights: 0,
  },
  cheat: {
    getCheatSuccessChance: 1,
    getCheatCount: 1,
    removeRouter: 8,
    playTwoMoves: 8,
    repairOfflineNode: 8,
    destroyNode: 8,
  },
} as const;

// Bladeburner API
const bladeburner = {
  inBladeburner: 0,
  getContractNames: 0,
  getOperationNames: 0,
  getBlackOpNames: 0,
  getNextBlackOp: RamCostConstants.BladeburnerApiBase / 2,
  getBlackOpRank: RamCostConstants.BladeburnerApiBase / 2,
  getGeneralActionNames: 0,
  getSkillNames: 0,
  startAction: RamCostConstants.BladeburnerApiBase,
  stopBladeburnerAction: RamCostConstants.BladeburnerApiBase / 2,
  getCurrentAction: RamCostConstants.BladeburnerApiBase / 4,
  getActionTime: RamCostConstants.BladeburnerApiBase,
  getActionCurrentTime: RamCostConstants.BladeburnerApiBase,
  getActionEstimatedSuccessChance: RamCostConstants.BladeburnerApiBase,
  getActionRepGain: RamCostConstants.BladeburnerApiBase,
  getActionRankGain: RamCostConstants.BladeburnerApiBase,
  getActionRankLoss: RamCostConstants.BladeburnerApiBase,
  getActionCountRemaining: RamCostConstants.BladeburnerApiBase,
  getActionMaxLevel: RamCostConstants.BladeburnerApiBase,
  getActionCurrentLevel: RamCostConstants.BladeburnerApiBase,
  getActionAutolevel: RamCostConstants.BladeburnerApiBase,
  getActionSuccesses: RamCostConstants.BladeburnerApiBase,
  setActionAutolevel: RamCostConstants.BladeburnerApiBase,
  setActionLevel: RamCostConstants.BladeburnerApiBase,
  getRank: RamCostConstants.BladeburnerApiBase,
  getSkillPoints: RamCostConstants.BladeburnerApiBase,
  getSkillLevel: RamCostConstants.BladeburnerApiBase,
  getSkillUpgradeCost: RamCostConstants.BladeburnerApiBase,
  upgradeSkill: RamCostConstants.BladeburnerApiBase,
  getTeamSize: RamCostConstants.BladeburnerApiBase,
  setTeamSize: RamCostConstants.BladeburnerApiBase,
  getCityEstimatedPopulation: RamCostConstants.BladeburnerApiBase,
  getCityCommunities: RamCostConstants.BladeburnerApiBase,
  getCityChaos: RamCostConstants.BladeburnerApiBase,
  getCity: RamCostConstants.BladeburnerApiBase,
  switchCity: RamCostConstants.BladeburnerApiBase,
  getStamina: RamCostConstants.BladeburnerApiBase,
  joinBladeburnerFaction: RamCostConstants.BladeburnerApiBase,
  joinBladeburnerDivision: RamCostConstants.BladeburnerApiBase,
  getBonusTime: 0,
  nextUpdate: RamCostConstants.CycleTiming,
} as const;

const infiltration = {
  getPossibleLocations: 0,
  getInfiltration: RamCostConstants.InfiltrationGetInfiltrations,
} as const;

// Coding Contract API
const codingcontract = {
  attempt: RamCostConstants.CodingContractBase,
  getContractType: RamCostConstants.CodingContractBase / 2,
  getData: RamCostConstants.CodingContractBase / 2,
  getContract: RamCostConstants.CodingContractBase * (3 / 2),
  getDescription: RamCostConstants.CodingContractBase / 2,
  getNumTriesRemaining: RamCostConstants.CodingContractBase / 5,
  createDummyContract: RamCostConstants.CodingContractBase / 5,
  getContractTypes: 0,
} as const;

// Duplicate Sleeve API
const sleeve = {
  getNumSleeves: RamCostConstants.SleeveBase,
  setToIdle: RamCostConstants.SleeveBase,
  setToShockRecovery: RamCostConstants.SleeveBase,
  setToSynchronize: RamCostConstants.SleeveBase,
  setToCommitCrime: RamCostConstants.SleeveBase,
  setToUniversityCourse: RamCostConstants.SleeveBase,
  travel: RamCostConstants.SleeveBase,
  setToCompanyWork: RamCostConstants.SleeveBase,
  setToFactionWork: RamCostConstants.SleeveBase,
  setToGymWorkout: RamCostConstants.SleeveBase,
  getTask: RamCostConstants.SleeveBase,
  getSleeve: RamCostConstants.SleeveBase,
  getSleeveAugmentations: RamCostConstants.SleeveBase,
  getSleevePurchasableAugs: RamCostConstants.SleeveBase,
  purchaseSleeveAug: RamCostConstants.SleeveBase,
  setToBladeburnerAction: RamCostConstants.SleeveBase,
  getSleeveAugmentationPrice: RamCostConstants.SleeveBase,
  getSleeveAugmentationRepReq: RamCostConstants.SleeveBase,
  purchaseSleeve: RamCostConstants.SleeveBase,
  upgradeMemory: RamCostConstants.SleeveBase,
  getSleeveCost: RamCostConstants.SleeveBase,
  getMemoryUpgradeCost: RamCostConstants.SleeveBase,
} as const;

// Stanek API
const stanek = {
  giftWidth: RamCostConstants.StanekWidth,
  giftHeight: RamCostConstants.StanekHeight,
  chargeFragment: RamCostConstants.StanekCharge,
  fragmentDefinitions: RamCostConstants.StanekFragmentDefinitions,
  activeFragments: RamCostConstants.StanekPlacedFragments,
  clearGift: RamCostConstants.StanekClear,
  canPlaceFragment: RamCostConstants.StanekCanPlace,
  placeFragment: RamCostConstants.StanekPlace,
  getFragment: RamCostConstants.StanekFragmentAt,
  removeFragment: RamCostConstants.StanekDeleteAt,
  acceptGift: RamCostConstants.StanekAcceptGift,
} as const;

// UI API
const ui = {
  openTail: 0,
  renderTail: 0,
  moveTail: 0,
  resizeTail: 0,
  closeTail: 0,
  setTailTitle: 0,
  setTailFontSize: 0,
  setTailMinimized: 0,
  getTheme: 0,
  setTheme: 0,
  resetTheme: 0,
  getStyles: 0,
  setStyles: 0,
  resetStyles: 0,
  getGameInfo: 0,
  clearTerminal: 0,
  openCodeEditor: 0,
  windowSize: 0,
  alias: 0,
  unalias: 0,
  getAllAliases: 0,
  renderPage: 0,
  createConnectLink: 5,
} as const;

// Grafting API
const grafting = {
  getAugmentationGraftPrice: 3.75,
  getAugmentationGraftTime: 3.75,
  getGraftableAugmentations: 5,
  graftAugmentation: 7.5,
  waitForOngoingGrafting: 0,
} as const;

const corporation = {
  hasCorporation: 0,
  canCreateCorporation: 0,
  createCorporation: RamCostConstants.CorporationAction,
  hasUnlock: RamCostConstants.CorporationInfo,
  getUnlockCost: RamCostConstants.CorporationInfo,
  getUpgradeLevel: RamCostConstants.CorporationInfo,
  getUpgradeLevelCost: RamCostConstants.CorporationInfo,
  getInvestmentOffer: RamCostConstants.CorporationInfo,
  getConstants: 0,
  getIndustryData: RamCostConstants.CorporationInfo,
  getMaterialData: RamCostConstants.CorporationInfo,
  acceptInvestmentOffer: RamCostConstants.CorporationAction,
  goPublic: RamCostConstants.CorporationAction,
  bribe: RamCostConstants.CorporationAction,
  getCorporation: RamCostConstants.CorporationInfo,
  getDivision: RamCostConstants.CorporationInfo,
  expandIndustry: RamCostConstants.CorporationAction,
  expandCity: RamCostConstants.CorporationAction,
  purchaseUnlock: RamCostConstants.CorporationAction,
  levelUpgrade: RamCostConstants.CorporationAction,
  issueDividends: RamCostConstants.CorporationAction,
  issueNewShares: RamCostConstants.CorporationAction,
  buyBackShares: RamCostConstants.CorporationAction,
  sellShares: RamCostConstants.CorporationAction,
  getBonusTime: 0,
  nextUpdate: RamCostConstants.CycleTiming,
  sellDivision: RamCostConstants.CorporationAction,
  // Warehouse API
  sellMaterial: RamCostConstants.CorporationAction,
  sellProduct: RamCostConstants.CorporationAction,
  discontinueProduct: RamCostConstants.CorporationAction,
  setSmartSupply: RamCostConstants.CorporationAction,
  setSmartSupplyOption: RamCostConstants.CorporationAction,
  buyMaterial: RamCostConstants.CorporationAction,
  bulkPurchase: RamCostConstants.CorporationAction,
  getWarehouse: RamCostConstants.CorporationInfo,
  getProduct: RamCostConstants.CorporationInfo,
  getMaterial: RamCostConstants.CorporationInfo,
  setMaterialMarketTA1: RamCostConstants.CorporationAction,
  setMaterialMarketTA2: RamCostConstants.CorporationAction,
  setProductMarketTA1: RamCostConstants.CorporationAction,
  setProductMarketTA2: RamCostConstants.CorporationAction,
  exportMaterial: RamCostConstants.CorporationAction,
  cancelExportMaterial: RamCostConstants.CorporationAction,
  purchaseWarehouse: RamCostConstants.CorporationAction,
  upgradeWarehouse: RamCostConstants.CorporationAction,
  makeProduct: RamCostConstants.CorporationAction,
  limitMaterialProduction: RamCostConstants.CorporationAction,
  limitProductProduction: RamCostConstants.CorporationAction,
  getUpgradeWarehouseCost: RamCostConstants.CorporationInfo,
  hasWarehouse: RamCostConstants.CorporationInfo,
  // Warehouse API
  hireEmployee: RamCostConstants.CorporationAction,
  upgradeOfficeSize: RamCostConstants.CorporationAction,
  throwParty: RamCostConstants.CorporationAction,
  buyTea: RamCostConstants.CorporationAction,
  hireAdVert: RamCostConstants.CorporationAction,
  research: RamCostConstants.CorporationAction,
  getOffice: RamCostConstants.CorporationInfo,
  getHireAdVertCost: RamCostConstants.CorporationInfo,
  getHireAdVertCount: RamCostConstants.CorporationInfo,
  getResearchCost: RamCostConstants.CorporationInfo,
  hasResearched: RamCostConstants.CorporationInfo,
  setJobAssignment: RamCostConstants.CorporationAction,
  getOfficeSizeUpgradeCost: RamCostConstants.CorporationInfo,
} as const;
 
 */