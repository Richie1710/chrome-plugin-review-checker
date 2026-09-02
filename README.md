# GitLab Review Checker

Chrome extension that checks a self-hosted GitLab instance for merge
requests waiting on your review, lists them in a popup, and takes you
straight to the merge request with one click.

## Features

- Works against self-hosted GitLab; base URL is freely configurable
- Authenticates via your existing browser session (cookie) — no Personal
  Access Token, no OAuth
- Badge count on the extension icon, refreshed automatically every 5
  minutes
- Popup lists open reviews (title, project, author, age); clicking one
  opens the merge request in a new tab
- "Open review" = the merge request is open, you're listed as a
  reviewer, and you haven't approved yet
- Localized in German, English, and Spanish, with a manual language
  switcher in the options page
- Adapts to your system's light/dark color scheme

## Installation

1. Clone this repository or download it as a ZIP
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this project folder

## Configuration

1. Right-click the extension icon → "Options" (or via `chrome://extensions`
   → Details → "Extension options")
2. Enter your GitLab instance's base URL (e.g. `https://gitlab.company.com`)
3. Save and grant the requested permission for that domain

The extension automatically detects your GitLab username via the existing
session and starts polling from there.

## Privacy

Everything stays local. The extension talks only to the GitLab base URL
you configure — no other server, no analytics, no telemetry. Your GitLab
username and the list of open reviews are cached in the browser's local
extension storage (`chrome.storage.local`) purely to render the popup and
badge; nothing is sent anywhere else. Authentication reuses your existing
browser session cookie for that GitLab instance — the extension never
sees or stores a password or access token.

## Development

No build step needed — plain vanilla JS (ES modules), no runtime
dependencies.

```bash
npm test
```

runs the unit tests for the pure logic modules (`lib/formatTime.js`,
`lib/reviewFilter.js`, `lib/gitlabApi.js`, `lib/i18n.js`) via Node's
built-in test runner. `background.js`, `options.js`, and `popup.js` are
Chrome API glue code without automated tests — verification happens
manually in the unpacked state against a real GitLab instance.

## Release

See [CHANGELOG.md](CHANGELOG.md) for the version history. A new release
is triggered by pushing a Git tag — see the
[release workflow](.github/workflows/release.yml) for details.

## License

[MIT](LICENSE)
