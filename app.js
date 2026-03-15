const categories = [
    { id: 'ones', label: 'Ones', section: 'upper' },
    { id: 'twos', label: 'Twos', section: 'upper' },
    { id: 'threes', label: 'Threes', section: 'upper' },
    { id: 'fours', label: 'Fours', section: 'upper' },
    { id: 'fives', label: 'Fives', section: 'upper' },
    { id: 'sixes', label: 'Sixes', section: 'upper' },
    { id: 'upper_sum', label: 'Upper Sum', section: 'upper_calc', isCalc: true },
    { id: 'bonus', label: 'Bonus (35)', section: 'upper_calc', isCalc: true },
    { id: 'upper_total', label: 'Upper Total', section: 'upper_calc', isCalc: true },
    { id: 'three_kind', label: '3 of a Kind', section: 'lower' },
    { id: 'four_kind', label: '4 of a Kind', section: 'lower' },
    { id: 'full_house', label: 'Full House (25)', section: 'lower' },
    { id: 'sm_straight', label: 'Sm. Straight (30)', section: 'lower' },
    { id: 'lg_straight', label: 'Lg. Straight (40)', section: 'lower' },
    { id: 'yahtzee', label: 'YAHTZEE (50)', section: 'lower' },
    { id: 'chance', label: 'Chance', section: 'lower' },
    { id: 'lower_total', label: 'Lower Total', section: 'lower_calc', isCalc: true },
    { id: 'grand_total', label: 'GRAND TOTAL', section: 'grand_calc', isCalc: true }
];

let players = JSON.parse(localStorage.getItem('yahtzeePlayers')) || [];

function saveState() {
    localStorage.setItem('yahtzeePlayers', JSON.stringify(players));
}

function renderTable() {
    const table = document.getElementById('score-table');
    let html = '<thead><tr><th>Category</th>';
    players.forEach((p, index) => {
        html += `<th>${p.name} <span style="cursor:pointer; font-size: 0.8em;" onclick="removePlayer(${index})">❌</span></th>`;
    });
    html += '</tr></thead><tbody>';

    categories.forEach(cat => {
        const rowClass = cat.isCalc ? 'total-row' : 'category-row';
        html += `<tr class="${rowClass}"><td>${cat.label}</td>`;
        
        players.forEach((p, pIndex) => {
            if (cat.isCalc) {
                html += `<td id="calc-${pIndex}-${cat.id}">${p.scores[cat.id] || 0}</td>`;
            } else {
                html += `<td><input type="number" min="0" max="100" 
                            value="${p.scores[cat.id] === undefined ? '' : p.scores[cat.id]}" 
                            onchange="updateScore(${pIndex}, '${cat.id}', this.value)"></td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
    calculateTotals();
}

window.updateScore = function(playerIndex, categoryId, value) {
    const numVal = parseInt(value, 10);
    players[playerIndex].scores[categoryId] = isNaN(numVal) ? undefined : numVal;
    saveState();
    calculateTotals();
};

window.removePlayer = function(index) {
    players.splice(index, 1);
    saveState();
    renderTable();
};

function calculateTotals() {
    players.forEach((p, index) => {
        let upperSum = 0;
        ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(id => {
            upperSum += p.scores[id] || 0;
        });

        const bonus = upperSum >= 63 ? 35 : 0;
        const upperTotal = upperSum + bonus;

        let lowerSum = 0;
        ['three_kind', 'four_kind', 'full_house', 'sm_straight', 'lg_straight', 'yahtzee', 'chance'].forEach(id => {
            lowerSum += p.scores[id] || 0;
        });

        const grandTotal = upperTotal + lowerSum;

        p.scores.upper_sum = upperSum;
        p.scores.bonus = bonus;
        p.scores.upper_total = upperTotal;
        p.scores.lower_total = lowerSum;
        p.scores.grand_total = grandTotal;

        if (document.getElementById(`calc-${index}-upper_sum`)) {
            document.getElementById(`calc-${index}-upper_sum`).innerText = upperSum;
            document.getElementById(`calc-${index}-bonus`).innerText = bonus;
            document.getElementById(`calc-${index}-upper_total`).innerText = upperTotal;
            document.getElementById(`calc-${index}-lower_total`).innerText = lowerSum;
            document.getElementById(`calc-${index}-grand_total`).innerText = grandTotal;
        }
    });
    saveState();
}

document.getElementById('add-player-btn').addEventListener('click', () => {
    const name = prompt('Enter player name:');
    if (name) {
        players.push({ name, scores: {} });
        saveState();
        renderTable();
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all scores?')) {
        players.forEach(p => p.scores = {});
        saveState();
        renderTable();
    }
});

// Initial Render
if (players.length === 0) {
    players.push({ name: 'Player 1', scores: {} });
}
renderTable();