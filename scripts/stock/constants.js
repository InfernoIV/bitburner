//fee per stock trade
export const COMMISSION_FEE = 100e3 //$100.00k

//symbols that can be traded (saves ram)
export const STOCK_SYMBOLS = ["ECP", "MGCP", "BLD", "CLRK", "OMTK", "FSIG", "KGI", "FLCM", "STM", "DCOMM", "HLS",
    "VITA",
    "ICRS", "UNV", "AERO", "OMN", "SLRS", "GPH", "NVMD", "WDS", "LXO", "RHOC", "APHE", "SYSC", "CTK",
    "NTLK", "OMGA", "FNS", "JGN", "SGC", "CTYS", "MDYN", "TITN"
]


export const SERVER_HOSTNAMES = new Map([
    ["ECP", ["ecorp"]], //"Ecorp"
    ["MGCP", ["megacorp"]], //"MegaCorp"
    ["BLD", ["blade"]], //"Blade"
    ["CLRK", ["clarkinc"]], //"Clarke Incorporated"
    ["OMTK", ["omnitek"]], //"OmniTek Incorporated"
    ["FSIG", ["4sigma"]], //"Four Sigma"
    ["KGI", ["kuai-gong"]], //"KuaiGong International"
    ["FLCM", ["fulcrumtech", "fulcrumassets"]], //"Fulcrum Technologies"
    ["STM", ["stormtech"]], //"Storm Technologies"
    ["DCOMM", ["defcomm"]], //"DefComm"
    ["HLS", ["helios"]], //"Helios Labs"
    ["VITA", ["vitalife"]], //"VitaLife"
    ["ICRS", ["icarus"]], //"Icarus Microsystems"
    ["UNV", ["univ-energy"]], //"Universal Energy"
    ["AERO", ["aerocorp"]], //"AeroCorp"
    ["OMN", ["omnia"]], //"Omnia Cybersystems"
    ["SLRS", ["solaris"]], //"Solaris Space Systems"
    ["GPH", ["global-pharm"]], //"Global Pharmaceuticals"
    ["NVMD", ["nova-med"]], //"Nova Medical"
    ["LXO", ["lexo-corp"]], //"LexoCorp"
    ["RHOC", ["rho-construction"]], //"Rho Construction"
    ["APHE", ["alpha-ent"]], //"Alpha Enterprises"
    ["SYSC", ["syscore"]], //"SysCore Securities"
    ["CTK", ["computek"]], //"CompuTek"
    ["NTLK", ["netlink"]], //"NetLink Technologies"
    ["OMGA", ["omega-net"]], //"Omega Software"
    ["FNS", ["foodnstuff"]], //"FoodNStuff"
    ["JGN", ["joesguns"]], //"Joe's Guns"
    ["SGC", ["sigma-cosmetics"]], //"Sigma Cosmetics"
    ["CTYS", ["catalyst"]], //"Catalyst Ventures"
    ["MDYN", ["microdyne"]], //"Microdyne Technologies"
    ["TITN", ["titan-labs"]], //"Titan Laboratories"
])