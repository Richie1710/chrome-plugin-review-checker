# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [0.1.0] - 2026-09-02

### Added

- Erste Version der Extension: Badge-Anzeige offener Reviews, Popup mit
  Liste und Direktlink zum Merge Request, Options-Seite zur Konfiguration
  der GitLab-Basis-URL
- Hintergrund-Polling alle 5 Minuten über `chrome.alarms`
- Auth ausschließlich über die bestehende Browser-Session (Cookie), kein
  Personal Access Token, kein OAuth
- Unit-Tests für die reinen Logik-Module (`lib/formatTime.js`,
  `lib/reviewFilter.js`, `lib/gitlabApi.js`)

[Unreleased]: https://github.com/Richie1710/chrome-plugin-review-checker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Richie1710/chrome-plugin-review-checker/releases/tag/v0.1.0
