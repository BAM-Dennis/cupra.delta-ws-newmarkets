# Umsetzungsplan: Workshop 3 „New Market Segment“ (Team-Kartenspiel)

**Projekt:** CUPRA Global Launch Training, Workshop 3
**Grundlage:** [Konzept und Aufwandsschätzung von SAPERED](SAPERED_Workshop-App_Konzept_Aufwandsschaetzung_WS3_NewMarketSegment.md) und [Seed-Content](SAPERED_Workshop-App_SeedContent_WS3_NewMarketSegment.md), Stand 14.09.2026
**Design-Referenz:** CUPRA Streak Challenge (`cupra.streak-challenge`), Figma-Design CUPRA-GLT-27
**Stand dieses Plans:** 14.09.2026, Phase 0 (Prototyp) umgesetzt

---

## 1. Ziel und Vorgehen

Das Konzept beschreibt ein rein digitales Teamspiel: Gruppen halten ein Deck aus Argumentkarten, überzeugen per Konsens-Spielzug Personas und treten gegeneinander an. Der Hauptaufwand liegt laut Konzept im geteilten Gruppenzustand in Echtzeit, nicht in KI.

Vorgehen in vier Phasen:

| Phase | Ergebnis | Status |
|---|---|---|
| 0 | Schneller, spielbarer Prototyp auf dem Stack der Streak Challenge | erledigt |
| 1 | Pilotfähige Version für einen ersten Workshop (Robustheit, Trainer-Eingriffe, Deploy, echter Content) | offen |
| 2 | Echtzeit-Upgrade, Feinkonzept-Parameter, optionale KI-Persona-Reaktion | offen |
| 3 | Integration in die Plattform von Competitor I und II, Design-Finalisierung, Rollout | offen |

Der Prototyp ist bewusst so gebaut, dass Phase 1 bis 3 darauf aufsetzen und nichts weggeworfen werden muss: Spiellogik als reiner Reducer, Server als einzige Wahrheit, Transportschicht austauschbar.

---

## 2. Phase 0: Prototyp (umgesetzt)

### Was funktioniert

- **Trainer:** Session mit n Teams anlegen (Default 4, 1 bis 12), QR-Code pro Team, Start-Button, Live-Übersicht aller Teams (Phase, Runde, Persona, Punkte, Karten, Anwesenheit), Team- und Einzel-Leaderboard, QR-Codes jederzeit wieder einblendbar.
- **Teilnehmer:** Beitritt per QR oder Code, persistente User-ID im Browser, Lobby, eigene Karten sichten und bestätigen, Persona-Wahl (leicht/schwer mit sichtbarem Punktwert), Dialog mit Need, Karte, Reaktion, Trefferanzeige, Persona-Ergebnis, Spielende mit beiden Leaderboards.
- **Konsens-Spielzug:** Ein Mitglied schlägt vor (Persona oder Karte), alle anderen anwesenden Mitglieder bestätigen oder lehnen ab, der Vorschlagende kann zurückziehen. In Ein-Personen-Teams wird sofort ausgeführt.
- **Regeln aus dem Konzept:** feste Deckgröße je Team, gleiches Deck für alle Teams, gleichmäßige verdeckte Verteilung, nur eigene Karten sichtbar und spielbar, jede Karte nur einmal, Spielende bei leerem Deck, leere Teams werden beim Start entfernt, dieselben Persona-Paare für alle Teams, deterministisches Matching gegen die Karte-Need-Zuordnung, geskriptete Reaktionen (generisch je Persona plus spezifische je Need-Karte-Paar), Gruppenpunkte nach Schwierigkeit, Einzelpunkte als Anteil plus Beitrags-Bonus.
- **Qualität:** 14 Engine-Tests (Verteilung, Konsens, Einmal-Spielen, Spielende, Wertung, Content-Abdeckung), API-Durchlauf mit zwei Teilnehmern Ende-zu-Ende geprüft, Production-Build grün.

### Architekturentscheidungen

| Thema | Entscheidung | Begründung |
|---|---|---|
| Stack | Next.js 16, React 19, Tailwind v4, Postgres via `pg`, Vercel | identisch zur Streak Challenge, Design-System 1:1 übernommen |
| Spiellogik | reiner Reducer in `src/engine/game.ts`, Zeit und Zufall injiziert | testbar ohne DB, deterministisch, später auch für Replays nutzbar |
| Wahrheit | server-authoritative: nur der Server führt den Reducer aus, Gruppe wird pro Aktion gesperrt (`select … for update`) | gleichzeitige Bestätigungen mehrerer Devices bleiben konsistent |
| Zustand | JSONB in `groups.state` mit Versionszähler | ein Dokument pro Team, keine Join-Kaskaden, einfache Snapshots |
| Transport | HTTP-Polling alle 1,5 s mit `?since=<version>`; Poll ist zugleich Lebenszeichen | funktioniert auf Vercel ohne Zusatzdienst; Snapshot-Format bleibt bei SSE oder Supabase Realtime gleich |
| Anwesenheit | Mitglied zählt zum Konsens, wenn Lebenszeichen jünger als 45 s | ein gesperrtes Handy blockiert das Team nicht |
| Identität | UUID im localStorage, Nickname je Team, kein Login | wie Streak Challenge; wird in Phase 3 durch die Plattform-Identität ersetzt |
| Trainer-Rechte | Token bei Session-Erstellung, im Browser gespeichert | reicht für Pilot; Plattform-Rolle in Phase 3 |
| Inhalt | Seed-Content von SAPERED in `src/data/content.ts`: 12 Delta-verankerte Karten, Runden 1 und 2, explizite Karte-Need-Zuordnung mit Treffer-Stärke | Balance-Regel „volle Abdeckung“ per Test prüfbar |
| Runden 3 und 4 | Platzhalter-Personas (werteorientiert, Lifestyle/Outdoor) nach den Typen aus dem Seed, im Code als `placeholder` markiert | Deck bleibt spielbar und voll abgedeckt; Inhalte werden mit CUPRA ausdefiniert |
| Treffer | abgestuft: voll, Teil, kein Treffer; Stärke steht in der CardNeedMap | bestätigter Änderungsposten aus dem Seed-Content |

### Datenmodell (umgesetzt)

```
sessions  id, trainer_token, status (lobby|running), group_count, rounds jsonb, config jsonb
groups    id, session_id, idx, name, code (QR), state jsonb, version
members   group_id, user_id, nickname, joined_at, last_seen_at
```

`groups.state` enthält Phase, Hände (Karte, Halter, offen/gespielt), Züge, Persona-Ergebnisse, Teampunkte, Einzelpunkte je User. Das entspricht den Entitäten Group, GroupMembership, ArgumentCard, Move und Round aus Abschnitt 11 des Konzepts; CardNeedMap und Persona liegen im Inhaltspaket.

### API (umgesetzt)

| Route | Zweck |
|---|---|
| `POST /api/sessions` | Session mit n Teams anlegen, liefert Trainer-Token |
| `GET /api/sessions/{id}` | Trainer-Übersicht und Leaderboards |
| `POST /api/sessions/{id}/start` | leere Teams entfernen, Decks verteilen (Header `x-trainer-token`) |
| `GET /api/groups/{code}?userId&since` | Gruppen-Snapshot oder „unverändert“, setzt Lebenszeichen |
| `POST /api/groups/{code}/join` | Beitritt mit User-ID und Nickname |
| `POST /api/groups/{code}/actions` | Spielaktion durch den Reducer |

### Im Prototyp gesetzte Annahmen (im Konzept „tbd“)

Alle Werte in `src/engine/config.ts`, ohne Codeänderung anpassbar:

| Parameter | Prototyp | Konzept |
|---|---|---|
| Deckgröße | 12 | tbd |
| Needs (Argumente) pro Persona | 3 | tbd, 3 bis 5 |
| Runden | 4 (Deck 12 / 3 Needs) | mehrere |
| Persona überzeugt ab | 2 von 3 Treffern (voll oder Teil zählt) | tbd, 1 von 3 reicht nicht |
| Punkte pro Treffer | voll 10, Teil 5 (abgestuft, aus Seed-Content) | „passende Argumente geben Punkte“ |
| Bonus überzeugte Persona | leicht 20, schwer 50 | nach Schwierigkeit skaliert |
| Einzelpunkte | volle Teampunkte je Mitglied plus 3 je eigener Treffer-Karte | Anteil plus kleiner Bonus |
| Präsenz-Fenster | 45 s | nicht spezifiziert |

Weitere Prototyp-Annahmen: UI auf Englisch, Teams heißen „Team 1..n“, Spätbeitritt nach Start ist möglich (ohne Karten, aber mit Stimme), Weiter-Button nach Persona-Ergebnis ohne Konsens.

---

## 3. Phase 1: Pilotfähige Version

Ziel: ein echter Workshop mit 4 Teams à 3 bis 6 Personen läuft ohne Entwickler im Raum.

**Robustheit**
- Wiederverbindung nach Standby, Tab-Wechsel oder Netzwerkabbruch: Zustand beim Reaktivieren sofort neu laden, Poll pausieren bei verborgenem Tab.
- Vorschlag verfällt automatisch nach Zeitlimit oder wird beim Ausscheiden des Vorschlagenden aufgehoben.
- Karten eines länger abwesenden Mitglieds: Regel festlegen (an Team freigeben oder Trainer verteilt neu).
- Fehler- und Ladezustände vereinheitlichen, Offline-Hinweis.

**Trainer-Eingriffe**
- Vorschlag aufheben, Persona-Ergebnis überspringen, Team beenden, Mitglied entfernen oder umsetzen, Session zurücksetzen.
- Session-Übersicht mit Status aller Teams als eigene Beamer-Ansicht ohne Bedienelemente.
- Trainer-Login statt Browser-Token (mindestens gemeinsames Passwort je Markt).

**Inhalt und Sprache**
- Echte Argumentkarten, Personas, Needs und Zuordnung von SAPERED und CUPRA importieren (Excel oder JSON), Balance-Test „volle Abdeckung“ läuft gegen den echten Content.
- i18n nach dem Muster der Streak Challenge (en, de, es), Content mehrsprachig.

**Betrieb**
- Deploy auf Vercel plus Neon, Migrationen, Monitoring der API-Fehler.
- Ergebnis-Export je Session (CSV oder Excel: Züge, Treffer, Punkte pro Team und Teilnehmer) für Auswertung und übergreifende Einzelwertung.
- Lasttest: 12 Teams, 60 Devices, 1,5-s-Polling.

**Schätzung (Indikation):** 8 bis 12 Personentage.

---

## 4. Phase 2: Echtzeit, Feinkonzept, KI-Option

**Echtzeit-Upgrade (Schätz-Hebel 1 aus dem Konzept)**
- Option A: Server-Sent Events aus dem Route-Handler, Postgres `listen/notify` oder Polling serverseitig. Geringe Änderung, auf Vercel mit Laufzeitgrenzen.
- Option B: Supabase Realtime (Broadcast der Versionsnummer, Client lädt Snapshot). Zusätzlicher Dienst, dafür stabil und skalierbar.
- Empfehlung: Polling im Pilot belassen und messen. Bei Latenzproblemen Option B, da das Snapshot-Format unverändert bleibt.
- Aufwand: 3 bis 5 Personentage.

**Feinkonzept-Parameter**
- Deckgröße, Needs pro Persona, Rundenzahl, Punkteschwellen und Überzeugt-Regel aus dem Feinkonzept übernehmen. Konfiguration pro Session oder Markt statt globaler Konstante (Schätz-Hebel 3).
- Aufwand: 1 bis 2 Personentage, sofern die Regeln nicht das Ablaufmodell ändern.

**Persona-Reaktion per KI (Schätz-Hebel 2, optional)**
- In-character-Reaktion auf die gespielte Karte, Treffer bleibt deterministisch aus der Zuordnung. Streaming in die Sprechblase, Fallback auf geskriptete Reaktion bei Timeout.
- Aufwand: 3 bis 5 Personentage plus Prompt-Abstimmung mit SAPERED und laufende API-Kosten.

---

## 5. Phase 3: Plattform-Integration und Rollout

- Identität, Session-Steuerung, Trainer-View, Leaderboard-Grundgerüst, Realtime-Grundgerüst und Markt-Konfiguration aus Competitor I und II übernehmen; die Team-Spielmechanik als Modul andocken. Einzelpunkte in die workshopübergreifende Einzelwertung schreiben (F2).
- Finales Visual nach Figma (Kartendarstellung, Dialogansicht, Leaderboards) und Abgleich per Screenshot wie bei der Streak Challenge.
- QA mit echten Devices (iOS Safari, Android Chrome), Barrierefreiheit der Konsens-Interaktion, Multi-Markt-Rollout.
- Aufwand: abhängig vom Stand der Plattform; die Mechanik selbst ist dann fertig, Integration typischerweise 5 bis 10 Personentage.

---

## 6. Abdeckung der funktionalen Anforderungen

| Anforderung | Status Prototyp | Hinweis |
|---|---|---|
| A1 Gruppenzahl bei Sessionstart, Default 4 | erfüllt | 1 bis 12 |
| A2 QR-Code pro Gruppe | erfüllt | Link auf `/join/<code>` |
| A3 Beitritt per Scan mit persistenter User-ID | erfüllt | UUID im localStorage |
| A4 Keine leeren Gruppen | erfüllt | werden beim Start gelöscht |
| B1 Deck fester Größe, gleich für alle | erfüllt | 12, konfigurierbar |
| B2 Gleichmäßige Verteilung | erfüllt | Test: Differenz höchstens 1 |
| B3 Nur eigene Karten sichtbar | erfüllt | Server liefert alle Hände, UI zeigt eigene; Phase 1 filtert serverseitig |
| C1 Zwei Personas mit Schwierigkeit | erfüllt | |
| C2 Gemeinsame Wahl, schwer wertvoller | erfüllt | Konsens wie beim Spielzug |
| D1 Needs nacheinander | erfüllt | |
| D2 Vorschlag und Bestätigung über Devices | erfüllt | technischer Kern |
| D3 Geskriptete Reaktion | erfüllt | generisch plus spezifisch |
| D4 Deterministisches Matching | erfüllt | explizite CardNeedMap |
| D5 Karte verbraucht | erfüllt | |
| D6 Begrenzte Argumente pro Persona | erfüllt | 3 |
| E1 Spielende bei leerem Deck | erfüllt | |
| E2 Gruppenpunkte nach Schwierigkeit | erfüllt | |
| E3 Einzelpunkte Anteil plus Bonus | erfüllt | Aufteilung im Feinkonzept festlegen |
| E4 Keine manuelle Punktevergabe | erfüllt | |
| F1 Gruppen-Leaderboard | erfüllt | |
| F2 Übergreifendes Einzel-Leaderboard | teilweise | pro Session; workshopübergreifend in Phase 3 |

---

## 7. Risiken

- **Konsens blockiert:** Ein Mitglied reagiert nicht. Abgefedert durch Präsenz-Fenster; in Phase 1 zusätzlich Zeitlimit und Trainer-Eingriff.
- **Latenz des Pollings:** 1,5 s Verzögerung ist beim Konsens spürbar, aber im Pilot vertretbar. Messen, dann Echtzeit-Upgrade entscheiden.
- **Content-Balance:** Tote Karten oder zu leichte Personas verderben den Wettbewerb. Der Abdeckungstest läuft gegen den echten Content, die Balance selbst liegt bei SAPERED und CUPRA.
- **Sichtbarkeit fremder Karten:** Der Snapshot enthält aktuell alle Hände des Teams, nur die UI filtert. Vor dem Pilot serverseitig auf eigene Karten plus Anzahl der anderen reduzieren.
- **Vercel-Cold-Starts:** Erste Aktion nach Pause kann 1 bis 2 s dauern. Warmhalten durch das Polling der Trainer-Ansicht.

---

## 8. Offene Punkte und Abhängigkeiten

- **SAPERED und CUPRA:** Runden 3 und 4 ausdefinieren (die Platzhalter im Prototyp ersetzen), CUPRAs offizielle Positionierung des Delta einarbeiten, geskriptete Reaktionen je Persona und Treffer-Stärke liefern; Entscheidung geskriptet versus KI.
- **Feinkonzept:** Deckgröße, Needs pro Persona, Rundenzahl, Überzeugt-Regel, Aufteilung der Einzelpunkte.
- **Plattform Competitor I und II:** Stand von Identität, Session und Leaderboard, um Phase 3 zu planen.
- **Grafiker:** finales Visual für Karten, Dialog und Leaderboards.
- **Betrieb:** Vercel-Projekt und Neon-Datenbank für den Pilot anlegen.
