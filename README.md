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

## License

MIT
