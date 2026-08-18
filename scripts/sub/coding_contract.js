//requires no SF
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.codingcontract.md

import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


// Declaration
export class coding_contract_obj {
    constructor() {}


    init(ns) {
        //ns.disableLog("")
        //create port object
        this.port = ns.getPortHandle(CONSTANTS.PORT.CODING_CONTRACT)
        //clear the data from the port
        this.port.clear()
    }


    /*
    ns.ls     0.2
    */
    //function that manages the actions of coding contracts: reads port for other programs to post their found coding contracts to (e.g. root or darknet)
    async manage(ns) {
        //while there is data
        while (this.port.peek() != CONSTANTS.PORT.NO_DATA) {
            //get data
            var data = this.port.read
            //log
            log.info(ns, "Coding_Contract", "Received from '" + data.origin + "': '" + JSON.stringify(data) + "'",
                true)
            //check if file still exists (due to darknet)
            if (ns.ls(data.hostname, data.filename).length > 0) {
                //solve
                this.solve(ns, data.filename, data.hostname)
            }
            //remove the contract from the port
            this.port.read()
        }
    }


    /*
    ns.codingcontract.getContract           15 GB
    */
    //solve the coding contract
    solve(ns, filename, hostname) {
        //get contract
        const contract = ns.codingcontract.getContract(filename, hostname)
        //debug
        log.info(ns, "Coding_Contract", "type: " + contract.type + ", data: " + contract.data + ", description: " +
            description, true)
        //get answer
        const answer = this.determine_answer(contract.type, contract.data)
        //if answer is set
        if (answer != null) {
            //attempt solving
            const result = contract.submit(answer)
            //log
            log.info(ns, "Coding_Contract", "Submitted answer '" + answer + "' => " + result, true)
        } else {
            //log
            log.warning(ns, "Coding_Contract", "Could not determine an answer for '" + contract.type + "': " +
                contract.data, true)
        }
    }


    //determine the answer for the coding contract
    determine_answer(contract_type, data) {
        //depending on the type
        switch (contract_type) {
            case "Find Largest Prime Factor":
                return this.FindLargestPrimeFactor(data)

            case "Subarray with Maximum Sum":
                return this.SubarrayWithMaximumSum(data)

            case "Total Ways to Sum":
                return this.TotalWaysToSum(data)

            case "Total Ways to Sum II":
                return this.TotalWaysToSumII(data)

            case "Spiralize Matrix":
                return this.SpiralizeMatrix(data)

            case "Array Jumping Game":
                return this.ArrayJumpingGame(data)

            case "Array Jumping Game II":
                return this.ArrayJumpingGameII(data)

            case "Merge Overlapping Intervals":
                return this.MergeOverlappingIntervals(data)

            case "Generate IP Addresses":
                return this.GenerateIPAddresses(data)

            case "Algorithmic Stock Trader I":
                return this.AlgorithmicStockTraderI(data)

            case "Algorithmic Stock Trader II":
                return this.AlgorithmicStockTraderII(data)

            case "Algorithmic Stock Trader III":
                return this.AlgorithmicStockTraderIII(data)

            case "Algorithmic Stock Trader IV":
                return this.AlgorithmicStockTraderIV(data)

            case "Minimum Path Sum in a Triangle":
                return this.MinimumPathSumInATriangle(data)

            case "Unique Paths in a Grid I":
                return this.UniquePathsInAGridI(data)

            case "Unique Paths in a Grid II":
                return this.UniquePathsInAGridII(data)

            case "Shortest Path in a Grid":
                return this.ShortestPathInAGrid(data)

            case "Sanitize Parentheses in Expression":
                return this.SanitizeParenthesesInExpression(data)

            case "Find All Valid Math Expressions":
                return this.FindAllValidMathExpressions(data)

            case "HammingCodes: Integer to Encoded Binary":
                return this.HammingCodesIntegerToEncodedBinary(data)

            case "HammingCodes: Encoded Binary to Integer":
                return this.HammingCodesEncodedBinaryToInteger(data)

            case "Proper 2-Coloring of a Graph":
                return this.Proper2ColoringOfAGraph(data)

            case "Compression I: RLE Compression":
                return this.CompressionIRLECompression(data)

            case "Compression II: LZ Decompression":
                return this.CompressionIILZDecompression(data)

            case "Compression III: LZ Compression":
                return this.CompressionIIILZCompression(data)

            case "Encryption I: Caesar Cipher":
                return this.EncryptionICaesarCipher(data)

            case "Encryption II: Vigenère Cipher":
                return this.EncryptionIIVigenereCipher(data)

            case "Square Root":
                return this.SquareRoot(data)

            case "Total Number of Primes":
                return this.TotalPrimesInRange(data)

            case "Largest Rectangle in a Matrix":
                return this.LargestRectangleInAMatrix(data)

            default:
                //log
                log.info(ns, "Coding contract", "Uncaught contract_type: '" + JSON.stringify(contract_type) + "'")
                return null
        }
    }

    FindLargestPrimeFactor(data) {
        //stub
        return null
    }


    SubarrayWithMaximumSum(data) {
        //stub
        return null
    }


    TotalWaysToSum(data) {
        //stub
        return null
    }


    TotalWaysToSumII(data) {
        //stub
        return null
    }


    SpiralizeMatrix(data) {
        //stub
        return null
    }


    ArrayJumpingGame(data) {
        //stub
        return null
    }


    ArrayJumpingGameII(data) {
        //stub
        return null
    }


    MergeOverlappingIntervals(data) {
        //stub
        return null
    }


    GenerateIPAddresses(data) {
        //stub
        return null
    }


    AlgorithmicStockTraderI(data) {
        //stub
    }


    AlgorithmicStockTraderII(data) {
        //stub
        return null
    }


    AlgorithmicStockTraderIII(data) {
        //stub
        return null
    }


    AlgorithmicStockTraderIV(data) {
        //stub
        return null
    }


    MinimumPathSumInATriangle(data) {
        //stub
        return null
    }


    UniquePathsInAGridI(data) {
        //stub
        return null
    }


    UniquePathsInAGridII(data) {
        //stub
        return null
    }


    ShortestPathInAGrid(data) {
        //stub
        return null
    }


    SanitizeParenthesesInExpression(data) {
        //stub
        return null
    }


    FindAllValidMathExpressions(data) {
        //stub
        return null
    }


    HammingCodesIntegerToEncodedBinary(data) {
        //stub
        return null
    }


    HammingCodesEncodedBinaryToInteger(data) {
        //stub
        return null
    }


    Proper2ColoringOfAGraph(data) {
        //stub
        return null
    }


    CompressionIRLECompression(data) {
        //stub
        return null
    }


    CompressionIILZDecompression(data) {
        //stub
        return null
    }


    CompressionIIILZCompression(data) {
        //stub
        return null
    }


    EncryptionICaesarCipher(data) {
        //stub
        return null
    }


    EncryptionIIVigenereCipher(data) {
        //stub
        return null
    }


    SquareRoot(data) {
        //stub
        return null
    }


    TotalPrimesInRange(data) {
        //stub
        return null
    }


    LargestRectangleInAMatrix(data) {
        //stub
        return null
    }
}


/*
Attempts a coding contract, returning a reward string on success or empty string on failure.
attempt(answer, filename, host)     10 GB
	
Generate a dummy contract. -> Generate a dummy contract on the current server with no reward. Used to test various algorithms.
createDummyContract(type, host)     2 GB
	
Get various data about a specific contract. -> The returned object includes the type, data, description as well as methods for getting the number of tries remaining and submitting your answer.
Depending on the type of the contract, the data is typed differently. 
Using type-narrowing, you can get the correct type of the data:
const contract = ns.codingcontract.getContract(fileName, hostName);
if (contract.type === ns.enums.CodingContractName.FindLargestPrimeFactor) {
  const data = contract.data;
  // ^? data: number
}
getContract(filename, host)         15 GB
	
Get the type of a coding contract. -> Returns a name describing the type of problem posed by the Coding Contract. (e.g. Find Largest Prime Factor, Total Ways to Sum, etc.)
getContractType(filename, host)     5 GB
	
List all contract types. -> returns CodingContractNameEnumType (see below)
getContractTypes()                  0 GB

Get the input data. -> Get the data associated with the specific Coding Contract. 
Note that this is not the same as the contract’s description. This is just the data that the contract wants you to act on in order to solve the contract.
getData(filename, host)             5 GB
	
Get the description. -> Get the full text description for the problem posed by the Coding Contract.
getDescription(filename, host)      5 GB
	

Get the number of attempts remaining. -> Get the number of tries remaining on the contract before it self-destructs.
getNumTriesRemaining(filename, host)    2 GB
	

*/

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

/*
Coding Contracts
    Coding Contracts are a mechanic that lets players earn rewards in exchange for solving programming problems.
    Coding Contracts are files with the .cct extension. They can be accessed through the Terminal or through Scripts using the Coding Contract API.
    Each contract has a limited number of attempts. 
    If you provide the wrong answer too many times and exceed the number of attempts, the contract will self-destruct (delete itself).
    Coding Contracts are randomly generated and spawn over time. 
    Initially, you'll only see a small range of the easier contracts, but as you progress further through the game more challenging ones will unlock.
    They can appear on non-darknet servers that are not owned by the player (Server.purchasedByPlayer is false).

Contract generation
    Online
    Every 10 minutes, the game makes three independent attempts to generate a contract on normal servers, each with a base 25% chance. 
    This probability decreases based on the total number of contracts across all servers. In most cases, you can assume a ~25% success rate per attempt.

Offline
    When the game is launched after being offline, the offline time is used to calculate the number of generation attempts. 
    The same rules and probabilities from the online generation process apply.

Dark Net
    Opening cache files on darknet servers also has a chance to generate a contract, but with lower rewards. 
    Contracts generated this way grant 50% lower rewards than those generated randomly on normal servers.

Running in Terminal
    To run a Coding Contract in the Terminal, simply use the run command:
        $ run some-contract.cct
    Doing this will bring up a popup. The popup will display the contract's problem, the number of attempts remaining, and an area to provide an answer.

Interacting through Scripts
    See the Coding Contract API. 
    Interacting with Coding Contracts via the Terminal can be tedious the more contracts you solve. 
    Consider using the APIs to automate various aspects of your solution. 
    For example, some contracts have long solutions while others have even longer solutions. 
    You might want to use the APIs to automate the process of submitting your solution rather than copy and paste a long solution into an answer box. 
    The APIs can also be used to find out useful information about a contract including the number of attempts you have left, the type of contract and its difficulty. 
    It can also be used to test your algorithm for a specific contract type by spawning dummy contracts.

    However, using the APIs comes at a cost. 
    Like most functions in other APIs, almost all of the functions in the APIs have a RAM cost.
    Depending on which function you use, the initial RAM on your home server might not be enough to allow you to use various API functions. 
    Plan on upgrading the RAM on your home server if you want to use the APIs.

    The getContractTypes function is free, and returns a list of all of the contract types currently in the game.

Submitting Solutions
    General rules

        Different contract problem types will require different types of solutions. Some may be numbers, others may be strings or arrays.

        If a contract asks for a specific solution format, then use that. Otherwise, follow these rules when submitting solutions:

        String-type solutions (e.g., Shortest Path in a Grid) should not have quotation marks surrounding the string (unless specifically asked for). 
        For example, if your answer is foo (3 characters: f, o, o), just submit those 3 characters. Don't submit "foo" (5 characters). 
        Only quotation marks that are part of the actual string solution should be included.
        With array-of-strings solutions (e.g., Generate IP Addresses), you need to use double quotes surrounding the string values. 
        Don't use single quotes ('') or backticks (``). 
        For example, if your answer is an array containing foo (3 characters: f, o, o) and bar (3 characters: b, a, r), you should submit ["foo", "bar"]. 
        Don't submit ['foo', 'bar'].
        Array-type solutions should be submitted with each element in the array separated by commas.
        Numeric solutions should be submitted normally, as expected.
        Read the description carefully. Some contracts (e.g., the "Square Root" contract) clearly specify the expected solution format.
        If the solution format is not a string, you should not convert the answer to a string. Read the next sections carefully if you do so.

    String conversion
        For convenience (e.g., submitting the answer via the UI) and backward compatibility, the game accepts a string answer even when the solution format is not a string. 
        In these cases, the game converts your string answer to the expected format. However, this conversion has many pitfalls.
        String conversion only matters when you submit the answer via the UI (your answer, typed in the text box, is always a string). 
        When you call the ns.codingcontract.attempt API, you should never convert your non-string answer to a string unless specifically asked for.
        First, with arrays, the outermost pair of brackets is optional. For example, both of the following are valid solution formats:
            1,2,3
            [1,2,3]
            
        Note:
            If the solution is a multidimensional array, then all arrays that are not the outermost array DO require the brackets. For example, an array of arrays can be submitted as one of the following:
                [1,2],[3,4]
                [[1,2],[3,4]]
            The empty string is converted to an empty array.
            "[]" (the string that contains only 2 bracket characters; the double quotes are not part of that string) is converted to an empty array.

        Second, in the UI:
            If your answer is an empty string, you must leave the text box empty. Do NOT use "", '', or ``.
            If the answer is a non-empty string, type it as is. For example, if your answer is the word foo, type foo (3 characters: f, o, o). Do NOT add any types of quotes.
            If the answer is an array that contains strings, use double quotes for strings. Do NOT use single quotes or backticks. For example, if your answer is an array containing the word foo, type ["foo"] (7 characters: square bracket, double quote, f, o, o, double quote, square bracket). The brackets are optional, as stated above, but we recommend including them.

Tips
    If a contract does not expect a string, you should not submit a string. 
    For contracts that do not expect a string solution, your answer should never be a string, so if you submit a string, it means that you converted your non-string answer to a string. This is usually the wrong thing to do.
    Remember, string conversion is for UI convenience and backward compatibility. 
    If you use NS APIs, do not perform any string conversion unless specifically asked for.
    For example, suppose a contract requires the answer to be an array containing strings, and you determine that those strings are foo and bar. 
    Your code should look like this:
    const firstString = "foo";
    const secondString = "bar";
    const answer = [firstString, secondString];
    ns.codingcontract.attempt(answer, "filename.cct");

    There is no conversion!

    In the "General rules" section above, with array-of-strings solutions, we say Don't use single quotes or backticks. However, this code works:

    const firstString = 'foo'; // Single quotes
    const secondString = 'bar'; // Single quotes
    const answer = [firstString, secondString];
    ns.codingcontract.attempt(answer, "filename.cct");

    Why is that?
        In this code, you submit an array containing 2 strings. In JS, "foo" and 'foo' are the same string. 
        However, if you submit your answer as a string, you need to convert your array to a string, and the string ["foo", "bar"] is not the same as the string ['foo', 'bar'].
        Internally, we use JSON.parse to convert the string answer, and ['foo', 'bar'] is not a valid string representation of an array. 
        In JSON, a string needs to be enclosed by double quotes. Using single quotes or backticks is not allowed.
        This is one reason why you should not convert your answer to a string unless requested. 
        If you submit your array as is, you do not need to worry about quote types.
        Let's check another example:

        const firstString = "foo";
        const secondString = "bar";
        const answer = [firstString, secondString];
        ns.codingcontract.attempt(answer.toString(), "filename.cct");
        ns.codingcontract.attempt(String(answer), "filename.cct");

     Do NOT call toString() or use similar methods to convert your string array to a string. ["foo", "bar"] will be converted to foo,bar. 
     For contracts that expect a string array, submitting this string causes it to be interpreted as [foo,bar], which is then passed to JSON.parse. 
     However, [foo,bar] is not valid JSON (it lacks double quotes), so your answer will be invalid.

Rewards

There are currently four possible rewards for solving a Coding Contract:

    Faction Reputation for a specific Faction
    Faction Reputation for all Factions that you are a member of
    Company Reputation for a specific Company
    Money

    The reward type is randomly chosen at spawn time. If the chosen reward is invalid upon completion (e.g., requirements are not met), it falls back to an alternative type:
        Specific faction reputation ⇒ Money
        All factions' reputation ⇒ Money
        Company reputation ⇒ Specific faction reputation or all factions' reputation (50% chance for each). If the fallback reward is also invalid, the reward defaults to Money.

    For example, if a contract is set to reward "All Factions' Reputation" but you have not joined any factions at the time of submission, you will receive Money instead.
    The amount of the reward varies based on the difficulty of the problem posed by the Coding Contract.

Notes
    The scp CLI command and the ns.scp API do not work on Coding Contracts.

*/