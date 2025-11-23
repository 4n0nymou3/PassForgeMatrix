let currentPassword = '';
let passwordHistory = [];
let minValues = {
    uppercase: 1,
    numbers: 1,
    special: 1
};

const PRESETS = {
    memorable: {
        length: 12,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: false,
        extraSpecial: false,
        excludeAmbiguous: true,
        noDuplicates: false,
        noSequential: false,
        noNumbersEnds: false,
        noSpecialEnds: false
    },
    strong: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true,
        extraSpecial: false,
        excludeAmbiguous: true,
        noDuplicates: false,
        noSequential: false,
        noNumbersEnds: false,
        noSpecialEnds: false
    },
    maximum: {
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true,
        extraSpecial: true,
        excludeAmbiguous: false,
        noDuplicates: true,
        noSequential: true,
        noNumbersEnds: false,
        noSpecialEnds: false
    },
    pin: {
        length: 6,
        uppercase: false,
        lowercase: false,
        numbers: true,
        special: false,
        extraSpecial: false,
        excludeAmbiguous: true,
        noDuplicates: false,
        noSequential: true,
        noNumbersEnds: false,
        noSpecialEnds: false
    },
    wifi: {
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true,
        extraSpecial: false,
        excludeAmbiguous: true,
        noDuplicates: false,
        noSequential: false,
        noNumbersEnds: true,
        noSpecialEnds: true
    },
    database: {
        length: 24,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true,
        extraSpecial: true,
        excludeAmbiguous: false,
        noDuplicates: true,
        noSequential: false,
        noNumbersEnds: false,
        noSpecialEnds: false
    },
    quantum: {
        length: 64,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true,
        extraSpecial: false,
        excludeAmbiguous: true,
        noDuplicates: true,
        noSequential: true,
        noNumbersEnds: true, 
        noSpecialEnds: true
    }
};

function init() {
    loadFromStorage();
    setupEventListeners();
    updateHistoryDisplay();
    generatePassword();
}

function loadFromStorage() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
        try {
            passwordHistory = JSON.parse(savedHistory);
        } catch (e) {
            passwordHistory = [];
        }
    }
}

function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('generate-btn').addEventListener('click', generatePassword);
    document.getElementById('copy-btn').addEventListener('click', copyPassword);
    document.getElementById('length-slider').addEventListener('input', updateLength);
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    
    const checkboxes = ['uppercase', 'lowercase', 'numbers', 'special', 'extra-special', 'exclude-ambiguous', 'no-duplicates', 'no-sequential', 'no-numbers-ends', 'no-special-ends'];
    checkboxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', handleCheckboxChange);
        }
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            const action = this.dataset.action;
            changeMinValue(target, action === 'increase' ? 1 : -1);
        });
    });
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            applyPreset(this.dataset.preset);
        });
    });
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateLength() {
    const length = parseInt(document.getElementById('length-slider').value);
    document.getElementById('length-value').textContent = length;
    adjustMinValuesBasedOnLength(length);
    generatePassword();
}

function adjustMinValuesBasedOnLength(length) {
    const maxAllowed = Math.floor(length / 3);
    
    const minUppercase = document.getElementById('min-uppercase');
    const minNumbers = document.getElementById('min-numbers');
    const minSpecial = document.getElementById('min-special');
    
    if (parseInt(minUppercase.textContent) > maxAllowed) {
        minUppercase.textContent = maxAllowed;
        minValues.uppercase = maxAllowed;
    }
    
    if (parseInt(minNumbers.textContent) > maxAllowed) {
        minNumbers.textContent = maxAllowed;
        minValues.numbers = maxAllowed;
    }
    
    if (parseInt(minSpecial.textContent) > maxAllowed) {
        minSpecial.textContent = maxAllowed;
        minValues.special = maxAllowed;
    }
    
    updateButtonStates();
}

function updateButtonStates() {
    const length = parseInt(document.getElementById('length-slider').value);
    const maxAllowed = Math.floor(length / 3);
    
    const minIds = ['min-uppercase', 'min-numbers', 'min-special'];
    
    minIds.forEach(id => {
        const element = document.getElementById(id);
        const currentValue = parseInt(element.textContent);
        
        const decreaseBtn = document.querySelector(`[data-target="${id}"][data-action="decrease"]`);
        const increaseBtn = document.querySelector(`[data-target="${id}"][data-action="increase"]`);
        
        if (decreaseBtn) {
            decreaseBtn.disabled = currentValue <= 0;
        }
        
        if (increaseBtn) {
            increaseBtn.disabled = currentValue >= maxAllowed;
        }
    });
}

function changeMinValue(id, delta) {
    const element = document.getElementById(id);
    const current = parseInt(element.textContent);
    const length = parseInt(document.getElementById('length-slider').value);
    const maxAllowed = Math.floor(length / 3);
    const newValue = Math.max(0, Math.min(maxAllowed, current + delta));
    
    element.textContent = newValue;
    minValues[id.replace('min-', '')] = newValue;
    
    updateButtonStates();
    generatePassword();
}

function handleCheckboxChange(event) {
    const uppercase = document.getElementById('uppercase').checked;
    const lowercase = document.getElementById('lowercase').checked;
    
    if (event.target.id === 'uppercase' || event.target.id === 'lowercase') {
        if (!uppercase && !lowercase) {
            event.target.checked = true;
            showToast('At least one letter type must be selected!', 'warning');
            return;
        }
    }
    
    generatePassword();
}

function generatePassword() {
    const length = parseInt(document.getElementById('length-slider').value);
    
    const options = {
        length: length,
        uppercase: document.getElementById('uppercase').checked,
        lowercase: document.getElementById('lowercase').checked,
        numbers: document.getElementById('numbers').checked,
        special: document.getElementById('special').checked,
        extraSpecial: document.getElementById('extra-special')?.checked || false,
        excludeAmbiguous: document.getElementById('exclude-ambiguous')?.checked || false,
        noDuplicates: document.getElementById('no-duplicates')?.checked || false,
        noSequential: document.getElementById('no-sequential')?.checked || false,
        noNumbersEnds: document.getElementById('no-numbers-ends')?.checked || false,
        noSpecialEnds: document.getElementById('no-special-ends')?.checked || false,
        minUppercase: minValues.uppercase,
        minNumbers: minValues.numbers,
        minSpecial: minValues.special
    };
    
    if (!options.uppercase && !options.lowercase) {
        options.uppercase = true;
        document.getElementById('uppercase').checked = true;
    }
    
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*';
    const extraSpecialChars = '(){}[]<>,.;:';
    const ambiguousChars = 'Il1O0';
    
    let charset = '';
    if (options.uppercase) charset += upperChars;
    if (options.lowercase) charset += lowerChars;
    if (options.numbers) charset += numberChars;
    if (options.special) charset += specialChars;
    if (options.extraSpecial) charset += extraSpecialChars;
    
    if (options.excludeAmbiguous) {
        charset = charset.split('').filter(c => !ambiguousChars.includes(c)).join('');
    }
    
    if (!charset) {
        charset = upperChars + lowerChars;
    }
    
    const totalMinRequired = 
        (options.uppercase ? options.minUppercase : 0) +
        (options.numbers ? options.minNumbers : 0) +
        ((options.special || options.extraSpecial) ? options.minSpecial : 0);
    
    if (totalMinRequired > length) {
        showToast('Password length is too short for minimum requirements!', 'error');
        return;
    }
    
    let password = '';
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        password = buildPassword(charset, length, options, upperChars, lowerChars, numberChars, specialChars, extraSpecialChars);
        attempts++;
    } while (!isValidPassword(password, options) && attempts < maxAttempts);
    
    currentPassword = password;
    displayPassword(password);
    updateStrengthIndicator(password, charset.length, length);
    addToHistory(password);
}

function buildPassword(charset, length, options, upperChars, lowerChars, numberChars, specialChars, extraSpecialChars) {
    let passwordArray = [];
    let availableChars = charset.split('');
    
    if (options.uppercase && options.minUppercase > 0) {
        for (let i = 0; i < options.minUppercase; i++) {
            const char = upperChars[getRandomInt(0, upperChars.length - 1)];
            passwordArray.push(char);
            if (options.noDuplicates) {
                availableChars = availableChars.filter(c => c !== char);
            }
        }
    }
    
    if (options.numbers && options.minNumbers > 0) {
        for (let i = 0; i < options.minNumbers; i++) {
            const char = numberChars[getRandomInt(0, numberChars.length - 1)];
            passwordArray.push(char);
            if (options.noDuplicates) {
                availableChars = availableChars.filter(c => c !== char);
            }
        }
    }
    
    if ((options.special || options.extraSpecial) && options.minSpecial > 0) {
        const allSpecial = (options.special ? specialChars : '') + (options.extraSpecial ? extraSpecialChars : '');
        for (let i = 0; i < options.minSpecial; i++) {
            const char = allSpecial[getRandomInt(0, allSpecial.length - 1)];
            passwordArray.push(char);
            if (options.noDuplicates) {
                availableChars = availableChars.filter(c => c !== char);
            }
        }
    }
    
    while (passwordArray.length < length) {
        if (availableChars.length === 0) {
            if (options.noDuplicates) {
                availableChars = charset.split('');
            } else {
                break;
            }
        }
        
        const randomIndex = getRandomInt(0, availableChars.length - 1);
        const char = availableChars[randomIndex];
        passwordArray.push(char);
        
        if (options.noDuplicates) {
            availableChars.splice(randomIndex, 1);
        }
    }
    
    while (passwordArray.length < length) {
        const randomIndex = getRandomInt(0, charset.length - 1);
        passwordArray.push(charset[randomIndex]);
    }
    
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    
    return passwordArray.join('');
}

function isValidPassword(password, options) {
    if (options.noSequential) {
        for (let i = 0; i < password.length - 2; i++) {
            const char1 = password.charCodeAt(i);
            const char2 = password.charCodeAt(i + 1);
            const char3 = password.charCodeAt(i + 2);
            
            if (char2 === char1 + 1 && char3 === char2 + 1) {
                return false;
            }
            if (char2 === char1 - 1 && char3 === char2 - 1) {
                return false;
            }
        }
    }
    
    if (options.noNumbersEnds && password.length > 0) {
        const firstChar = password[0];
        const lastChar = password[password.length - 1];
        if (/[0-9]/.test(firstChar) || /[0-9]/.test(lastChar)) {
            return false;
        }
    }
    
    if (options.noSpecialEnds && password.length > 0) {
        const firstChar = password[0];
        const lastChar = password[password.length - 1];
        if (/[!@#$%^&*(){}[\]<>,.;:]/.test(firstChar) || /[!@#$%^&*(){}[\]<>,.;:]/.test(lastChar)) {
            return false;
        }
    }
    
    if (options.uppercase) {
        const upperCount = (password.match(/[A-Z]/g) || []).length;
        if (upperCount < options.minUppercase) return false;
    }
    
    if (options.numbers) {
        const numberCount = (password.match(/[0-9]/g) || []).length;
        if (numberCount < options.minNumbers) return false;
    }
    
    if (options.special || options.extraSpecial) {
        const specialCount = (password.match(/[!@#$%^&*(){}[\]<>,.;:]/g) || []).length;
        if (specialCount < options.minSpecial) return false;
    }
    
    return true;
}

function getRandomInt(min, max) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = randomBuffer[0] / (0xffffffff + 1);
    return Math.floor(randomNumber * (max - min + 1)) + min;
}

function displayPassword(password) {
    const display = document.getElementById('password-display');
    
    const coloredPassword = password.split('').map(char => {
        if (/[A-Z]/.test(char)) {
            return `<span style="color: #ff6b35; font-weight: 700;">${char}</span>`;
        } else if (/[a-z]/.test(char)) {
            return `<span style="color: #4ecdc4; font-weight: 700;">${char}</span>`;
        } else if (/[0-9]/.test(char)) {
            return `<span style="color: #ffd93d; font-weight: 700;">${char}</span>`;
        } else if (/[!@#$%^&*(){}[\]<>,.;:]/.test(char)) {
            return `<span style="color: #c77dff; font-weight: 700;">${char}</span>`;
        } else {
            return `<span style="font-weight: 700;">${char}</span>`;
        }
    }).join('');
    
    display.innerHTML = coloredPassword;
}

function updateStrengthIndicator(password, charsetSize, length) {
    const entropy = Math.log2(Math.pow(charsetSize, length));
    const score = calculateStrengthScore(password, entropy);
    
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const crackTime = document.getElementById('crack-time');
    const entropyValue = document.getElementById('entropy-value');
    const combinations = document.getElementById('combinations');
    
    let color, text;
    if (score < 20) {
        color = '#ef4444';
        text = 'Very Weak';
    } else if (score < 40) {
        color = '#f59e0b';
        text = 'Weak';
    } else if (score < 60) {
        color = '#eab308';
        text = 'Moderate';
    } else if (score < 80) {
        color = '#22c55e';
        text = 'Strong';
    } else {
        color = '#10b981';
        text = 'Very Strong';
    }
    
    strengthBar.style.width = `${score}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
    
    const crackTimeText = estimateCrackTime(entropy);
    crackTime.textContent = `Crack Time: ${crackTimeText}`;
    
    entropyValue.textContent = `${Math.round(entropy)} bits`;
    
    const totalCombinations = Math.pow(charsetSize, length);
    if (totalCombinations > 1e15) {
        combinations.textContent = `${(totalCombinations / 1e15).toFixed(2)}Q`;
    } else if (totalCombinations > 1e12) {
        combinations.textContent = `${(totalCombinations / 1e12).toFixed(2)}T`;
    } else if (totalCombinations > 1e9) {
        combinations.textContent = `${(totalCombinations / 1e9).toFixed(2)}B`;
    } else if (totalCombinations > 1e6) {
        combinations.textContent = `${(totalCombinations / 1e6).toFixed(2)}M`;
    } else {
        combinations.textContent = totalCombinations.toLocaleString();
    }
}

function calculateStrengthScore(password, entropy) {
    let score = 0;
    
    if (entropy < 28) score = 10;
    else if (entropy < 36) score = 20;
    else if (entropy < 60) score = 40;
    else if (entropy < 80) score = 60;
    else if (entropy < 100) score = 80;
    else score = 95;
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(){}[\]<>,.;:]/.test(password);
    
    const variety = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    score += variety * 2;
    
    const uniqueChars = new Set(password).size;
    const uniqueRatio = uniqueChars / password.length;
    score += uniqueRatio * 5;
    
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/^[a-zA-Z]+$/.test(password)) score -= 10;
    if (/^\d+$/.test(password)) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

function estimateCrackTime(entropy) {
    const guessesPerSecond = 1e12;
    const combinations = Math.pow(2, entropy);
    const seconds = combinations / guessesPerSecond / 2;
    
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return 'Seconds';
    if (seconds < 3600) return 'Minutes';
    if (seconds < 86400) return 'Hours';
    if (seconds < 2592000) return 'Days';
    if (seconds < 31536000) return 'Months';
    if (seconds < 3153600000) return 'Years';
    if (seconds < 31536000000) return 'Decades';
    return 'Centuries';
}

function copyPassword() {
    if (!currentPassword) {
        showToast('No password to copy!', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(currentPassword).then(() => {
        showToast('Password copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy password!', 'error');
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function addToHistory(password) {
    if (!password) return;
    
    passwordHistory.unshift({
        password: password,
        timestamp: new Date().toISOString()
    });
    
    passwordHistory = passwordHistory.slice(0, 10);
    
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    
    if (passwordHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No passwords generated yet</p>';
        return;
    }
    
    historyList.innerHTML = passwordHistory.map((item, index) => `
        <div class="history-item">
            <span class="history-text">${item.password}</span>
            <div class="history-actions">
                <button class="icon-btn" onclick="copyHistoryPassword(${index})" title="Copy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="icon-btn" onclick="deleteHistoryPassword(${index})" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function copyHistoryPassword(index) {
    const password = passwordHistory[index].password;
    navigator.clipboard.writeText(password).then(() => {
        showToast('Password copied from history!', 'success');
    }).catch(() => {
        showToast('Failed to copy password!', 'error');
    });
}

function deleteHistoryPassword(index) {
    passwordHistory.splice(index, 1);
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    updateHistoryDisplay();
    showToast('Password removed from history', 'success');
}

function clearHistory() {
    if (passwordHistory.length === 0) {
        showToast('History is already empty!', 'warning');
        return;
    }
    
    if (confirm('Are you sure you want to clear all password history?')) {
        passwordHistory = [];
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
        updateHistoryDisplay();
        showToast('History cleared!', 'success');
    }
}

function applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;
    
    document.getElementById('length-slider').value = preset.length;
    document.getElementById('length-value').textContent = preset.length;
    document.getElementById('uppercase').checked = preset.uppercase;
    document.getElementById('lowercase').checked = preset.lowercase;
    document.getElementById('numbers').checked = preset.numbers;
    document.getElementById('special').checked = preset.special;
    
    const extraSpecial = document.getElementById('extra-special');
    const excludeAmbiguous = document.getElementById('exclude-ambiguous');
    const noDuplicates = document.getElementById('no-duplicates');
    const noSequential = document.getElementById('no-sequential');
    const noNumbersEnds = document.getElementById('no-numbers-ends');
    const noSpecialEnds = document.getElementById('no-special-ends');
    
    if (extraSpecial) extraSpecial.checked = preset.extraSpecial;
    if (excludeAmbiguous) excludeAmbiguous.checked = preset.excludeAmbiguous;
    if (noDuplicates) noDuplicates.checked = preset.noDuplicates;
    if (noSequential) noSequential.checked = preset.noSequential;
    if (noNumbersEnds) noNumbersEnds.checked = preset.noNumbersEnds;
    if (noSpecialEnds) noSpecialEnds.checked = preset.noSpecialEnds;
    
    adjustMinValuesBasedOnLength(preset.length);
    
    if (presetName === 'quantum') {
        showToast('🔒 Quantum-Safe password generated! (256+ bits entropy)', 'success');
    } else {
        showToast(`Applied ${presetName} preset!`, 'success');
    }
    
    generatePassword();
}

document.addEventListener('DOMContentLoaded', init);