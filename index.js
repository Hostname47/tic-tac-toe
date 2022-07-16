let role = 'x';

let mark_lock = true;
document.querySelectorAll('#board .square').forEach((square) => {
    square.addEventListener('click', (event) => {
        if(square.dataset.value != 0 || !mark_lock) return;
        mark_lock = false; // prevent any click event race condition

        let mark = document.querySelector(`.${role}-mark`).cloneNode(true);
        mark.classList.remove('none');
        
        square.appendChild(mark);
        square.dataset.value = role;

        let result = evaluate(square, role);

        /**
         * First hide all feedback because in the next switch, the feedback will be changed.
         * Also, remove selected style from current player result box and the next switch will set it to
         * the other player if the game persist (reach default section)
         */
        document.querySelectorAll('#game-status-feedback .feedback').forEach(feedback => feedback.classList.add('none'));
        document.querySelectorAll('.result-box').forEach(box => box.classList.remove('selected-result-box'));

        switch(result) {
            case 'win':
                mark_lock = false;
                document.querySelector(`#${role}-win-feedback`).classList.remove('none');
                return;
            case 'draw':
                mark_lock = false;
                document.querySelector(`#draw-feedback`).classList.remove('none');
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
        return 'win';
    }
    // 1. check vertical match (If we get 3 element with same mark and same column, it means current player is winner)
    if(document.querySelectorAll(`#board .square[data-column="${squareColumn}"][data-value="${role}"]`).length == 3) {
        return 'win';
    }

    /**
     * We check the diagonals only if the filled square row + column = 2 or the equals each other
     * (please trace a table in pen and paper with indexes to understand why the sum should be 2;
     * because some squares cannot form a diagonal)
     */
    if(squareRow + squareColumn == 2 || squareRow == squareColumn) {
        // First diagonal
        if(document.querySelectorAll(`#square-00[data-value="${role}"], #square-11[data-value="${role}"], #square-22[data-value="${role}"]`).length == 3) {
            return 'win';
        }
        // Second diagonal
        if(document.querySelectorAll(`#square-02[data-value="${role}"], #square-11[data-value="${role}"], #square-20[data-value="${role}"]`).length == 3) {
            return 'win';
        }
    }

    /**
     * If the function reach this stage and no line found, and the filled square is the last
     * one left, that means the game is a draw
     */
    if(document.querySelectorAll(`#board .square[data-value="0"]`).length == 0) {
        return 'draw';
    }
}