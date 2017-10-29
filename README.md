# :ship: Battleship Server!
This is a project for my CS2 class. Below is information on the encoding used.

### Key

| Symbol       | Meaning             |
|--------------|---------------------|
| :arrow_up:   | Send to server      |
| :arrow_down: | Receive from server |

### Creating and Joining Games
#### :arrow_up: Get Gamecode
```GETGAMECODE```

Asks the server for a gamecode to create a game.

**Examples:**
- `GETGAMECODE`

#### :arrow_down: Gamecode
`GAMECODE <gamecode>`

Get a gamecode from the server

**Examples:**
- `GAMECODE 123456`

#### :arrow_up: Join
```JOIN <gamecode>```

Joins a game.
Examples:
- `JOIN 123456`

#### :arrow_down: Join
```JOIN [success|fail]```

Says if game was successfully joned to the client who attempted to join the game.

**Examples:**
- `JOIN success`
- `JOIN fail`

### Transmitting Game Data
#### :arrow_up: Send Board

```SENDBOARD <ship1x> <ship1y> <ship2x> <ship2y> <ship3x> <ship3y> <ship4x> <ship4y> <ship5x> <ship5y>```
Sends your player's boards
*Examples:*
- `SENDBOARD 1 2 1 4 2 5 3 1`

#### :arrow_down: Move First
```MOVEFIRST <yes|no>```

Tells you if you go first.

**Examples**
- `MOVEFIRST yes`
- `MOVEFIRST no`


#### :arrow_up: Move
```MOVE [surrender|<x><y>]```

Sends a move

**Examples:**   
- `MOVE 2 3`
- `MOVE surrender`

#### :arrow_down: Move
```MOVE [hit|miss|surrendered] <x> <y>```

Tells both players what happened during the last move

**Examples:**
- `MOVE 2 3 hit`
- `MOVE 2 3 miss`
- `MOVE surrendered`
- `MOVE fail`

#### :arrow_down: End of Game
```GAMEEND <win|lose>```

Tells you if you won or lost.

*NOTE:* After this is sent, the game object is deleted and the game cannot be resumed. You must request a new gamecode with (`GETGAMECODE`)[#arrow_up-get-gamecode], or join a game with (`JOIN`)[#arrow_up-join].

*Examples:*
- `GAMEEND win`
- `GAMEEND lose`

## Sample Game:

| Speaker    | Message                                               |
|------------|-------------------------------------------------------|
| Client 1   | `GETGAMECODE`                                         |
| Server     | `GAMECODE 123456`                                     |
| Client 2   | `JOIN 123456`                                         |
| Server(C2) | `JOIN success`                                        |
| Client 1   | `SENDBOARD 1 5 2 3 4 3 1 2`                           |
| Client 2   | `SENDBOARD 1 2 1 4 2 5 3 1`                           |
| Server(C1) | `MOVEFIRST yes`                                       |
| Server(C2) | `MOVEFIRST no`                                        |
| Client 1   | `MOVE 1 2`                                            |
| Server     | `MOVE hit 1 2`                                        |
| Client 2   | `MOVE 2 2`                                            |
| Server     | `MOVE miss 2 2`                                       |
|            | _Continues `MOVE` communications until game is over._ |
| Server(C1) | `GAMEEND win 2`                                       |
| Server(C2) | `GAMEEND lose 2`                                      |
