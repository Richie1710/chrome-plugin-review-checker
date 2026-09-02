# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-09-02

### Added

- Localization (German, English, Spanish) with a manual language switcher
  in the options page
- Redesigned options page with a config-panel look, a live
  connection-status indicator, and dark-mode support
- Original teal checkmark-badge icon, replacing the placeholder
- Popup now follows the system's light/dark color scheme

### Fixed

- The popup's refresh button could get stuck on "Loading…" because the
  background service worker wasn't kept alive long enough to finish and
  persist a sync

## [0.1.0] - 2026-09-02

### Added

- First version of the extension: badge showing open reviews, popup with
  a list and direct link to the merge request, options page to configure
  the GitLab base URL
- Background polling every 5 minutes via `chrome.alarms`
- Authentication exclusively via the existing browser session (cookie),
  no Personal Access Token, no OAuth
- Unit tests for the pure logic modules (`lib/formatTime.js`,
  `lib/reviewFilter.js`, `lib/gitlabApi.js`)

[Unreleased]: https://github.com/Richie1710/chrome-plugin-review-checker/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Richie1710/chrome-plugin-review-checker/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Richie1710/chrome-plugin-review-checker/releases/tag/v0.1.0
