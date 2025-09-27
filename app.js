class HeistApp {
    constructor() {
        this.elements = {
            heistSelect: document.querySelector('#heist-select'),
            optionsContainer: document.querySelector('#heist-options-container'),
            resultContainer: document.querySelector('#result-container'),
        };

        this.state = {
            currentHeist: 'cayoPerico',
        };

        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateUIVisibility();
        this.calculate();
    }

    attachEventListeners() {
        this.elements.heistSelect.addEventListener('change', (e) => {
            this.state.currentHeist = e.target.value;
            this.updateUIVisibility();
            this.calculate();
        });

        this.elements.optionsContainer.addEventListener('input', () => {
            this.calculate();
        });
    }

    updateUIVisibility() {
        const { optionsContainer, heistSelect } = this.elements;
        optionsContainer.querySelectorAll('.heist-options').forEach(el => {
            el.classList.add('hidden');
        });

        const activeOptionEl = optionsContainer.querySelector(`#${heistSelect.value}Options`);
        if (activeOptionEl) {
            activeOptionEl.classList.remove('hidden');
        }

        if (this.state.currentHeist === 'diamondCasino') {
            this.renderPlayerCuts();
        }
    }

    renderPlayerCuts() {
        const playersCount = parseInt(document.querySelector('#casino-players').value, 10);
        const container = document.querySelector('#player-cuts-container');
        container.innerHTML = '<label>Доли игроков (%):</label><div class="form-grid"></div>';
        const grid = container.querySelector('.form-grid');
        
        for (let i = 1; i <= playersCount; i++) {
            const defaultCut = i === 1 ? 55 : Math.floor((100 - 55) / (playersCount - 1));
            grid.innerHTML += `
                <div class="form-group">
                    <input type="number" class="form-control player-cut-input" value="${defaultCut}" min="0" max="100" data-player-id="${i}">
                </div>
            `;
        }
    }
    
    calculate() {
        switch (this.state.currentHeist) {
            case 'cayoPerico':
                this.calculateCayoPerico();
                break;
            case 'diamondCasino':
                this.calculateDiamondCasino();
                break;
        }
    }

    calculateCayoPerico() {
        const primaryTargetValue = parseInt(document.querySelector('#cayo-primary').value, 10);
        const playerCutPercent = parseInt(document.querySelector('#cayo-player-cut').value, 10) || 85;
        let secondaryTargetsValue = 0;
        document.querySelectorAll('#cayoPericoOptions .secondary-input').forEach(input => {
            secondaryTargetsValue += (parseInt(input.value, 10) || 0) * (parseInt(input.dataset.value, 10) || 0);
        });

        const totalTake = primaryTargetValue + secondaryTargetsValue;
        const fenceFee = totalTake * 0.10;
        const pavelFee = totalTake * 0.02;
        const finalPayout = totalTake - fenceFee - pavelFee;
        const playerShare = finalPayout * (playerCutPercent / 100);
        
        this.displayResults([
            { label: 'Общая добыча', value: this.formatCurrency(totalTake) },
            { label: 'Финальная выплата', value: this.formatCurrency(finalPayout), highlight: 'final-payout' },
            { label: 'Ваша доля', value: this.formatCurrency(playerShare), highlight: 'player-share' }
        ]);
    }
    
    calculateDiamondCasino() {
        const primaryTargetValue = parseInt(document.querySelector('#casino-primary').value, 10);
        const hackerCut = parseFloat(document.querySelector('#casino-hacker').value);
        const lesterCut = 0.05;

        const crewCosts = primaryTargetValue * (hackerCut + lesterCut);
        const playerPot = primaryTargetValue - crewCosts;
        
        const playerCuts = [];
        document.querySelectorAll('.player-cut-input').forEach(input => {
            playerCuts.push({
                id: input.dataset.playerId,
                share: playerPot * ((parseInt(input.value, 10) || 0) / 100)
            });
        });

        const leaderShare = playerCuts.find(p => p.id === '1')?.share || 0;

        this.displayResults([
            { label: 'Общая добыча', value: this.formatCurrency(primaryTargetValue) },
            { label: 'Затраты на команду', value: this.formatCurrency(crewCosts) },
            { label: 'Деньги для игроков', value: this.formatCurrency(playerPot), highlight: 'final-payout' },
            { label: 'Ваша доля (Игрок 1)', value: this.formatCurrency(leaderShare), highlight: 'player-share' }
        ]);
    }

    formatCurrency(value) {
        if (isNaN(value)) return 'GTA$ 0';
        return `GTA$ ${Math.round(value).toLocaleString('ru-RU')}`;
    }

    displayResults(results) {
        this.elements.resultContainer.innerHTML = '<h3>Результаты</h3><div class="result-grid"></div>';
        const grid = this.elements.resultContainer.querySelector('.result-grid');
        
        results.forEach(item => {
            grid.innerHTML += `
                <div class="result-item">
                    <div class="label">${item.label}</div>
                    <div class="value ${item.highlight || ''}">${item.value}</div>
                </div>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new HeistApp());