# Squiggle

Your editor shows you *that* something is wrong. Squiggle tells you *why*, in plain language, right next to your code.

Squiggle is for people learning Python, JavaScript or TypeScript. When a red squiggle stays put, the Squiggle panel explains what the error means, why it probably happened, and how to fix it.

## Features

- **Plain-language explanations:** every error gets a headline, a cause and a fix, often with code you can copy.
- **Waits until you stop typing:** half-typed words never trigger an explanation.
- **Save-aware:** "You saved auth.py 12 seconds before this error appeared" connects an error to the change that caused it.
- **Fix it for me:** one click applies a safe fix for common beginner mistakes, like typos in names and missing colons. Undo works as usual.
- **Runs on your computer:** explanations come from a built-in library, so nothing is sent anywhere.

## Getting started

Open the **Squiggle** tab in the secondary sidebar, then open a Python, JavaScript or TypeScript file. To see sample explanations, run **Squiggle: Play Sample Explanations** from the Command Palette.

## Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `squiggle.patience` | `1500` | How long to wait after you stop typing before explaining an error, in milliseconds. |
| `squiggle.narration` | `33` | How much detail explanations give, from 0 (short and to the point) to 100 (spells everything out). |
| `squiggle.contextLines` | `10` | How many surrounding lines are used to spot misspelled names. 0 uses just the error line. |
