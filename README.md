# Telegram Chat

Minimal web chat for sending and receiving Telegram text messages via [GREEN-API](https://green-api.com/telegram/).

**Demo:** https://green-api-test-gamma.vercel.app/

## Requirements

- A GREEN-API Telegram instance in the `authorized` state
- Its `idInstance` and `apiTokenInstance` from the [GREEN-API console](https://console.green-api.com)

## Usage

1. Sign in with `idInstance` and `apiTokenInstance`.
2. Press **+**, enter the recipient's phone number and press **Find in Telegram**.
3. Type a message and press **Enter** to send it (**Shift+Enter** adds a new line).
4. The recipient's reply appears in the chat.

## Getting Started

### Node.js version

This project uses Node.js **24.18.0** (pinned in `.nvmrc` and `engines` in `package.json`). Switch to it with [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install   # installs the version from .nvmrc if missing
nvm use       # switches to the version from .nvmrc
```

Then install dependencies:

```bash
npm install
```

### Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build && npm start` | Build and run the production server |
| `npm run lint` | Lint and check formatting with Biome |
| `npm run typecheck` | Type-check with TypeScript |

## Limitations

- Text messages only.
- Chats are kept in memory and are lost on page reload.
- Only replies from numbers you started a chat with in the app are shown.

## Credits

- Chat background: "I Like Food" pattern from [Hero Patterns](https://heropatterns.com) by Steve Schoger, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Color and opacity changed.
- Icons: [Lucide](https://lucide.dev) (ISC).
