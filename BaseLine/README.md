# Baseline Browser Compatibility Checker

The **Baseline Browser Compatibility Checker** is a Visual Studio Code extension that helps developers ensure their HTML, CSS, and JavaScript code adheres to the [MDN Baseline compatibility standards](https://developer.mozilla.org/en-US/docs/MDN/Browser_compatibility/MDN_baseline).

## Features

- **Hover Information**: Hover over features in your code to see their baseline compatibility status, supported browsers, and recommendations for non-baseline features.
- **Diagnostics**: Get warnings in the Problems panel for non-baseline features in your code.
- **Quick Commands**:
  - `Baseline: Check Current File`: Analyze the current file for baseline compatibility.
  - `Baseline: Show Quick Reference`: View a summary of baseline and non-baseline features.
- **Status Bar Integration**: Quickly access the baseline checker from the status bar.

## How It Works

1. **Feature Detection**: The extension scans your code for specific HTML, CSS, and JavaScript features.
2. **Baseline Check**: Each detected feature is checked against the MDN Baseline compatibility database.
3. **Feedback**:
   - Baseline features are marked as ✅.
   - Non-baseline features are marked as ⚠️ with recommendations for alternatives or fallbacks.

## Getting Started

1. Install the extension in Visual Studio Code.
2. Open an HTML, CSS, or JavaScript file.
3. Use the following commands:
   - **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type `Baseline`.
   - **Context Menu**: Right-click in the editor and select `Baseline: Check Current File`.
4. Hover over features in your code to see detailed compatibility information.

5.Use npm install to install dependencies


## Commands

| Command                          | Description                                      |
|----------------------------------|--------------------------------------------------|
| `Baseline: Check Current File`   | Analyze the current file for compatibility issues. |
| `Baseline: Show Quick Reference` | View a summary of baseline and non-baseline features. |

## Extension Settings

This extension contributes the following settings:

- `baselineChecker.enableAutoCheck`: Automatically check files as you type (default: `true`).
- `baselineChecker.showWarnings`: Show warnings for non-baseline features (default: `true`).

## Example

### Hover Information

Hover over a feature like `display: grid` in your CSS file:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
