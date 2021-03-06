var isSetup = true;
var placedShips = 0;
var game;
var shipType;
var vertical;

function makeGrid(table, isPlayer) {
    for (i=0; i<10; i++) {
        let row = document.createElement('tr');
        for (j=0; j<10; j++) {
            let column = document.createElement('td');
            column.addEventListener("click", cellClick);
            row.appendChild(column);
        }
        table.appendChild(row);
    }
}


var grid = document.getElementById('show');
var start_game= document.getElementById('show_opponent')

//modal.style.display = 'block';

start_game.addEventListener("click", myFunction)




var minesweeper = document.getElementsByClassName("hidden2")[0];
var destroyer = document.getElementsByClassName("hidden3")[0];
var battleship = document.getElementsByClassName("hidden4")[0];
var vert = document.getElementById("hidden5");
var instruction1 = document.getElementById("instruction1");
var pLabel = document.getElementById("pLabel");
var upArrow = document.getElementsByClassName("UA");
var leftArrow = document.getElementsByClassName("LA");
var downArrow = document.getElementsByClassName("DA");
var rightArrow = document.getElementsByClassName("RA");
var moveCount =0;

function myFunction() {

    grid.style.display = 'block';
    start_game.style.display = 'none';
    instruction2.style.display = 'block';

}



function markHits(board, elementId, surrenderText) {
    board.attacks.forEach((attack) => {
        let className;
        if (attack.result === "MISS")
            className = "miss";
        else if (attack.result === "HIT")
            className = "hit";
        else if (attack.result === "SUNK")
            className = "hit"
        else if (attack.result === "SURRENDER")
            alert(surrenderText);
        document.getElementById(elementId).rows[attack.location.row-1].cells[attack.location.column.charCodeAt(0) - 'A'.charCodeAt(0)].classList.add(className);
    });
}

function redrawGrid() {
    Array.from(document.getElementById("opponent").childNodes).forEach((row) => row.remove());
    Array.from(document.getElementById("player").childNodes).forEach((row) => row.remove());
    makeGrid(document.getElementById("opponent"), false);
    makeGrid(document.getElementById("player"), true);
    if (game === undefined) {
        return;
    }

    game.playersBoard.ships.forEach((ship) => ship.occupiedSquares.forEach((square) => {
        document.getElementById("player").rows[square.row-1].cells[square.column.charCodeAt(0) - 'A'.charCodeAt(0)].classList.add("occupied");
    }));
    markHits(game.opponentsBoard, "opponent", "You won the game");
    markHits(game.playersBoard, "player", "You lost the game");
}

var oldListener;
function registerCellListener(f) {
    let el = document.getElementById("player");
    for (i=0; i<10; i++) {
        for (j=0; j<10; j++) {
            let cell = el.rows[i].cells[j];
            cell.removeEventListener("mouseover", oldListener);
            cell.removeEventListener("mouseout", oldListener);
            cell.addEventListener("mouseover", f);
            cell.addEventListener("mouseout", f);
        }
    }
    oldListener = f;

//alert ("You have placed a ship");
}

function cellClick() {
    let row = this.parentNode.rowIndex + 1;
    let col = String.fromCharCode(this.cellIndex + 65);
    if (isSetup) {
        sendXhr("POST", "/place", {game: game, shipType: shipType, x: row, y: col, isVertical: vertical}, function(data) {
            game = data;
            redrawGrid();
            placedShips++;

            console.log(shipType);

            if(shipType == "MINESWEEPER")
            {
                minesweeper.style.display = 'inline';
                minesweeper.disabled = 'true';

            }
            else if(shipType == "DESTROYER")
            {

                destroyer.style.display = 'inline';
                destroyer.disabled = 'true';

            }
            else if(shipType == "BATTLESHIP")
            {

                battleship.style.display = 'inline';
                battleship.disabled = 'true';

            }



            if (placedShips == 3) {
                vert.style.display= 'none';
                instruction1.style.display= 'none';
                start_game.style.display='block';

                //myFunction();
                isSetup = false;
                registerCellListener((e) => {});

            }

        });
        //alert("You have placed a ship");
    } else {
        sendXhr("POST", "/attack", {game: game, x: row, y: col}, function(data) {
            game = data;
            redrawGrid();

        })
    }

}

function sendXhr(method, url, data, handler) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", function(event) {


        if (req.status != 200) {
            if (shipType != NULL) {
                alert("Two ships may not occupy one square. Please try placing in another spot.");
                return;
            }
            alert("You must select a ship first.");
            return;
        }
        handler(JSON.parse(req.responseText));
       // alert("You have placed a ship");
    });
    req.open(method, url);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(data));

}

function place(size) {
    return function() {
        let row = this.parentNode.rowIndex;
        let col = this.cellIndex;
        vertical = document.getElementById("is_vertical").checked;
        let table = document.getElementById("player");
        for (let i=0; i<size; i++) {
            let cell;
            if(vertical) {
                let tableRow = table.rows[row+i];
                if (tableRow === undefined) {
                    // ship is over the edge; let the back end deal with it
                    break;
                }
                cell = tableRow.cells[col];
            } else {
                cell = table.rows[row].cells[col+i];
            }
            if (cell === undefined) {
                // ship is over the edge; let the back end deal with it
                break;
            }
            cell.classList.toggle("placed");
            //alert("You have placed a ship");
        }
        //alert("You have placed a ship");
    }

}

function initGame() {
    makeGrid(document.getElementById("opponent"), false);
    makeGrid(document.getElementById("player"), true);
    document.getElementById("place_minesweeper").addEventListener("click", function(e) {
        shipType = "MINESWEEPER";
       registerCellListener(place(2));
    });
    document.getElementById("place_destroyer").addEventListener("click", function(e) {
        shipType = "DESTROYER";
       registerCellListener(place(3));
    });
    document.getElementById("place_battleship").addEventListener("click", function(e) {
        shipType = "BATTLESHIP";
       registerCellListener(place(4));
    });
    document.getElementsByClassName("UA").addEventListener("click", function(e){
        if(moveCount < 2){
                    moveFleet(0,1);
                }
        moveCount+=1;
    });
    document.getElementsByClassName("LA").addEventListener("click", function(e){
        if(moveCount < 2){
                    moveFleet(-1,0);
                }
        moveCount+=1;
    });
    document.getElementsByClassName("DA").addEventListener("click", function(e){
        if(moveCount < 2){
                    moveFleet(1,0);
                }
        moveCount+=1;
    });
    document.getElementsByClassName("RA").addEventListener("click", function(e){
        if(moveCount < 2){
            moveFleet(0,-1);
        }
        moveCount+=1;
    });
    sendXhr("GET", "/game", {}, function(data) {
        game = data;

    });

};
