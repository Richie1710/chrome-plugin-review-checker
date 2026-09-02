# GitLab Review Checker

Chrome-Extension, die gegen eine self-hosted GitLab-Instanz prüft, ob offene
Merge Requests auf deine Review warten, sie in einem Popup auflistet und dich
per Klick direkt zum jeweiligen Merge Request bringt.

## Features

- Läuft gegen self-hosted GitLab, Basis-URL frei konfigurierbar
- Auth über die bestehende Browser-Session (Cookie) — kein Personal Access
  Token, kein OAuth
- Badge-Zahl am Extension-Icon, automatisch aktualisiert alle 5 Minuten
- Popup listet offene Reviews (Titel, Projekt, Autor, Alter); Klick öffnet
  den Merge Request direkt in einem neuen Tab
- "Offene Review" = Merge Request ist offen, du bist als Reviewer
  eingetragen und hast noch nicht approved

## Installation

1. Dieses Repository klonen oder als ZIP herunterladen
2. In Chrome `chrome://extensions` öffnen
3. Oben rechts "Entwicklermodus" aktivieren
4. "Entpackt laden" klicken und diesen Projektordner auswählen

## Konfiguration

1. Rechtsklick auf das Extension-Icon → "Optionen" (oder über
   `chrome://extensions` → Details → "Erweiterungsoptionen")
2. Basis-URL deiner GitLab-Instanz eintragen (z. B. `https://gitlab.firma.de`)
3. Speichern und die angefragte Berechtigung für diese Domain erteilen

Die Extension ermittelt deinen GitLab-Benutzernamen automatisch über die
bestehende Session und beginnt danach mit dem Polling.

## Entwicklung

Kein Build-Schritt nötig — reines Vanilla JS (ES-Module), keine
Laufzeit-Abhängigkeiten.

```bash
npm test
```

führt die Unit-Tests der reinen Logik-Module (`lib/formatTime.js`,
`lib/reviewFilter.js`, `lib/gitlabApi.js`) über Node's eingebauten
Test-Runner aus. `background.js`, `options.js` und `popup.js` sind
Chrome-API-Glue-Code ohne automatisierte Tests — Verifikation erfolgt
manuell im entpackten Zustand gegen eine echte GitLab-Instanz.

## Architektur

Details zu Design-Entscheidungen und der Aufteilung in Module siehe
[docs/superpowers/specs](docs/superpowers/specs) (falls lokal vorhanden —
dieser Ordner wird nicht versioniert).

## Release

Siehe [CHANGELOG.md](CHANGELOG.md) für die Versionshistorie. Ein neues
Release wird über einen Git-Tag ausgelöst — Details im
[Release-Workflow](.github/workflows/release.yml).

## Lizenz

Privates Projekt, keine Lizenz vergeben.
