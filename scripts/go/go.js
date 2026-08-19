import * as CONSTANTS from "constants.js"
import * as CONFIG from "config.js"

import * as log from "scripts/util/log.js"


// Declaration
export class go_obj {
    constructor() {}


    //getting the game to a steady state
    init(ns) {
        //disable logging
        log.disable(CONFIG.DISABLE_LOGGING)
        //Returns the color of the current player ("White" | "Black"), or 'None' if the game is over.
        const current_player = ns.go.getCurrentPlayer()
        //if not our turn
        if (current_player == "White") {
            /*
            Pass the player's turn rather than making a move, and await the opponent's response. 
            This ends the game if the opponent passed on the previous turn, or if the opponent passes on their following turn.
            This can also be used if you pick up the game in a state where the opponent needs to play next. 
            For example: if BitBurner was closed while waiting for the opponent to make a move, you may need to call passTurn() to get them to play their move on game start.
            */
            try {
                ns.go.passTurn()
            } catch (err) {
                //ignore
            }
        }
        //get board state
        const board_state = ns.go.getBoardState()
        //save board size
        this.board_size = board_state.length
        //save wins
        this.wins = 0
        //save losses
        this.losses = 0
        //save loss streak
        this.loss_streak = 0
        //keep track of factions
        this.opponent_list = [
            "Netburners", //increased hacknet production
            "Slum Snakes", //crime success rate
            "The Black Hand", //hacking money
            "Tetrads", //strength, defense, dexterity, and agility levels
            "Daedalus", //reputation gain
            "Illuminati", //faster hack(), grow(), and weaken()
        ] //| "No AI"
        //reset stats to easily see if we have won 2x
        ns.go.analysis.resetStats(true)
        //log
        log.info(ns, "Go", "Init complete")
    }


    //play the game
    manage(ns, handles) {
        //Returns the color of the current player ("White" | "Black"), or 'None' if the game is over.
        const current_player = ns.go.getCurrentPlayer()
        //if not our turn
        if (current_player == "White") {
            //stop
            return
        }
        //if game is over
        if (current_player == "None") {
            //start a new game
            this.start_new_game(ns)
            //it should be our turn, so make a move		
        }
        //make a move
        this.make_move(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.GO_ANALYSIS), handles.hasOwnProperty(CONSTANTS.HANDLE.GO_CHEAT))
    }

    /*
    go.getStats     0
    */
    //start a new game: select an opponent and a board size
    start_new_game(ns) {    
        //Returns the name of the opponent faction in the current subnet.
        const opponent_current = ns.go.getOpponent()
        //default to same opponent
        var opponent_next = opponent_current
        //get stats
        const stats = ns.go.analysis.getStats()
        //if we won a match
        if (stats[opponent_current].wins > this.wins) {
            //save the win
            this.wins = stats[opponent_current].wins
            //reset loss streak
            this.loss_streak = 0
            //toast message
            ns.toast("Go: Won a match vs " + opponent_current)
            //log.success(ns, "Go", "Won a match vs " + opponent_current, true)
        }
        //if we lost a match
        if (stats[opponent_current].losses > this.losses) {
            //save the win
            this.losses = stats[opponent_current].losses
            this.loss_streak += 1
            //log message
            //log.warning(ns, "Go", "Lost a match vs " + opponent_current + " (" + this.loss_streak + ")", true)
        }
        var change_opponent = false
        var change_message = ""
        //if we have gotten a winstreak of x, resulting in rep to favor conversion
        if (stats[opponent_current].winStreak >= CONFIG.STREAK_WIN) {
            //go to next
            change_opponent = true
            //set message
            change_message = "Won " + CONFIG.STREAK_WIN + "x in a row"
        } else if (this.loss_streak >= CONFIG.STREAK_LOSS) {
            //go to next
            change_opponent = true
            //set message
            change_message = "Lost " + CONFIG.STREAK_LOSS + " in a row"
        }
        //if we want to change opponent
        if (change_opponent) {
            //determine the next index
            var opponent_index = this.opponent_list.indexOf(opponent_current) + 1
            //check if out of bounds
            //TODO: integrate strategies for each opponent
            if (opponent_index >= this.opponent_list.length) { //2) { 
                //set to 1st index
                opponent_index = 0
            }
            //set opponent
            opponent_next = this.opponent_list[opponent_index]
            if(change_message.includes("Won")) {
                //debug
                log.success(ns, "Go", change_message + " against " + opponent_current + ", next opponent: " + opponent_next)
            } else {
                //debug
                log.warning(ns, "Go", change_message + " against " + opponent_current + ", next opponent: " + opponent_next)
            }
            //reset stats to easily see if we have won 2x
            //ns.go.analysis.resetStats(true)
            
            this.wins = 0
            this.losses = 0
            this.loss_streak = 0

            const stat_next = stats[opponent_next]
            //if not undefined
            if (stat_next != undefined) {
                this.wins = stats[opponent_next].wins //0
                this.losses = stats[opponent_next].losses// 0
            }
            
        }

        //default size
        var board_size = CONFIG.BOARD_SIZE //5 | 7 | 9 | 13
        //depending on the opponent, decide the size
        //TODO: decide on size
        switch (opponent_next) {
            case "Netburners":
                //TODO: decide board size
                break
            case "Slum Snakes":
                //TODO: decide board size
                break
            case "The Black Hand":
                //TODO: decide board size
                break
            case "Tetrads":
                //TODO: decide board size
                break
            case "Daedalus":
                //TODO: decide board size
                break
            case "Illuminati":
                //TODO: decide board size
                break
            //case "????????????":
                //TODO: decide board size
                break
            default:
                //board size is already set
        }
        /*
        Gets new IPvGO subnet with the specified size owned by the listed faction, ready for the player to make a move. 
        This will reset your win streak if the current game is not complete and you have already made moves.
        Note that some factions will have a few routers already on the subnet after a reset.
        */
        ns.go.resetBoardState(opponent_next, board_size)

        //save the board size
        this.board_size = board_size
    }


    //make a move
    make_move(ns, can_analyze, can_cheat) {
        /* Shows if each point on the board is a valid move for the player. By default, analyzes the current board state. Takes an optional boardState (and an optional prior-move boardState, if desired) to analyze a custom board.
        The true/false validity of each move can be retrieved via the X and Y coordinates of the move.
        const validMoves = ns.go.analysis.getValidMoves();
        const moveIsValid = validMoves[x][y];
        Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.
        Also note that, when given a custom board state, only one prior move can be analyzed. This means that the superko rules (no duplicate board states in the full game history) is not supported; you will have to implement your own analysis for that.
        The current valid moves for white can also be seen by simply calling ns.go.analysis.getValidMoves(true). */
        const moves_valid = ns.go.analysis.getValidMoves()
        //flag if we can play a move
        var flag_valid_move = false
        //for each row
        for (const row of moves_valid) {
            //if it includes a valid move (true)
            if (row.includes(true)) {
                //set flag to true
                flag_valid_move = true
                //stop
                break
            }
        }
        //if there are no valid moves
        if (flag_valid_move == false) {
            //pass to finish the game
            ns.go.passTurn()
            //stop
            return
        }
        /*
        Gets the status of the current game. 
        Shows the current player, current score, and the previous move coordinates. 
        Previous move will be null for a pass, or if there are no prior moves.
        */
        const state_game = ns.go
            .getGameState() //{"currentPlayer":"Black","whiteScore":1.5,"blackScore":0,"previousMove":null,"komi":1.5,"bonusCycles":0}
        /*
        Returns all the prior moves in the current game, as an array of simple board states.	
        For example, a single 5x5 prior move board might look like this:
        [	"XX.O.",
        	"X..OO",
        	".XO..",
        	"XXO.#",
        	".XO.#",	]
        */
        const previous_moves = ns.go.getMoveHistory()

        //if there have been moves and the previous move is a pass
        if (previous_moves.length > 0 && state_game.previousMove == null) {
            //pass to finish the game
            ns.go.passTurn()
            //debug
            //log.info(ns, "Go", "Passing to finish the game")
            //stop
            return
        }
        //gather information
        var information = this.gather_information(ns, can_analyze, can_cheat)
        //add current information
        information.previous_moves = previous_moves
        information.state_game = state_game
        information.moves_valid = moves_valid
        //Returns the name of the opponent faction in the current subnet.
        const opponent = ns.go.getOpponent()
        //play depending on the opponent(?)
        switch (opponent) {
            default:
                //not defined: brute force it
                this.brute_force(ns, information, can_analyze, can_cheat)
        }
    }


    //just play the 1st move available
    brute_force(ns, information, can_analyze, can_cheat) {
        //try to play in the middle first
        if (information.moves_valid[2][2]) {
            //play in the middle
            ns.go.makeMove(2, 2)
        }
        if(can_analyze) {
            //use analysis information
            //TODO
        }
        //check if we can cheat
        if(can_cheat && information.cheat_chance >= 1.0) {
            //TODO
        }
        //start from 1 from corner first?
        //This idea can also be improved to focus on a specific area or corner first, rather than spread across the whole board right away.
        //from left to right 
        for (var x = 0; x < this.board_size; x++) {
            //from top to bottom
            for (var y = 0; y < this.board_size; y++) {
                //if a valid move
                const valid_move = information.moves_valid[x][y]
                // Leave some spaces to make it harder to capture our pieces. -> We don't want to run out of empty node connections!
                const isNotReservedSpace = x % 2 === 1 || y % 2 === 1;
                //if a valid move and not reserved
                if (valid_move && isNotReservedSpace) {
                    /*Make a move on the IPvGO subnet game board, and await the opponent's response. 
                    x:0 y:0 represents the bottom-left corner of the board in the UI.*/
                    try {
                        ns.go.makeMove(x, y)
                    } catch (e) {}
                    
                    //debug
                    //log.info(ns, "Go", "Made a move on " + x + "," + y)
                    //stop
                    return
                }
            }
        }
        //we need to play in reserved space
        for (var x = 0; x < this.board_size; x++) {
            //from top to bottom
            for (var y = 0; y < this.board_size; y++) {
                //if a valid move
                const valid_move = information.moves_valid[x][y]
                //if a valid move and not reserved
                if (valid_move) {
                    /*Make a move on the IPvGO subnet game board, and await the opponent's response. 
                        x:0 y:0 represents the bottom-left corner of the board in the UI.*/
                    try {
                        ns.go.makeMove(x, y)
                    } catch (e) {}
                    //debug
                    //log.info(ns, "Go", "Made a move on " + x + "," + y)
                    //stop
                    return
                }
            }
        }
    }


    //TODO: play aggressively
    play_aggressive(ns, information) {

        //TODO
        var x = 0
        var y = 0

        //only cheat when you need to!
        //if we can x% cheat
        if (information.cheat_chance == CONFIG.CHEAT_CHANCE) {
            /* Attempts to destroy an empty node, leaving an offline dead space that does not count as territory or provide open node access to adjacent routers.
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet. */
            //ns.go.cheat.destroyNode(x,y)

            /*Attempts to remove an existing router, leaving an empty node behind.	
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            //ns.go.cheat.removeRouter(x,y)

            /*Attempts to repair an offline node, leaving an empty playable node behind.
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            //ns.go.cheat.repairOfflineNode(x,y)

            var x1 = x
            var x2 = x
            var y1 = y
            var y2 = y
            /*Attempts to place two routers at once on empty nodes. 
            Note that this ignores other move restrictions, so you can suicide your own routers if they have no access to empty ports and do not capture any enemy routers.
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            //ns.go.cheat.playTwoMoves(x1, y1, x2, y2)
        } else {
            /*Make a move on the IPvGO subnet game board, and await the opponent's response. 
            x:0 y:0 represents the bottom-left corner of the board in the UI.*/
            //await evaluate.exec(ns, "ns.go.makeMove(" + x + "," + y + ")")
            //stop
            return
        }
    }


    //gather all information, to be used to determine actions
    gather_information(ns, can_analyze, can_cheat) {
        //variable to fill
        var information = {}
        /*Retrieves a simplified version of the board state. "X" represents black pieces, "O" white, and "." empty points. 
        "#" are dead nodes that are not part of the subnet. (They are not territory nor open nodes.)
        For example, a 5x5 board might look like this:
        [	"XX.O.",
        	"X..OO",
        	".XO..",
        	"XXO.#",
        	".XO.#",	]
        Each string represents a vertical column on the board, and each character in the string represents a point.
        Traditional notation for Go is e.g. "B,1" referring to second ("B") column, first rank. This is the equivalent of index [1][0].
        Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. 
        In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.*/
        information.state_board = ns.go.getBoardState()

        //if we can analyse
        if(can_analyze) {
            /*Returns 'X' for black, 'O' for white, or '?' for each empty point to indicate which player controls that empty point. 
            If no single player fully encircles the empty space, it is shown as contested with '?'. "#" are dead nodes that are not part of the subnet.
            Takes an optional boardState argument; by default uses the current board state.	
            Filled points of any color are indicated with '.'
            In this example, white encircles some space in the top-left, black encircles some in the top-right, and between their routers is contested space in the center:
            [	"OO..?",
                "OO.?.",
                "O.?.X",
                ".?.XX",
                "?..X#",	]*/
            information.nodes_controlled_empty = ns.go.analysis.getControlledEmptyNodes()
            /*Returns an ID for each point. All points that share an ID are part of the same network (or "chain"). Empty points are also given chain IDs to represent continuous empty space. Dead nodes are given the value null.
            Takes an optional boardState argument; by default uses the current board state.
            The data from getChains() can be used with the data from getBoardState() to see which player (or empty) each chain is
            For example, a 5x5 board might look like this. There is a large chain #1 on the left side, smaller chains 2 and 3 on the right, and a large chain 0 taking up the center of the board.
            [	[   0,0,0,3,4],
                [   1,0,0,3,3],
                [   1,1,0,0,0],
                [null,1,0,2,2],
                [null,1,0,2,5],	]*/
            information.chains = ns.go.analysis.getChains()

            /*Returns a number for each point, representing how many open nodes its network/chain is connected to. Empty nodes and dead nodes are shown as -1 liberties.
            Takes an optional boardState argument; by default uses the current board state.
            For example, a 5x5 board might look like this. The chain in the top-left touches 5 total empty nodes, and the one in the center touches four. 
            The group in the bottom-right only has one liberty; it is in danger of being captured!
            [	[-1, 5,-1,-1, 2],
                [ 5, 5,-1,-1,-1],
                [-1,-1, 4,-1,-1],
                [ 3,-1,-1, 3, 1],
                [ 3,-1,-1, 3, 1],	]*/
            information.liberties = ns.go.analysis.getLiberties()
        }

        //set default value
        information.cheat_chance = 0
        //check if we can cheat
        if (can_cheat) {
            /*Returns your chance of successfully playing one of the special moves in the ns.go.cheat API. 
            Scales up with your crime success rate stat. Scales down with the number of times you've attempted to cheat in the current game.
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            information.cheat_chance = ns.go.cheat.getCheatSuccessChance()
        }

        //return the information
        return information
    }
}
