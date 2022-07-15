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

        // Role should be opposite when player 1 (x) press X we need to set role to player 2 (o)
        role = (role == 'x') ? 'o' : 'x';
        mark_lock = true;
    });
});