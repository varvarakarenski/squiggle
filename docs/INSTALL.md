# Installing Squiggle

Squiggle can be found on Visual Studio Code Marketplace! Find us at https://marketplace.visualstudio.com/items?itemName=varvarakarenski.squiggle-vscode 

## Requirements

- [VS Code](https://code.visualstudio.com/) 1.106 or newer
- If you're planning on using Squiggle with Python, ensure you have Microsoft's Python extension installed.

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

## Troubleshooting

- **No Python explanations:** install the Python extension.
- **Panel not showing:** make sure you have the *secondary sidebar* open.
- **Explanation takes a minute:** Squiggle waits until you stop typing. You can change the wait time with the squiggle.patience setting.
