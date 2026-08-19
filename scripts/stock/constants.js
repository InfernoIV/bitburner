import { PORT } from "scripts/constants.js"
export { PORT }
//fee per stock trade
export const COMMISSION_FEE = 100e3 //$100.00k

//symbols that can be traded (saves ram)
export const STOCK_SYMBOLS = ["ECP", "MGCP", "BLD", "CLRK", "OMTK", "FSIG", "KGI", "FLCM", "STM", "DCOMM", "HLS",
    "VITA",
    "ICRS", "UNV", "AERO", "OMN", "SLRS", "GPH", "NVMD", "WDS", "LXO", "RHOC", "APHE", "SYSC", "CTK",
    "NTLK", "OMGA", "FNS", "JGN", "SGC", "CTYS", "MDYN", "TITN"
]