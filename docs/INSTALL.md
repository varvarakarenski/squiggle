# Installing Squiggle

Squiggle isn't published yet, so for now you run it from source in VS Code's Extension Development Host.

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer
- [VS Code](https://code.visualstudio.com/) 1.85 or newer
- Git

## Setup

```sh
git clone https://github.com/shlok-afk/blank-page-hackathon.git squiggle
cd squiggle
npm install                            # core dev tools
npm install --prefix packages/vscode   # extension
```

The core (`packages/core`) is bundled into the extension at build time and runs inside VS Code. There's no server to start.

## Run it

1. Open the repo folder in VS Code.
2. Press **F5** (or **Run → Start Debugging** and pick **Run Extension**).
   This builds the extension and opens a new VS Code window with Squiggle loaded.
3. In the new window, open the **Squiggle** tab in the secondary sidebar.
4. Open a Python, JavaScript or TypeScript file and make a mistake. The explanation appears once you stop typing.

No errors handy? Open `demo/broken.py` or `demo/broken.ts`, or run **Squiggle: Play Sample Explanations** from the Command Palette.

### Standalone core server (optional)

`npm run dev` runs the core as a WebSocket server on `localhost:4321`, for plugins for other editors. The VS Code extension doesn't use it.

## Packaging

```sh
cd packages/vscode
npx @vscode/vsce package   # makes squiggle-vscode-<version>.vsix
```

## Troubleshooting

- **No explanations show up:** check **Output → Extension Host** in the development window for errors.
- **Extension doesn't load:** rebuild it with `npm run build --prefix packages/vscode` and press F5 again.

## Future plans

Squiggle will be published to the VS Code Marketplace and Open VSX, so installing it will be one click with no cloning or F5.
