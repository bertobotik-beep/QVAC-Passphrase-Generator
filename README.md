# QVAC Passphrase Generator

Enter a theme word (e.g. "ocean", "coffee") and an on-device AI brainstorms 3-5 memorable multi-word passphrase ideas built around that theme. This is an **idea generator only** — not a password manager, and it makes no security or strength claims. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:31002

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

`src/logic.js` sends the theme word as a one-shot example conversation (a real `user`/`assistant` message pair for "ocean" is included in the `history` sent to `completion()`, not just described in the system prompt) so the small 1B model reliably follows the "ThemeWordThenNumber" style instead of ignoring the instruction. The raw streamed text is split into lines, numbering/quotes are stripped, and each line is kept only if it's a plausible idea (6-40 characters, contains at least 3 letters in a row). If the model returns fewer than 3 usable ideas — or refuses outright — deterministic fallback ideas built from the theme word are used to top up the list, so the app always returns 3-5 ideas.

## Example

- **Theme:** `coffee`
- **Ideas returned:** something like `CoffeeMorning7`, `BoldCoffeeWander42`, `Coffee&Sunrise`, `QuietCoffeeHouse21`, `CoffeeTrailBlaze9` — a mix of the model's own suggestions plus deterministic fallbacks if needed.

## Setup

Requires Node.js and a machine that can run the QVAC on-device runtime (see the QVAC SDK docs for platform support). `npm install` pulls in `@qvac/sdk`; `npm start` downloads/loads the `LLAMA_3_2_1B_INST_Q4_0` model on first run, which can take a moment.

## License

MIT
