//requires no SF. GoCheat requires SF 14.2
/*
Go				IPvGO api
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.go.md
GoAnalysis		Tools to analyze the IPvGO subnet.
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.goanalysis.md
GoCheat			Illicit and dangerous IPvGO tools. Not for the faint of heart. Requires Source-File 14.2 to use.
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gocheat.md

https://github.com/bitburner-official/bitburner-src/blob/2e456f5a9c179fbb989b6bbc6b8990e259912fbe/src/Documentation/doc/en/programming/go_algorithms.md
*/


ns.go.analysis.getStats()
        /*
        bonusDescription	string	Description of stat boost
        bonusPercent		number	Stat boost
        highestWinStreak	number	Highest winstreak since last reset
        losses				number	Number of losses since last reset
        rep					number	Favor gain from winstreaks, calculated as converted rep
        wins				number	Number of wins since last reset
        winStreak			number	Current winstreak
        */

# Bitnode 14
## Introduction


## Bitnode multipliers
GoPower: 4,

HackingLevelMultiplier: 0.4,
HackingSpeedMultiplier: 0.3,

ServerMaxMoney: 0.7,
ServerStartingMoney: 0.5,
ServerStartingSecurity: 1.5,

CrimeMoney: 0.75,
CrimeSuccessRate: 0.4,
HacknetNodeMoney: 0.25,
ScriptHackMoney: 0.3,

StrengthLevelMultiplier: 0.5,
DexterityLevelMultiplier: 0.5,
AgilityLevelMultiplier: 0.5,
DefenseLevelMultiplier: 0.5,

AugmentationMoneyCost: 1.5,

InfiltrationMoney: 0.75,

FactionWorkRepGain: 0.2,
CompanyWorkRepGain: 0.2,

CorporationValuation: 0.4,
CorporationSoftcap: 0.9,
CorporationDivisions: 0.8,

BladeburnerRank: 0.6,
BladeburnerSkillCost: 2,

GangSoftcap: 0.7,
GangUniqueAugs: 0.4,

StaneksGiftPowerMultiplier: 0.5,
StaneksGiftExtraSize: -1,

WorldDaemonDifficulty: 5,


## Enums
Go				IPvGO api
GoAnalysis		Tools to analyze the IPvGO subnet.
GoCheat			Illicit and dangerous IPvGO tools. Not for the faint of heart. Requires Source-File 14.2 to use.


/*
Go
Go.getMoveHistory()						0
Go.getOpponent()						0
Go.makeMove()							0
Go.opponentNextTurn()					0
Go.passTurn()							0
Go.resetBoardState()					0
Go.getCurrentPlayer()					0
Go.getGameState()						0
Go.getBoardState()						4

analysis
GoAnalysis.clearAllPointHighlights()	0
GoAnalysis.clearPointHighlight()		0
GoAnalysis.getStats()					0
GoAnalysis.highlightPoint()				0
GoAnalysis.resetStats()					0
GoAnalysis.setTestingBoardState()		4
GoAnalysis.getValidMoves()				8
GoAnalysis.getChains()					16
GoAnalysis.getControlledEmptyNodes()	16
GoAnalysis.getLiberties()				16

cheat (SF14.2)
GoCheat.getCheatCount() 				1
GoCheat.getCheatSuccessChance()			1
GoCheat.destroyNode()					8
GoCheat.playTwoMoves()					8
GoCheat.removeRouter()					8
GoCheat.repairOfflineNode()				8

/*
Adding network expansion moves
	Just playing random moves is not very effective, though. The next step is to use the board state to try and take over territory.
	ns.go.getBoardState() returns a simple grid representing what the current board looks like. The player's routers are marked with X, and the opponents with O.
	Example 5x5 board state, with a number of networks for each player:
	[  "XX.O.",
	"X..OO",
	".XO..",
	"XXO..",
	".XOO.", ]
	The board state can be used to look at all the nodes touching a given point, by looking at an adjacent pair of coordinates.
	For example, the point to the 'north' of the current point x, y can be retrieved with board[x + 1]?.[y]. If it is a friendly router it will have value "X". (It will be undefined if x,y is on the north edge of the subnet)
	That info can be used to make decisions about where to place routers.
	In order to expand the area that is controlled by the player's networks, connecting to friendly routers (when possible) is a strong move. This can be done with a very similar implementation to getRandomMove(), with the additional check of looking for a neighboring friendly router. For each point on the board:
	Detect expansion moves:
	For each point on the board:
		* If the empty point is a valid move, and
		* If the point is not an open space reserved to protect the network [see getRandomMove()], and
		* If a point to the north, south, east, or west is a friendly router
		Then, the move will expand an existing network
	When possible, an expansion move like this should be used over a random move. When neither can be found, pass turn.
	This idea can be improved: reserved spaces can be skipped if the nodes are in different networks. Se ns.go.analysis.getChains()
	After implementing this, the script will consistently get points on the subnet against most opponents (at least on the larger boards), and will sometimes even get lucky and win against the easiest factions.

 
Next Steps
	There is a lot we can still do to improve the script. For one, it currently only plays one game, and must be restarted each time! Also, it does not re-set the subnet upon game completion yet.
	In addition, the script only knows about a few types of moves, and does not yet know how to capture or defend networks.
 
Killing duplicate scripts
	Because there is only one subnet active at any time, you do not want multiple copies of your scripts running and competing with each other. 
	It may be helpful to kill any other scripts with the same name as your IPvGO script on startup. 
	This can be done using ns.getRunningScript() to get the script details and ns.kill() to remove old copies of the script.

 
Move option: Capturing the opponent's networks
	If the opposing faction's network is down to its last open port, placing a router in that empty node will capture and destroy that entire network.
	To find out what networks are in danger of capture, ns.go.analysis.getLiberties() shows how many empty nodes / open ports each network has. As with getBoardState() and getValidMoves() , the number of liberties (open ports) for a given point's network can be retrieved via its coordinates [x][y] on the grid returned by getLiberties()
	Detect moves to capture the opponent's routers:
	For each point on the board:
		* If the empty point is a valid move, and
		* If a point to the north, south, east, or west is a router with exactly 1 liberty [via its coordinates in getLiberties()], and
		* That point is controlled by the opponent [it is a "O" via getBoardState()]
		Then, playing that move will capture the opponent's network.

 
Move option: Defending your networks from capture
	getLiberties() can also be used to detect your own networks that are in danger of being captured, and look for moves to try and save it.
	Detect moves to defend a threatened network:
	For each point on the board:
		* If the empty point is a valid move, and
		* If a point to the north, south, east, or west is a router with exactly 1 liberty [via its coordinates in getLiberties()], and
		* That point is controlled by the player [it is a "X" via getBoardState()]
		Then, that network is in danger of being captured.
	To detect if that network can be saved:
	* Ensure the new move will not immediately allow the opponent to capture:
		* That empty point ALSO has two or more empty points adjacent to it [a "." via getBoardState()], OR
		* That empty point has a friendly network adjacent to it, and that network has 3 or more liberties [via getLiberties()]
		Then, playing that move will prevent your network from being captured (at least for a turn or two)

 
Move option: Smothering the opponent's networks
	In some cases, an opponent's network cannot YET be captured, but by placing routers all around it, the network can be captured on a future move. (Or at least you force the opponent to spend moves defending their network.)
	There are many ways to approach this, but the simplest is to look for any opposing network with the fewest liberties remaining (ideally 2), and find a safe point to place a router that touches it.
	To make sure the move will not immediately get re-captured, make sure the point you play on has two adjacent empty nodes, or is touching a friendly network with three+ liberties. (This is the same as the check in the move to defend a friendly chain.)

Move option: Expanding your networks' connections to empty nodes
	The more empty nodes a network touches, the stronger it is, and the more territory it influences. Thus, placing routers that touch a friendly network and also to as many open nodes as possible is often a strong move.
	This is similar to the logic for defending your networks from immediate capture. Look for a friendly network with the fewest open ports, and find an empty node adjacent to it that touches multiple other empty nodes.

Move option: Encircling space to control empty nodes
	A key part of the strategy of Go is fully encircling groups of empty nodes. The examples at the start of this doc simply leave out specific nodes and hope they stay empty, but this can be done in much better ways.
	As a simple approach, look for possible moves that are:
		adjacent to two separate empty nodes (open areas it will divide up)
		adjacent a friendly piece and the edge of a board (or a second friendly piece from a different chain than the first)
	This will find moves which are connecting your chains together, or connecting to the edge of the board, and dividing up empty space in the process. This allows you to control space, making it harder to capture your chains in the process.

Choosing a good move option
	Having multiple plausible moves to select from is helpful, but choosing the right option is important to making a strong Go script. In some cases, if a move type is available, it is almost always worth playing (such as defending your network from immediate capture, or capturing a vulnerable enemy network)
	Each of the IPvGO factions has a few moves they will almost always choose (The Black hand will always capture if possible, for example). Coming up with a simple prioritized list is a good start to compete with these scripts. Experiment to see what works best!
	This idea can be improved, however, by including information such as the size of the network that is being threatened or that is vulnerable to capture. It is probably worth giving up one router in exchange for capturing a large enemy network, for example. Adding two new open ports to a large network is helpful, but limiting an opponent's network to one open port might be better.
 
Other types of move options
	Preparing to invade the opponent
		Empty areas that are completely surrounded and controlled by a single player can be seen via ns.go.analysis.getControlledEmptyNodes(). However, just because the area is currently controlled by the opponent does not mean it cannot be attacked! Start by surrounding an opponent's network from the outside, then it can be captured by attacking the space it surrounds and controls. (Note that this only works on networks that have a single interior empty space: if they have multiple inner empty points, the suicide rule prevents you from filling any of them)
	Wrapping empty space
		The starting script uses some very simple logic to leave open empty nodes inside its networks (simply excluding points with x % 2 === 0 && y % 2 === 0). However, it is very strong to look for ways to actively surround empty space.
		Look for moves that connect a network to the edge of a board that touch an empty node, or look for moves that connect two networks and touch an empty node. Or, look for a move that touches a friendly network and splits apart a chain of empty nodes.
	Jumps and Knights' move
		The factions currently only look at moves directly connected to friendly or enemy networks in most cases. however, especially on the larger board, playing a router a few spaces away from an existing line/network allows the player to influence more territory, compared to slower moves that connect one adjacent node at a time. Consider skipping a node or two, or playing diagonally, or combining them to make L shaped jumps (like a knight's move in chess)
	Pattern Matching
		There are a lot of strong shapes in Go, that are worth attempting to re-create. The factions look for ways to slip diagonally between the players' networks and cut them apart. They also look for ways to wrap around isolated opposing routers. Consider making a small library of strong shapes, then looking to match them on the board (or their rotations or mirrors). The exact shapes will require some research into Go, but there is a lot of good documentation online about this idea.
	Creating "Eyes"
		If a single network fully encloses two different disconnected empty nodes, it can never be taken. (If it only had one inner airspace, the opponent could eventually surround and then fill it to capture the network. If there is two, however, the suicide rule prevents them from filling either inner empty space.) Detecting moves that make figure-8 type shapes, or split an encircled empty node chain into two smaller ones, are very strong.
		In addition, if the opponent has only a single such move, playing there first to block it is often extremely disruptive, and can even lead to their network being captured.

	A deeper dive into this idea will involve making your own code to identify chains of pieces (and continuous empty nodes).
		Find all moves that divide up empty space and connect two chains or a chain and the edge as in the 'encircling empty space' idea above
		Apply the move on a sample board in memory, one at a time
		Identify all chains and continuous groups of empty nodes in the resulting board, and which color pieces surround the new empty node groups
		Prioritize the move that makes the most empty node groups fully surrounded by your player color.
		Alternatively, count how many empty node groups each friendly chain is touching, and prioritize moves that create a second of these "eyes" for friendly chains
*/