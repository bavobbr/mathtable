/*
Game config settings
 */

let correct = 0;  // Number of correctly answered tiles
let target = 16;  // Target number of correctly answered tiles to finish the game
let bgImages = ['bbear.png', 'bcat.png', 'bdog.png', 'bpanda.png', 'bpinguin.png', 'bpolar.png']; // Background images list

let startTime;  // To store the time when the game starts
let firstClick = false;  // To check whether the first click has been made
let playing = true;  // To check if the game is currently active

/*
Helper functions
 */

// Function to create a tile
// isColHeader and isRowHeader are flags to determine the type of the tile
// textContent is the text to be put inside the tile
function createTile(isColHeader = false, isRowHeader = false, textContent = "") {
    let tile = document.createElement('div');
    tile.classList.add('tile');
    if (isColHeader) {
        tile.classList.add('col-header-tile');
        tile.textContent = textContent;
    } else if (isRowHeader) {
        tile.classList.add('row-header-tile');
        tile.textContent = textContent;
    } else {
        tile.classList.add('game-tile');
    }
    return tile;
}

// Function to create an input field
// parentTile is the tile which will contain the input field
function createInputField(parentTile) {
    let input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';

    input.addEventListener('blur', function () {
        let number = this.value;
        if (parentTile) {
            parentTile.textContent = number;
            if (number) {
                // validate the input to be correct
                if (number === parentTile.dataset.solution) {
                    parentTile.classList.remove('wrong-solution');
                    parentTile.classList.add('transparent-tile');
                    parentTile.dataset.solved = 'true'; // Add this line
                    if (parentTile.dataset.active === "yes") {
                        // we only count the proposed ones
                        correct++;
                    }
                    proposeTile(tiles);
                } else {
                    parentTile.classList.remove('transparent-tile');
                    parentTile.classList.add('wrong-solution');
                    parentTile.dataset.solved = 'false'; // Add this line
                }
            }
            coltiles.forEach(tile => {
                tile.classList.remove('current-puzzle');
            });
            rowtiles.forEach(tile => {
                tile.classList.remove('current-puzzle');
            });
            if (checkSolved()) {
                resolve(tiles);
            }
        }
    });


    // Add a keydown event listener
    input.addEventListener('keydown', function (e) {
        // If the key pressed was ENTER
        if (e.key === 'Enter' || e.keyCode === 13) {
            // Trigger the blur event
            input.blur();
        }
    });

    return input;
}

// Function to check if needed tiles are solved
function checkSolved() {
    return correct >= target || tiles.every(tile => tile.dataset.solved === 'true');
}

// Function to reveal the final solution and calculate time taken
// tiles is an array of all the game tiles
function resolve(tiles) {
    if (playing) {
        playing = false
        tiles.forEach(tile => {
            if (tile.dataset.solved === 'false') {
                tile.classList.remove('wrong-solution');
                tile.classList.remove('suggested-tile');
                tile.classList.add('transparent-tile');
                tile.classList.add('borderless-tile');
                tile.textContent = '';
            }
        });
        let elapsedTime = Math.round((new Date() - startTime) / 1000);  // Time in seconds
        document.getElementById('modal-time-elapsed').innerHTML = elapsedTime;
        $('#game-complete-modal').modal('show');
    }
}

function proposeTile(tiles) {
    tiles.forEach(tile => {
        tile.classList.remove('suggested-tile');
        tile.dataset.active = "no";
    });
    let unsolvedTiles = tiles.filter(tile => tile.dataset.solved === 'false');
    if (unsolvedTiles.length > 0) {
        let randomTile = unsolvedTiles[Math.floor(Math.random() * unsolvedTiles.length)];
        randomTile.classList.add('suggested-tile');
        randomTile.dataset.active = "yes";
    }
}

function setRandomBackgroundImage() {
    let date = new Date();
    let dayOfMonth = date.getDate()
    let imageIndex = (dayOfMonth - 1) % bgImages.length;
    let dailyImage = bgImages[imageIndex];
    gameGrid.style.backgroundImage = `url('/img/${dailyImage}')`;
}

/*
Initialize the grid
 */

// store grid and headers in variables
let colHeader = document.getElementById('col-header');
let rowHeader = document.getElementById('row-header');
let gameGrid = document.getElementById('game-grid');

// Create header tiles
for (let i = 0; i < 10; i++) {
    let colHeaderTile = createTile(true, false, i + 1);
    let rowHeaderTile = createTile(false, true, i + 1);
    colHeader.appendChild(colHeaderTile);
    rowHeader.appendChild(rowHeaderTile);
}

// Create 100 div elements
for (let c = 1; c <= 10; c++) {
    for (let r = 1; r <= 10; r++) {
        let newTile = createTile();
        newTile.dataset.solution = "" + r * c; // Assign solution number
        newTile.dataset.row_idx = "" + r; // Assign row number
        newTile.dataset.col_idx = "" + c; // Assign col number
        newTile.dataset.solved = 'false'; // Initialize solved attribute to false
        gameGrid.appendChild(newTile);
    }
}

// Store all tiles in a variable
let tiles = Array.from(document.getElementsByClassName('game-tile'));
let coltiles = Array.from(document.getElementsByClassName('col-header-tile'));
let rowtiles = Array.from(document.getElementsByClassName('row-header-tile'));

// Add an event listener to each tile
tiles.forEach(tile => {
    tile.addEventListener('click', function () {
        if (playing) {
            this.classList.remove('suggested-tile');
            if (!this.dataset.solved || this.dataset.solved === 'false') {
                this.textContent = '';
                let col = this.dataset.col_idx
                let row = this.dataset.row_idx
                let coltile = coltiles[col - 1]
                let rowtile = rowtiles[row - 1]
                coltile.classList.add('current-puzzle');
                rowtile.classList.add('current-puzzle');
                let input = createInputField(this);
                this.appendChild(input);
                input.focus();
            }
            if (checkSolved()) {
                resolve(tiles);
            }
        }
    });
});

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});

/*
Start game by setting background and suggesting start tile
 */
setRandomBackgroundImage();
proposeTile(tiles);

// Add a click event listener to the game grid to start timing the game
document.getElementById('game-grid').addEventListener('click', function (e) {
    if (!firstClick) {
        startTime = new Date();
        firstClick = true;
    }
});
