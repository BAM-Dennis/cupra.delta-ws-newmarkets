# CUPRA Workshop 3 „New Market Segment“ – Team-Kartenspiel (Prototyp)

Digitales Teamspiel für das CUPRA Global Launch Training: Gruppen halten ein Deck aus Argumentkarten und überzeugen per Konsens-Spielzug nacheinander Personas eines neuen Marktsegments. Fachliche Grundlage ist das Konzeptdokument von SAPERED, siehe [SAPERED_Workshop-App_Konzept_Aufwandsschaetzung_WS3_NewMarketSegment.md](SAPERED_Workshop-App_Konzept_Aufwandsschaetzung_WS3_NewMarketSegment.md). Der Umsetzungsplan steht in [umsetzungsplan.md](umsetzungsplan.md).

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Postgres über `pg`, Zod, Vitest. Design-System, Fonts und Assets stammen aus der CUPRA Streak Challenge.

## Lokal starten

```bash
npm install
cp .env.example .env.local     # DATABASE_URL zeigt auf die Docker-DB
npm run db:up                  # Postgres 16 auf Port 5442
npm run db:migrate
npm run dev                    # http://localhost:3000
```

## Demo-Ablauf

1. `/trainer` öffnen, Anzahl Teams wählen (Default 4), Session anlegen.
2. Die Trainer-Seite zeigt pro Team einen QR-Code mit Link auf `/join/<CODE>`. Teilnehmer scannen, geben ihren Namen ein und landen in der Lobby. Alternativ den 6-stelligen Code auf `/` eintippen.
3. „Start game“: leere Teams werden entfernt, jedes Team erhält dasselbe Deck (12 Delta-verankerte Karten), verdeckt auf die Mitglieder verteilt.
4. Teilnehmer bestätigen ihre Karten, wählen pro Runde gemeinsam eine leichte oder schwere Persona und spielen pro Need eine Karte. Ein Mitglied schlägt vor, alle anderen anwesenden Mitglieder bestätigen.
5. Treffer sind abgestuft (voll +10, Teil +5, kein Treffer 0). Nach 4 Runden ist das Deck leer. Trainer-Seite zeigt Team- und Einzel-Leaderboard live.

Runden 1 und 2 stammen aus dem Seed-Content von SAPERED, Runden 3 und 4 sind im Prototyp als Platzhalter angelegt und werden mit CUPRA ausdefiniert.

Zum Testen auf einem Rechner: mehrere Browser-Profile oder private Fenster öffnen, jedes Fenster ist ein Teilnehmer (eigene User-ID im localStorage).

## Skripte

| Skript | Zweck |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Engine-Tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run db:up` | Postgres per Docker Compose |
| `npm run db:migrate` | SQL-Migrationen aus `db/migrations` anwenden |

## Struktur

```
db/migrations/        SQL-Schema (sessions, groups, members)
src/engine/           Reine Spiellogik: Typen, Konfiguration, Reducer, Tests
src/data/content.ts   Seed-Content (SAPERED): Karten, Personas, Needs, Zuordnung mit Treffer-Stärke, Runden
src/app/api/          Route-Handler (Sessions, Gruppen, Aktionen)
src/lib/              DB-Pool, Repository, Leaderboard, API-Client, localStorage, Polling-Hook
src/components/       UI-Primitives, Teilnehmer-Screens, Trainer-Ansicht
src/i18n/en.ts        UI-Texte
```

Alle Tuning-Werte (Deckgröße, Punkte, Schwellen, Poll-Intervalle) liegen in `src/engine/config.ts`.

## Architektur in Kürze

- **Server-authoritative:** Jede Aktion eines Teilnehmers läuft serverseitig durch den Reducer in `src/engine/game.ts`, unter Zeilensperre auf der Gruppe. Der Client rendert nur den Snapshot.
- **Geteilter Gruppenzustand:** liegt als JSONB in `groups.state` mit Versionszähler. Teilnehmer-Devices pollen alle 1,5 s mit `?since=<version>`; unverändert liefert nur Präsenzdaten. Der Poll ist zugleich das Lebenszeichen für die Anwesenheit.
- **Konsens:** Ein Vorschlag gilt, wenn alle anwesenden Mitglieder (Lebenszeichen in den letzten 45 s) bestätigt haben. Mitglieder ohne Lebenszeichen blockieren den Spielzug nicht.
- **Identität:** persistente User-ID im localStorage, kein Login. Trainer-Rechte über ein Token, das bei Session-Erstellung im Browser gespeichert wird.

## Deployment

Vercel (Region fra1, siehe `vercel.json`) plus Neon Postgres in Frankfurt. Der Prototyp nutzt im Neon-Projekt der Streak Challenge eine **eigene Datenbank `nms`**, damit sich beide Apps nicht in die Quere kommen (beide führen eine Tabelle `schema_migrations` mit gleich benannten Migrationen).

- In Vercel `DATABASE_URL` auf den **gepoolten** Neon-String mit Datenbank `/nms` und `sslmode=require` setzen (Production und Preview).
- Schema-Änderungen einmalig mit dem **ungepoolten** String anwenden: `DATABASE_URL=<unpooled …/nms> npx tsx scripts/migrate.mts`.
- Lokal liegen beide Strings in `.env.production.local` (gitignored); `npm run build && npm run start` läuft damit gegen Neon.
