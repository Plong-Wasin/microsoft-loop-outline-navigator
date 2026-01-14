# 📑 Microsoft Loop Outline Navigator

A userscript that adds a document outline/table of contents feature to Microsoft Loop, making it easy to navigate through long documents.

## ✨ Features

- 📄 **Heading Detection** - Automatically detects Heading 1-4 in your Loop documents
- 📁 **Toggle Support** - Recognizes collapsible/toggle sections with expand/collapse status
- 🎯 **Click to Navigate** - Click any item to smoothly scroll to that section
- 🔍 **Active Tracking** - Highlights current section as you scroll
- ⌨️ **Keyboard Shortcut** - Quick toggle with `Ctrl+Shift+O`
- 🎨 **Native Integration** - Button integrates into Loop's top toolbar
- 🌙 **Dark Theme** - Matches Loop's dark interface

## 📸 Screenshot

```
┌─────────────────────────────────┐
│ 📑 Outline                    3 │
├─────────────────────────────────┤
│ 📄 Introduction            [H1] │
│   📁 Getting Started       [H2] │
│   📄 Installation          [H2] │
│     📂 Configuration       [H3] │
├─────────────────────────────────┤
│ 📄 Heading  📁 Toggle           │
└─────────────────────────────────┘
```

## 🚀 Installation

### Prerequisites

Install one of these userscript managers:
- [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### Install Script

1. Click on your userscript manager icon
2. Create a new script
3. Copy and paste the contents of `loop-outline.user.js`
4. Save the script

## 📖 Usage

1. Open any Microsoft Loop document
2. Look for the 📑 button in the top header toolbar
3. Click to open the outline panel
4. Click any heading to navigate to it

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+O` | Toggle outline panel |
| `Esc` | Close outline panel |

### Icons Guide

| Icon | Meaning |
|------|---------|
| 📄 | Regular heading |
| 📁 | Toggle section (collapsed) |
| 📂 | Toggle section (expanded) |

## 🌐 Supported Domains

- `https://loop.cloud.microsoft/*`
- `https://loop.microsoft.com/*`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
