let role = 'x';

let mark_lock = true;
document.querySelectorAll('#board .square').forEach((square) => {
    square.addEventListener('click', (event) => {
        if(square.dataset.value != 0 || !mark_lock) return;
        mark_lock = false; // prevent any click event race condition

        // Delete mouseenter event animated x
        let lmark = square.querySelector('.light-mark');
        if(lmark)
            lmark.remove();

        let mark = document.querySelector(`.${role}-mark`).cloneNode(true);
        mark.classList.remove('none');
        
        square.appendChild(mark);
        square.dataset.value = role;

        let result = evaluate(square, role);
        /**
         * animate will see if the game is ended with a winner or draw and draw a line
         * or show draw m
         */
        animate(result, role);
        
        /**
         * First hide all feedback because in the next switch, the feedback will be set depends on the state of game.
         * Also, remove selected style from current player result box and the next switch will set it to
         * the other player if the game persist (reach default section)
         */
        document.querySelectorAll('#game-status-feedback .feedback').forEach(feedback => feedback.classList.add('none'));
        document.querySelectorAll('.result-box').forEach(box => box.classList.remove('selected-result-box'));

        switch(result['result']) {
            case 'win':
                mark_lock = false;
                document.querySelector(`#${role}-win-feedback`).classList.remove('none');
                // Increase winner player score
                let result = document.querySelector(`#${role}-result-box .result`);
                result.textContent = isNaN(result.textContent) ? 1 : parseInt(result.textContent) + 1;
                return;
            case 'draw':
                mark_lock = false;
                document.querySelector(`#draw-feedback`).classList.remove('none');
                // In case of a draw, we increment result for both players
                document.querySelectorAll('#results-box .result').forEach((result) => {
                    result.textContent = isNaN(result.textContent) ? 1 : parseInt(result.textContent) + 1;
                });
                return;
            default:
                // Role should be opposite when player 1 (x) press X we need to set role to player 2 (o)
                role = (role == 'x') ? 'o' : 'x';
                // Then we change turn feedback (for example : x turn => o turn)
                document.querySelector(`#${role}-turn-feedback`).classList.remove('none');
                document.querySelector(`#${role}-result-box`).classList.add('selected-result-box');
        }

        mark_lock = true; // release the lock
    });

    square.addEventListener('mouseenter', (event) => {
        if(square.dataset.value==0) {
            let mark = document.querySelector(`.${role}-mark`).cloneNode(true);
            mark.classList.add('light-mark');
            mark.classList.remove('none');
            square.appendChild(mark);
        }
    });
    
    square.addEventListener('mouseleave', (event) => {
        if(square.dataset.value==0) {
            square.querySelector('.light-mark').remove();
        }
    });
});

let animationTimeout;
function animate(result, role) {
    let board = document.querySelector('#board');
    let resultBox = document.querySelector('#board-result-box');
    let iconsBox = document.createElement('div');
    let title = document.createElement('span');
    let subTitle = document.createElement('span');
    let x = document.querySelector('.x-mark').cloneNode(true);
    let o = document.querySelector('.o-mark').cloneNode(true);
    switch(result.result) {
        /**
         * In case a player win we need to get the middle square of the line,
         * then we add the square into it and stretch it to form the win line
         * Notice that if the winner wins with diagonal line, then we need to rotate
         * the line before stretch it
         */
        case 'win':
            let middleSquare;
            let line = document.querySelector('.win-line').cloneNode(true);
            line.classList.remove('none');
            switch(result.type) {
                case 'horizontal':
                    middleSquare = document.querySelector(`#board .square[data-row="${result.row}"][data-column="1"]`);
                    middleSquare.appendChild(line);
                    line.style.width = `${middleSquare.clientWidth * 3 - 20}px`;
                    break;
                case 'vertical':
                    middleSquare = document.querySelector(`#board .square[data-column="${result.column}"][data-row="1"]`);
                    middleSquare.appendChild(line);
                    line.style.height = `${middleSquare.clientWidth * 3 - 20}px`;
                    break;
                case 'diagonal':
                    middleSquare = document.querySelector(`#board .square[data-column="1"][data-row="1"]`);
                    if(result.diagonal == 'top-left-bottom-right')
                        line.classList.add('top-left-bottom-right-rotate');
                    else
                        line.classList.add('top-right-bottom-left-rotate');

                    middleSquare.appendChild(line);
                    line.style.height = `${middleSquare.clientWidth * 3 + 80}px`;
                    break;
            }

            animationTimeout = setTimeout(() => {
                resultBox.classList.remove('none');
                title.textContent = 'WINNER !';
                title.classList.add('title');
                subTitle.textContent = 'Press restart button below to start again';
                subTitle.classList.add('fs11');
                iconsBox.classList.add('full-center');
                if(role == 'x') {
                    x.classList.remove('none', 'x-mark', 'mark');
                    x.classList.add('size28', 'mr8');
                    iconsBox.append(x);
                } else {
                    o.classList.remove('none', 'o-mark', 'mark');
                    o.classList.add('size28');
                    iconsBox.append(o);

                }
                resultBox.append(iconsBox, title, subTitle);
                board.appendChild(resultBox);
            }, 1200)

            break;
        case 'draw':
            resultBox.classList.remove('none');
            title.textContent = 'Draw';
            subTitle.textContent = 'Press restart button below to start again';
            subTitle.classList.add('fs11');
            iconsBox.classList.add('full-center');
            x.classList.remove('none', 'x-mark', 'mark');
            o.classList.remove('none', 'o-mark', 'mark');
            x.classList.add('size28', 'mr8');
            o.classList.add('size28');
            iconsBox.append(x, o);
            title.classList.add('title');
            resultBox.append(iconsBox, title, subTitle);
            board.appendChild(resultBox);

            break;
    }
}

document.querySelector('#restart-game').addEventListener('click', function() {
    document.querySelectorAll('#board .square').forEach((square) => {
        square.innerHTML = ''; // remove square marks
        square.dataset.value = 0;

        document.querySelectorAll('#game-status-feedback .feedback').forEach(feedback => feedback.classList.add('none'));
        document.querySelectorAll('.result-box').forEach(box => box.classList.remove('selected-result-box'));
        document.querySelector(`#x-turn-feedback`).classList.remove('none');
        document.querySelector(`#x-result-box`).classList.add('selected-result-box');
        document.querySelector('#board-result-box').innerHTML = '';
        document.querySelector('#board-result-box').classList.add('none');
        role = 'x';
        clearTimeout(animationTimeout);
        mark_lock = true; // release the lock
    });
});

function evaluate(square, role) {
    /**
     *  x   x   x  <== these three cases has the same row (x is winner because all row squares has same mark x)
     *  o   o   x
     *  x   o   o
     * 
     * As parameters, we accept the square filled as well as the player mark (x or o).
     * We check Horizontal, vertical and diagonals checks starting from the filled square and we see
     * if a there's a match line with same mark horizontally, vertically and digonals.
     */

    let squareRow = parseInt(square.dataset.row, 10);
    let squareColumn = parseInt(square.dataset.column, 10);
    
    // 1. check horizontal match (If we get 3 element with same mark and same row, it means current player is winner)
    if(document.querySelectorAll(`#board .square[data-row="${squareRow}"][data-value="${role}"]`).length == 3) {
        return {
            result: 'win',
            type: 'horizontal',
            row: squareRow,
        };
    }
    // 2. check vertical match (If we get 3 element with same mark and same column, it means current player is winner)
    if(document.querySelectorAll(`#board .square[data-column="${squareColumn}"][data-value="${role}"]`).length == 3) {
        return {
            result: 'win',
            type: 'vertical',
            column: squareColumn,
        };
    }

    /**
     * We check the diagonals only if the filled square row + column = 2 or the equals each other
     * (please trace a table in pen and paper with indexes to understand why the sum should be 2;
     * because some squares cannot form a diagonal)
     */
    if(squareRow + squareColumn == 2 || squareRow == squareColumn) {
        // First diagonal
        if(document.querySelectorAll(`#square-00[data-value="${role}"], #square-11[data-value="${role}"], #square-22[data-value="${role}"]`).length == 3) {
            return {
                result: 'win',
                type: 'diagonal',
                diagonal: 'top-left-bottom-right',
            };
        }
        // Second diagonal
        if(document.querySelectorAll(`#square-02[data-value="${role}"], #square-11[data-value="${role}"], #square-20[data-value="${role}"]`).length == 3) {
            return {
                result: 'win',
                type: 'diagonal',
                diagonal: 'top-right-bottom-left',
            };
        }
    }

    /**
     * If the function reach this stage and no line found, and the filled square is the last
     * one left, that means the game is a draw
     */
    if(document.querySelectorAll(`#board .square[data-value="0"]`).length == 0) {
        return {
            result: 'draw',
        };
    }

    return {
        result: 'continue',
    };
}