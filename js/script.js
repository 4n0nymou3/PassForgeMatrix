const CHARSETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: '!@#$%^&*',
    extraSpecial: '(){}[]<>,.;:'
};

const AMBIGUOUS_CHARS = new Set(['I', 'l', 'O', '0', 'o', '1']);

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
        noSpecialEnds: false,
        minUppercase: 1,
        minNumbers: 1,
        minSpecial: 0
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
        noSpecialEnds: false,
        minUppercase: 2,
        minNumbers: 2,
        minSpecial: 2
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
        noSpecialEnds: false,
        minUppercase: 3,
        minNumbers: 3,
        minSpecial: 3
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
        noSpecialEnds: false,
        minUppercase: 0,
        minNumbers: 1,
        minSpecial: 0
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
        noSpecialEnds: true,
        minUppercase: 2,
        minNumbers: 2,
        minSpecial: 2
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
        noSpecialEnds: false,
        minUppercase: 3,
        minNumbers: 3,
        minSpecial: 3
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
        noSpecialEnds: true,
        minUppercase: 4,
        minNumbers: 4,
        minSpecial: 4
    }
};

function init() {
    initTheme();
    loadFromStorage();
    setupEventListeners();
    updateHistoryDisplay();
    generatePassword();
}

function initTheme() {
    const stored = readStoredValue('pfm_theme');
    setTheme(stored === 'light' ? 'light' : 'dark', false);
}

function setTheme(mode, persist) {
    document.documentElement.classList.toggle('light', mode === 'light');
    if (persist) writeStoredValue('pfm_theme', mode);
}

function toggleTheme() {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light', true);
}

function readStoredValue(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function writeStoredValue(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {}
}

function loadFromStorage() {
    const savedHistory = readStoredValue('passwordHistory');
    if (savedHistory) {
        try {
            passwordHistory = JSON.parse(savedHistory);
        } catch (e) {
            passwordHistory = [];
        }
    }
}

function setupEventListeners() {
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
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
        tab.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.dataset.target;
            const action = this.dataset.action;
            changeMinValue(target, action === 'increase' ? 1 : -1);
        });
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            applyPreset(this.dataset.preset);
        });
    });
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

function setMinValue(id, value) {
    const element = document.getElementById(id);
    element.textContent = value;
    minValues[id.replace('min-', '')] = value;
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

function filterAmbiguous(str, exclude) {
    if (!exclude) return str;
    return str.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('');
}

function buildPools(options) {
    return {
        upper: options.uppercase ? filterAmbiguous(CHARSETS.upper, options.excludeAmbiguous) : '',
        lower: options.lowercase ? filterAmbiguous(CHARSETS.lower, options.excludeAmbiguous) : '',
        numbers: options.numbers ? filterAmbiguous(CHARSETS.numbers, options.excludeAmbiguous) : '',
        special: (options.special ? CHARSETS.special : '') + (options.extraSpecial ? CHARSETS.extraSpecial : '')
    };
}

function validateConstraints(pools, options, length) {
    const fullCharset = pools.upper + pools.lower + pools.numbers + pools.special;

    if (!fullCharset) {
        return 'No character types selected!';
    }

    const totalMinRequired =
        (options.uppercase ? options.minUppercase : 0) +
        (options.numbers ? options.minNumbers : 0) +
        ((options.special || options.extraSpecial) ? options.minSpecial : 0);

    if (totalMinRequired > length) {
        return 'Password length is too short for minimum requirements!';
    }

    if (options.noDuplicates) {
        const uniqueCount = new Set(fullCharset.split('')).size;
        if (length > uniqueCount) {
            return `No Duplicates is on, but only ${uniqueCount} unique characters are available for a length of ${length}!`;
        }
        if (options.uppercase && options.minUppercase > pools.upper.length) {
            return 'Minimum Uppercase exceeds the number of unique uppercase characters available!';
        }
        if (options.numbers && options.minNumbers > pools.numbers.length) {
            return 'Minimum Numbers exceeds the number of unique digits available!';
        }
        if ((options.special || options.extraSpecial) && options.minSpecial > pools.special.length) {
            return 'Minimum Special exceeds the number of unique special characters available!';
        }
    }

    return null;
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

    const pools = buildPools(options);

    const validationError = validateConstraints(pools, options, length);
    if (validationError) {
        showToast(validationError, 'error');
        return;
    }

    const fullCharset = pools.upper + pools.lower + pools.numbers + pools.special;

    let password = '';
    let attempts = 0;
    const maxAttempts = 300;
    let bestAttempt = '';
    let bestScore = -1;

    do {
        password = buildPassword(pools, length, options);
        attempts++;
        const violations = countViolations(password, options);
        if (bestScore === -1 || violations < bestScore) {
            bestScore = violations;
            bestAttempt = password;
        }
    } while (bestScore > 0 && attempts < maxAttempts);

    password = bestAttempt;

    if (bestScore > 0) {
        showToast('Some position/sequence rules could not be fully satisfied for this combination of settings.', 'warning');
    }

    currentPassword = password;
    displayPassword(password);
    updateStrengthIndicator(password, fullCharset.length, length);
    addToHistory(password);
}

function buildPassword(pools, length, options) {
    const forced = [];
    const usedGlobal = new Set();

    function takeForced(poolStr, count) {
        if (count <= 0) return;
        let arr = poolStr.split('');
        if (options.noDuplicates) {
            arr = arr.filter(c => !usedGlobal.has(c));
        }
        for (let i = 0; i < count; i++) {
            if (arr.length === 0) break;
            const idx = getRandomInt(0, arr.length - 1);
            const ch = arr[idx];
            forced.push(ch);
            usedGlobal.add(ch);
            if (options.noDuplicates) arr.splice(idx, 1);
        }
    }

    takeForced(pools.upper, options.uppercase ? options.minUppercase : 0);
    takeForced(pools.numbers, options.numbers ? options.minNumbers : 0);
    takeForced(pools.special, (options.special || options.extraSpecial) ? options.minSpecial : 0);

    const fullCharset = pools.upper + pools.lower + pools.numbers + pools.special;
    let remainingPool = fullCharset.split('');
    if (options.noDuplicates) {
        remainingPool = remainingPool.filter(c => !usedGlobal.has(c));
    }

    const passwordArray = forced.slice();

    while (passwordArray.length < length && remainingPool.length > 0) {
        const idx = getRandomInt(0, remainingPool.length - 1);
        const ch = remainingPool[idx];
        passwordArray.push(ch);
        usedGlobal.add(ch);
        if (options.noDuplicates) {
            remainingPool.splice(idx, 1);
        }
    }

    while (passwordArray.length < length && !options.noDuplicates) {
        const idx = getRandomInt(0, fullCharset.length - 1);
        passwordArray.push(fullCharset[idx]);
    }

    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
}

function charCategory(ch) {
    if (/[A-Z]/.test(ch)) return 'upper';
    if (/[a-z]/.test(ch)) return 'lower';
    if (/[0-9]/.test(ch)) return 'digit';
    return 'other';
}

function isSpecialChar(ch) {
    return CHARSETS.special.includes(ch) || CHARSETS.extraSpecial.includes(ch);
}

function countViolations(password, options) {
    let violations = 0;

    if (options.noSequential) {
        for (let i = 0; i < password.length - 2; i++) {
            const c1 = password[i], c2 = password[i + 1], c3 = password[i + 2];
            const cat1 = charCategory(c1), cat2 = charCategory(c2), cat3 = charCategory(c3);
            if (cat1 === 'other' || cat1 !== cat2 || cat2 !== cat3) continue;
            const code1 = c1.charCodeAt(0), code2 = c2.charCodeAt(0), code3 = c3.charCodeAt(0);
            if ((code2 === code1 + 1 && code3 === code2 + 1) || (code2 === code1 - 1 && code3 === code2 - 1)) {
                violations++;
            }
        }
    }

    if (password.length > 0) {
        const firstChar = password[0];
        const lastChar = password[password.length - 1];

        if (options.noNumbersEnds) {
            if (/[0-9]/.test(firstChar)) violations++;
            if (/[0-9]/.test(lastChar)) violations++;
        }

        if (options.noSpecialEnds) {
            if (isSpecialChar(firstChar)) violations++;
            if (isSpecialChar(lastChar)) violations++;
        }
    }

    if (options.uppercase) {
        const upperCount = (password.match(/[A-Z]/g) || []).length;
        if (upperCount < options.minUppercase) violations += (options.minUppercase - upperCount);
    }

    if (options.numbers) {
        const numberCount = (password.match(/[0-9]/g) || []).length;
        if (numberCount < options.minNumbers) violations += (options.minNumbers - numberCount);
    }

    if (options.special || options.extraSpecial) {
        const specialCount = password.split('').filter(isSpecialChar).length;
        if (specialCount < options.minSpecial) violations += (options.minSpecial - specialCount);
    }

    return violations;
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
            return `<span class="pw-char pw-upper">${char}</span>`;
        } else if (/[a-z]/.test(char)) {
            return `<span class="pw-char pw-lower">${char}</span>`;
        } else if (/[0-9]/.test(char)) {
            return `<span class="pw-char pw-number">${char}</span>`;
        } else if (isSpecialChar(char)) {
            return `<span class="pw-char pw-special">${char}</span>`;
        }
        return `<span class="pw-char">${char}</span>`;
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
    const quantumBits = document.getElementById('quantum-bits');
    const combinations = document.getElementById('combinations');

    let color, text;
    if (score < 20) {
        color = '#f85149';
        text = 'Very Weak';
    } else if (score < 40) {
        color = '#d29922';
        text = 'Weak';
    } else if (score < 60) {
        color = '#e3b341';
        text = 'Moderate';
    } else if (score < 80) {
        color = '#3fb950';
        text = 'Strong';
    } else {
        color = '#238636';
        text = 'Very Strong';
    }

    strengthBar.style.width = `${score}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;

    const crackTimeText = estimateCrackTime(entropy);
    crackTime.textContent = `Crack Time: ${crackTimeText}`;

    entropyValue.textContent = `${Math.round(entropy)} bits`;
    quantumBits.textContent = `${Math.round(entropy / 2)} bits`;

    const totalCombinations = Math.pow(charsetSize, length);
    if (totalCombinations > 1e6) {
        combinations.textContent = totalCombinations.toExponential(2).replace('e+', 'e');
    } else {
        combinations.textContent = Math.round(totalCombinations).toLocaleString();
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
    const hasSpecial = password.split('').some(isSpecialChar);

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

let toastTimer = null;

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toastTimer = null;
    }, 3000);
}

function addToHistory(password) {
    if (!password) return;

    passwordHistory.unshift({
        password: password,
        timestamp: new Date().toISOString()
    });

    passwordHistory = passwordHistory.slice(0, 10);

    writeStoredValue('passwordHistory', JSON.stringify(passwordHistory));
    updateHistoryDisplay();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');

    if (passwordHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No passwords generated yet</p>';
        return;
    }

    historyList.innerHTML = passwordHistory.map((item, index) => `
        <div class="history-item">
            <span class="history-text">${escapeHtml(item.password)}</span>
            <div class="history-actions">
                <button class="icon-btn" data-action="copy" data-index="${index}" title="Copy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="icon-btn" data-action="delete" data-index="${index}" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    historyList.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.dataset.index);
            if (this.dataset.action === 'copy') {
                copyHistoryPassword(index);
            } else if (this.dataset.action === 'delete') {
                deleteHistoryPassword(index);
            }
        });
    });
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
    writeStoredValue('passwordHistory', JSON.stringify(passwordHistory));
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
        writeStoredValue('passwordHistory', JSON.stringify(passwordHistory));
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

    const maxAllowed = Math.floor(preset.length / 3);
    setMinValue('min-uppercase', Math.min(preset.minUppercase, maxAllowed));
    setMinValue('min-numbers', Math.min(preset.minNumbers, maxAllowed));
    setMinValue('min-special', Math.min(preset.minSpecial, maxAllowed));

    updateButtonStates();

    if (presetName === 'quantum') {
        showToast('Quantum-Safe password generated! (~192-bit effective security under Grover\u2019s algorithm)', 'success');
    } else {
        showToast(`Applied ${presetName} preset!`, 'success');
    }

    generatePassword();
}

document.addEventListener('DOMContentLoaded', init);