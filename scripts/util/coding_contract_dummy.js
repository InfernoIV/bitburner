import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

//config
const type = "Find Largest Prime Factor"

/*
    for testing purposes:
    createDummyContract(type, host)     2 GB
    */
export async function main(ns) {
    //try
    try {
        //generate contract
        const file_name = ns.codingcontract.createDummyContract(type, CONSTANTS.SERVER.HOME)

        //get contract
        const contract = ns.codingcontract.getContract(file_name, CONSTANTS.SERVER.HOME)
        //debug
        log.info(ns, "Coding_Contract", "type: " + contract.type + ", data: " + contract.data + ", description: " +
            description, true)

        /*
        //indicate that a contract has been found
        ns.tryWritePort(CONSTANTS.PORT.CODING_CONTRACT, {
            filename: file_name,
            hostname: CONSTANTS.SERVER.HOME
        })*/

        //if error
    } catch (err) {
        //log
        log.error(ns, "Coding_Contract_Dummy", "Error: " + err)
    }
}




/*
type CodingContractNameEnumType = {
  FindLargestPrimeFactor: "Find Largest Prime Factor";
  SubarrayWithMaximumSum: "Subarray with Maximum Sum";
  TotalWaysToSum: "Total Ways to Sum";
  TotalWaysToSumII: "Total Ways to Sum II";
  SpiralizeMatrix: "Spiralize Matrix";
  ArrayJumpingGame: "Array Jumping Game";
  ArrayJumpingGameII: "Array Jumping Game II";
  MergeOverlappingIntervals: "Merge Overlapping Intervals";
  GenerateIPAddresses: "Generate IP Addresses";
  AlgorithmicStockTraderI: "Algorithmic Stock Trader I";
  AlgorithmicStockTraderII: "Algorithmic Stock Trader II";
  AlgorithmicStockTraderIII: "Algorithmic Stock Trader III";
  AlgorithmicStockTraderIV: "Algorithmic Stock Trader IV";
  MinimumPathSumInATriangle: "Minimum Path Sum in a Triangle";
  UniquePathsInAGridI: "Unique Paths in a Grid I";
  UniquePathsInAGridII: "Unique Paths in a Grid II";
  ShortestPathInAGrid: "Shortest Path in a Grid";
  SanitizeParenthesesInExpression: "Sanitize Parentheses in Expression";
  FindAllValidMathExpressions: "Find All Valid Math Expressions";
  HammingCodesIntegerToEncodedBinary: "HammingCodes: Integer to Encoded Binary";
  HammingCodesEncodedBinaryToInteger: "HammingCodes: Encoded Binary to Integer";
  Proper2ColoringOfAGraph: "Proper 2-Coloring of a Graph";
  CompressionIRLECompression: "Compression I: RLE Compression";
  CompressionIILZDecompression: "Compression II: LZ Decompression";
  CompressionIIILZCompression: "Compression III: LZ Compression";
  EncryptionICaesarCipher: "Encryption I: Caesar Cipher";
  EncryptionIIVigenereCipher: "Encryption II: Vigenère Cipher";
  SquareRoot: "Square Root";
  TotalPrimesInRange: "Total Number of Primes";
  LargestRectangleInAMatrix: "Largest Rectangle in a Matrix";
};
*/