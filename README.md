# PassForgeMatrix Pro

PassForgeMatrix Pro is a fully client-side, advanced password generator focused on strict, verifiable rule enforcement rather than best-effort randomness — every option you enable is either guaranteed in the output or you get a clear warning explaining why it couldn't be.

## Features

### Character Options
- Adjustable length: 8–128 characters
- Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), special (`!@#$%^&*`), extra special (`(){}[]<>,.;:`)
- **Exclude Ambiguous Characters** — removes `I`, `l`, `O`, `0`, `o`, `1` (the standard look-alike set used by major password managers) from the entire character pool, including the guaranteed-minimum characters, not just the random fill
- **No Duplicates** — a true hard guarantee: no character is ever reused. If the requested length or minimum requirements exceed the number of unique characters available under your current settings, generation stops and shows a clear error instead of silently breaking the guarantee
- **No Sequential** — blocks 3-in-a-row ascending or descending runs within the same character type (e.g. `abc`, `321`, `XYZ`), without falsely flagging runs that cross character types
- **Position Rules** — optionally forbid numbers and/or special characters from being the first or last character
- **Minimum Requirements** — set exact minimum counts for uppercase letters, numbers, and special characters

### Analysis
- Real-time strength meter and estimated crack time
- Entropy in bits, plus a Grover-adjusted **Quantum-Safe** bit count (raw entropy ÷ 2) shown for every password, reflecting the actual quadratic speedup a quantum computer gets against brute-force search
- Total combinations shown in scientific notation

### Presets
Six one-tap presets — Memorable, Strong, Maximum, PIN Code, WiFi Key, and Database — each with its own length, character types, and minimum requirements, so the result is deterministic regardless of prior settings.

A dedicated **Post-Quantum preset** generates a 64-character password (~384 bits of raw entropy). After accounting for Grover's algorithm, this yields ~192 bits of quantum-resistant strength — beyond NIST's highest post-quantum security category (Category 5, ~128-bit quantum-equivalent, the AES-256 benchmark).

### History
The last 10 generated passwords are kept locally, with per-item copy and delete.

### Privacy & Offline Use
Everything runs entirely in your browser. No password, setting, or history data ever leaves your device, and the app makes no external network requests — fonts and all assets are bundled locally.

### Interface
Dark/light theme toggle, with the interface organized into Basic, Advanced, Presets, and History tabs.

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/4n0nymou3/PassForgeMatrix.git
   ```
2. Open the `index.html` file in your browser.

## Usage
- Configure character types and length in the **Basic** tab.
- Fine-tune ambiguous-character exclusion, duplicates, sequential runs, position rules, and minimum requirements in the **Advanced** tab.
- Use the **Presets** tab for one-tap configurations, including the Post-Quantum preset.
- Review or reuse previous passwords in the **History** tab.
- Click **Generate** to create a password, and **Copy** to copy it to your clipboard.

## Live Demo
Access the live web version of the project here: [PassForgeMatrix](https://4n0nymou3.github.io/PassForgeMatrix)

## License
This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for details.