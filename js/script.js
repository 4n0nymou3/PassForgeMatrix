let currentFontSize = 1;
function changeFontSize(delta)
{
	currentFontSize = Math.max(0.8, Math.min(1.5, currentFontSize + delta));
	document.querySelector('.password-display').style.setProperty('--password-font-size', `${currentFontSize}em`);
}
function toggleTheme()
{
	const body = document.body;
	const currentTheme = body.getAttribute('data-theme') || 'dark';
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	body.setAttribute('data-theme', newTheme);
	localStorage.setItem('theme', newTheme);
}
function calculatePasswordStrength(password)
{
	let score = 0;
	const length = password.length;
	if (length < 8) score += 5;
	else if (length < 10) score += 15;
	else if (length < 12) score += 25;
	else if (length < 14) score += 35;
	else if (length < 16) score += 45;
	else if (length < 20) score += 55;
	else score += 65;
	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasNumber = /\d/.test(password);
	const hasSpecial = /[!@#$%^&*]/.test(password);
	const hasExtraSpecial = /[(){}[\]<>,.;:]/.test(password);
	if (hasUpper) score += 8;
	if (hasLower) score += 8;
	if (hasNumber) score += 8;
	if (hasSpecial) score += 8;
	if (hasExtraSpecial) score += 8;
	const complexityCount = [hasUpper, hasLower, hasNumber, hasSpecial, hasExtraSpecial].filter(Boolean).length;
	score += complexityCount * 4;
	const uniqueChars = new Set(password).size;
	const uniqueRatio = uniqueChars / length;
	score += Math.min(uniqueRatio * 15, 15);
	if (/(.)\1{2,}/.test(password)) score -= 15;
	if (/^[a-zA-Z]+$/.test(password)) score -= 20;
	if (/^\d+$/.test(password)) score -= 25;
	if (/^[a-z]+$/.test(password)) score -= 25;
	if (/^[A-Z]+$/.test(password)) score -= 25;
	if (/^[!@#$%^&*(){}[\]<>,.;:]+$/.test(password)) score -= 25;
	const finalScore = Math.max(0, Math.min(100, score));
	let text, color;
	if (finalScore < 20)
	{
		text = 'Very Weak';
		color = '#ff0000';
	}
	else if (finalScore < 40)
	{
		text = 'Weak';
		color = '#ff4500';
	}
	else if (finalScore < 60)
	{
		text = 'Moderate';
		color = '#ffa500';
	}
	else if (finalScore < 80)
	{
		text = 'Strong';
		color = '#9acd32';
	}
	else
	{
		text = 'Very Strong';
		color = '#008000';
	}
	return {score: finalScore, text, color};
}
function estimateCrackTime(password)
{
	const guessesPerSecond = 1000000000000;
	let possibleChars = 0;
	if (/[a-z]/.test(password)) possibleChars += 26;
	if (/[A-Z]/.test(password)) possibleChars += 26;
	if (/\d/.test(password)) possibleChars += 10;
	if (/[!@#$%^&*(){}[\]<>,.;:]/.test(password)) possibleChars += 30;
	const combinations = Math.pow(Math.max(possibleChars, 26), password.length);
	const seconds = combinations / guessesPerSecond;
	if (seconds < 1) return 'Instantly';
	if (seconds < 60) return 'Seconds';
	if (seconds < 3600) return 'Minutes';
	if (seconds < 86400) return 'Hours';
	if (seconds < 2592000) return 'Days';
	if (seconds < 31536000) return 'Months';
	if (seconds < 315360000) return 'Years';
	return 'Decades';
}
function updatePasswordDisplay()
{
	const passwordDisplay = document.getElementById('password-display');
	const lengthSlider = document.getElementById('password-length');
	const lengthLabel = document.getElementById('password-length-label');
	const options = {
		length: parseInt(lengthSlider.value, 10),
		upper: document.getElementById('upper').checked,
		lower: document.getElementById('lower').checked,
		number: document.getElementById('number').checked,
		special: document.getElementById('special').checked,
		extraSpecial: document.getElementById('extra-special').checked,
		ambiguous: document.getElementById('ambiguous').checked,
		minUpper: parseInt(document.getElementById('min-upper').value, 10),
		minNumbers: parseInt(document.getElementById('min-numbers').value, 10),
		minSpecial: parseInt(document.getElementById('min-special').value, 10),
		noSpecialEnds: document.getElementById('no-special-ends').checked,
		noNumberEnds: document.getElementById('no-number-ends').checked,
		avoidDuplicates: document.getElementById('avoid-duplicates').checked
	};
	lengthLabel.textContent = options.length;
	const newPassword = generatePassword(options);
	passwordDisplay.classList.add('generating');
	setTimeout(() => passwordDisplay.classList.remove('generating'), 300);
	const strengthResult = calculatePasswordStrength(newPassword);
	const strengthBar = document.getElementById('strength-bar');
	const strengthText = document.getElementById('strength-text');
	const crackTime = document.getElementById('crack-time');
	strengthBar.style.width = `${strengthResult.score}%`;
	strengthBar.style.backgroundColor = strengthResult.color;
	strengthText.textContent = strengthResult.text;
	crackTime.textContent = `Crack time: ${estimateCrackTime(newPassword)}`;
	passwordDisplay.innerHTML = Array.from(newPassword).map(char => {
		if (/\d/.test(char)) return `<span style="color:red">${char}</span>`;
		if (/[!@#$%^&*(){}[\]<>,.;:]/.test(char)) return `<span style="color:#007acc">${char}</span>`;
		return `<span style="color:inherit">${char}</span>`;
	}).join('');
}
function generatePassword(options)
{
	const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
	const numberChars = '0123456789';
	const specialChars = '!@#$%^&*';
	const extraSpecialChars = '(){}[]<>,.;:';
	const ambiguousChars = 'Il1O0';
	let chars = '';
	if (options.upper) chars += upperChars;
	if (options.lower) chars += lowerChars;
	if (options.number) chars += numberChars;
	if (options.special) chars += specialChars;
	if (options.extraSpecial) chars += extraSpecialChars;
	if (options.ambiguous)
	{
		chars = chars.replace(new RegExp(`[${ambiguousChars}]`, 'g'), '');
	}
	if (!chars)
	{
		chars = upperChars + lowerChars;
	}
	let password;
	let attempts = 0;
	const maxAttempts = 100;
	function isValidPassword(pwd)
	{
		const isSpecialStart = /^[!@#$%^&*(){}[\]<>,.;:]/.test(pwd);
		const isSpecialEnd = /[!@#$%^&*(){}[\]<>,.;:]$/.test(pwd);
		const isNumberStart = /^\d/.test(pwd);
		const isNumberEnd = /\d$/.test(pwd);
		if (options.noSpecialEnds && (isSpecialStart || isSpecialEnd)) return false;
		if (options.noNumberEnds && (isNumberStart || isNumberEnd)) return false;
		const upperCount = (pwd.match(/[A-Z]/g) || []).length;
		const numberCount = (pwd.match(/[0-9]/g) || []).length;
		const specialCount = (pwd.match(/[!@#$%^&*(){}[\]<>,.;:]/g) || []).length;
		if (options.upper && upperCount < options.minUpper) return false;
		if (options.number && numberCount < options.minNumbers) return false;
		if ((options.special || options.extraSpecial) && specialCount < options.minSpecial) return false;
		return true;
	}
	do {
		let availableChars = [...chars];
		let passwordChars = [];
		if (options.upper)
		{
			for (let i = 0; i < options.minUpper; i++)
			{
				const char = upperChars[Math.floor(Math.random() * upperChars.length)];
				passwordChars.push(char);
				if (options.avoidDuplicates)
				{
					availableChars = availableChars.filter(c => c !== char);
				}
			}
		}
		if (options.number)
		{
			for (let i = 0; i < options.minNumbers; i++)
			{
				const char = numberChars[Math.floor(Math.random() * numberChars.length)];
				passwordChars.push(char);
				if (options.avoidDuplicates)
				{
					availableChars = availableChars.filter(c => c !== char);
				}
			}
		}
		if (options.special || options.extraSpecial)
		{
			const allSpecial = (options.special ? specialChars : '') + (options.extraSpecial ? extraSpecialChars : '');
			for (let i = 0; i < options.minSpecial; i++)
			{
				const char = allSpecial[Math.floor(Math.random() * allSpecial.length)];
				passwordChars.push(char);
				if (options.avoidDuplicates)
				{
					availableChars = availableChars.filter(c => c !== char);
				}
			}
		}
		while (passwordChars.length < options.length && availableChars.length > 0)
		{
			const randomIndex = Math.floor(Math.random() * availableChars.length);
			const char = availableChars[randomIndex];
			passwordChars.push(char);
			if (options.avoidDuplicates)
			{
				availableChars.splice(randomIndex, 1);
			}
		}
		while (passwordChars.length < options.length)
		{
			const randomIndex = Math.floor(Math.random() * chars.length);
			passwordChars.push(chars[randomIndex]);
		}
		for (let i = passwordChars.length - 1; i > 0; i--)
		{
			const j = Math.floor(Math.random() * (i + 1));
			[passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
		}
		password = passwordChars.join('');
		attempts++;
	} while (!isValidPassword(password) && attempts < maxAttempts);
	return password;
}
function copyToClipboard()
{
	const passwordDisplay = document.getElementById('password-display');
	const password = passwordDisplay.textContent;
	navigator.clipboard.writeText(password).then(() => {
		const copySuccess = document.getElementById('copy-success');
		copySuccess.textContent = 'Password copied to clipboard!';
		copySuccess.classList.add('show');
		setTimeout(() => copySuccess.classList.remove('show'), 2000);
	});
}
document.addEventListener('DOMContentLoaded', () => {
	const savedTheme = localStorage.getItem('theme') || 'dark';
	document.body.setAttribute('data-theme', savedTheme);
	const lengthSlider = document.getElementById('password-length');
	const lengthLabel = document.getElementById('password-length-label');
	lengthSlider.addEventListener('input', () => {
		lengthLabel.textContent = lengthSlider.value;
	});
	const elements = [
		'password-length', 'upper', 'lower', 'number',
		'special', 'extra-special', 'ambiguous', 'min-upper',
		'min-numbers', 'min-special', 'no-special-ends', 'no-number-ends', 'avoid-duplicates'
	];
	elements.forEach(id => {
		const element = document.getElementById(id);
		if (element)
		{
			element.addEventListener('change', updatePasswordDisplay);
		}
	});
	const tooltips = {
		'upper': 'Include uppercase letters (A-Z)',
		'lower': 'Include lowercase letters (a-z)',
		'number': 'Include numbers (0-9)',
		'special': 'Include special characters (!@#$%^&*)',
		'extra-special': 'Include extra special characters ((){}[]<>,.;:)',
		'ambiguous': 'Exclude similar-looking characters (Il1O0)',
		'min-upper': 'Minimum number of uppercase letters',
		'min-numbers': 'Minimum number of numbers',
		'min-special': 'Minimum number of special characters',
		'no-special-ends': 'Avoid special characters at start and end of password',
		'no-number-ends': 'Avoid numbers at start and end of password',
		'avoid-duplicates': 'Try to avoid duplicate characters when possible'
	};
	for (const [id, content] of Object.entries(tooltips))
	{
		const element = document.getElementById(id);
		if (element)
		{
			tippy(element.closest('.option'), {
				content,
				placement: 'right'
			});
		}
	}
	updatePasswordDisplay();
});
document.getElementById('upper').addEventListener('change', function(e)
{
	const lowerCheckbox = document.getElementById('lower');
	if (!e.target.checked && !lowerCheckbox.checked)
	{
		e.target.checked = true;
		alert('At least one of A-Z or a-z must be enabled!');
	}
});
document.getElementById('lower').addEventListener('change', function(e)
{
	const upperCheckbox = document.getElementById('upper');
	if (!e.target.checked && !upperCheckbox.checked)
	{
		e.target.checked = true;
		alert('At least one of A-Z or a-z must be enabled!');
	}
});
document.getElementById('password-length').addEventListener('input', function()
{
	const maxAllowed = Math.floor(this.value / 4);
	['min-upper', 'min-numbers', 'min-special'].forEach(id => {
		const input = document.getElementById(id);
		if (parseInt(input.value) > maxAllowed)
		{
			input.value = maxAllowed;
		}
	});
});
document.getElementById('number').addEventListener('change', function(e)
{
	const noNumberEndsCheckbox = document.getElementById('no-number-ends');
	if (e.target.checked)
	{
		noNumberEndsCheckbox.disabled = false;
	}
	else
	{
		noNumberEndsCheckbox.disabled = true;
		noNumberEndsCheckbox.checked = false;
	}
});
function updateNoSpecialEndsState()
{
	const specialCheckbox = document.getElementById('special');
	const extraSpecialCheckbox = document.getElementById('extra-special');
	const noSpecialEndsCheckbox = document.getElementById('no-special-ends');
	if (!specialCheckbox.checked && !extraSpecialCheckbox.checked)
	{
		noSpecialEndsCheckbox.disabled = true;
		noSpecialEndsCheckbox.checked = false;
	}
	else
	{
		noSpecialEndsCheckbox.disabled = false;
	}
}
document.getElementById('special').addEventListener('change', updateNoSpecialEndsState);
document.getElementById('extra-special').addEventListener('change', updateNoSpecialEndsState);
document.addEventListener('DOMContentLoaded', function()
{
	updateNoSpecialEndsState();
});
function changeMinValue(id, delta)
{
	const input = document.getElementById(id);
	const currentValue = parseInt(input.value);
	const passwordLength = parseInt(document.getElementById('password-length').value);
	const maxAllowed = Math.floor(passwordLength / 4);
	const newValue = currentValue + delta;
	if (newValue >= 1 && newValue <= maxAllowed)
	{
		input.value = newValue;
		updatePasswordDisplay();
	}
}