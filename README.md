# donate.inu

A Solana launchpad for **charity-coins** — memecoins that stream a slice of every trade, in $BONK, straight to a verified charity wallet.

> Brand new platform. No tokens launched yet. Be the first.

## What it does

- **Launchpad** — Spin up an SPL token with a name, ticker, logo, and supply. No code.
- **Charity fees** — A configurable 1–5% slice of every trade auto-converts to $BONK and streams to a charity wallet locked in at launch.
- **Verified charities** — Only vetted, real-world charity wallets are eligible. Creators pick one at deploy.
- **On-chain, transparent** — Every fee route is public. No black boxes, no off-chain accounting.

## Stack

Pure static site — no build step.

- `index.html` — markup
- `styles.css` — theme tokens, neo-brutalist cards, Fraunces + Sora
- `app.js` — wallet connect modal, launch-token modal with image upload, charity picker, mocked deploy
- `public/logo.png` — brand mark + favicon

## Run it locally

```bash
# any static server works
python -m http.server 8765
# then open http://localhost:8765
```

Or just double-click `index.html`.

## Hooking up real Solana

Two integration points in `app.js`:

1. **`wireWallet()`** — swap the mock for `@solana/wallet-adapter-base` / `@solana/wallet-adapter-react`.
2. **`#launch-form` submit handler** — the `console.log('[donate.inu] launch payload', …)` is the exact shape to feed into a Token-2022 mint with `TransferFeeConfig`, where the withheld-fees authority is the charity wallet.

## Charities

Initial eligible list (all configurable in `CHARITIES` in `app.js`):

- St. Jude Children's Research Hospital
- Water.org
- Team Trees
- Doctors Without Borders
- GiveDirectly
- Rainforest Foundation

Want to add one? Open an issue or PR.

## License

MIT.

---

Not affiliated with the BONK team. $BONK is used as the native fee currency only.
