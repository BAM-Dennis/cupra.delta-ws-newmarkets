# Developer-Briefing: Workshop-App Workshop 3, Team-Wettbewerb (Konzept-Umfang zur Aufwandsschätzung)

**Projekt:** CUPRA Global Launch Training
**Dieser Workshop:** "New Market Segment", als Team-Wettbewerb umgesetzt. Gruppen spielen Argumentkarten gegen Personas und treten gegeneinander an.
**Verhältnis zu Competitor I und II:** Nutzt dieselbe Plattform (Identität, Session, Trainer-View, Leaderboard, Konfiguration, Realtime). Neu ist die gesamte Teamspiel-Mechanik. Dieses Dokument beschreibt vor allem das Neue, damit der Zusatzaufwand schätzbar wird.
**Zweck:** Software-Konzept, Anforderungen, User Stories und Akzeptanzkriterien als Grundlage, um den Umfang belastbar zu schätzen. Es wird kein Prototyp gebaut.
**Reifegrad:** Pitch-Stand. Feinheiten wie Rundenzahl, Argumente pro Dialog und Punkteschwellen werden im Feinkonzept festgelegt. Es wird nur vorgestellt, was auch umsetzbar ist.
**Stand:** 14.09.2026
**Autor:** Janine Kappenberg (SAPERED), Konzept mit Claude

---

## 1. Kontext in zwei Sätzen

Anders als Comp I und II ist dies ein rein digitales Teamspiel ohne Fahrzeuge. Die Teilnehmer sitzen in Gruppen, jede Gruppe hält ein Deck aus Argumentkarten für den CUPRA, und die Gruppen versuchen, nacheinander Personas zu überzeugen, indem sie die passenden Argumente zur richtigen Zeit ausspielen. Die Gruppen treten gegeneinander an.

Ziel dieses Dokuments: den Umfang des Konzepts vollständig genug beschreiben, damit der Aufwand belastbar geschätzt werden kann.

---

## 2. Was aus Competitor I und II wiederverwendet wird

Nicht doppelt schätzen:

- Teilnehmer-PWA per QR, kein App-Store, keine Installation.
- Übergreifende Teilnehmer-Identität mit persistenter User-ID.
- Trainer-/Präsentations-View, Session-Steuerung, Leaderboard-Darstellung auf der Leinwand.
- Realtime-Grundgerüst.
- Konfiguration pro Markt.

Wichtig: Dieser Workshop braucht kaum KI. Das Matching Argument zu Need ist ein deterministischer Abgleich gegen eine hinterlegte Zuordnung, keine Freitext-KI wie in Comp I und II.

---

## 3. Was in Workshop 3 neu ist

Die Aufwandstreiber liegen hier in Mehrspieler-Logik und Spielmechanik, nicht in KI:

1. **Gruppenbildung** und Zuteilung der Teilnehmer per Gruppen-QR.
2. **Karten-Deck pro Gruppe**, feste Größe, verdeckt auf die Mitglieder verteilt.
3. **Konsens-Spielzug über mehrere Devices** (ein Mitglied schlägt vor, die anderen bestätigen).
4. **Einmal-Spielen-Mechanik:** jede Karte nur einmal, Spielende, wenn alle Karten gespielt sind.
5. **Persona-Dialog** mit zunächst geskripteten Reaktionen.
6. **Gruppen- und Einzelwertung** plus zwei Leaderboards.

---

## 4. Ablauf Workshop 3

1. **Intro und Gruppenbildung.** Trainer startet die Session und legt die Anzahl der Gruppen fest, Default vier. Es werden mehrere QR-Codes erzeugt, einer pro Gruppe. Teilnehmer treten ihrer Gruppe per Scan bei. Die Gruppenzahl ist nicht fest an vier gebunden, weil die Teilnehmerzahl je Markt schwankt. Leere Gruppen werden nie erzeugt.
2. **Kartenverteilung.** Jede Gruppe erhält ein Deck aus n Argumentkarten für den CUPRA. Die Deckgröße ist pro Gruppe fest, unabhängig von der Gruppengröße, damit der Wettbewerb fair bleibt. Die Karten werden so gleichmäßig wie möglich und verdeckt auf die Mitglieder verteilt. Jedes Mitglied sieht nur die eigenen Karten, das erzwingt Absprache.
3. **Karten ansehen und bestätigen.** Jedes Mitglied sichtet seine Karten und bestätigt.
4. **Persona-Wahl.** Die Gruppe bekommt zwei Personas angezeigt, eine leichte und eine schwere, und entscheidet gemeinsam, welche sie nimmt. Die schwere ist mehr Punkte wert.
5. **Dialog.** Die Persona beschreibt einen Need. Die Gruppe wählt per Konsens ein Argument aus ihren Karten als Antwort. Die Persona reagiert. So im Wechsel, Need, Argument, Reaktion, bis zum Limit pro Persona (tbd, drei bis fünf). Passende Argumente geben Punkte. Am Ende ist die Persona überzeugt oder nicht. Jede gespielte Karte ist danach verbraucht.
6. **Weitere Runden.** Gleiche Interaktion mit neuen Personas. Insgesamt werden mehrere Runden gespielt. Das Spiel endet, wenn das Deck der Gruppe aufgebraucht ist. Die Gruppen spielen parallel und treffen dieselben Personas, damit der Wettbewerb fair ist.
7. **Leaderboards.** Der Trainer sieht das Gruppen-Leaderboard, welche Gruppe die meisten Punkte hat und die meisten Personas überzeugt hat, und das übergreifende Einzel-Leaderboard über alle Teilnehmer.

**Zeit:** Über die feste Deckgröße steuerbar, alle Gruppen sind etwa gleichzeitig fertig. Genaue Deckgröße, Rundenzahl und Zeitbudget sind tbd fürs Feinkonzept.

---

## 5. Funktionale Anforderungen (nur das Neue)

**A. Session und Identität:** wie Comp I, plus Gruppenbezug.
- A1 Trainer legt die Anzahl der Gruppen bei Sessionstart fest, Default vier.
- A2 System erzeugt einen QR-Code pro Gruppe.
- A3 Teilnehmer tritt per Scan seiner Gruppe bei und ist über die persistente User-ID identifiziert.
- A4 Leere Gruppen werden nicht erzeugt.

**B. Deck und Kartenverteilung**
- B1 Jede Gruppe erhält ein Deck fester Größe aus Argumentkarten (Deckgröße konfigurierbar, gleich für alle Gruppen).
- B2 Die Karten werden so gleichmäßig wie möglich auf die anwesenden Mitglieder verteilt.
- B3 Ein Mitglied sieht nur die eigenen Karten.

**C. Persona-Wahl**
- C1 Pro Runde werden zwei Personas angeboten, leicht und schwer, mit sichtbarem Schwierigkeitsgrad.
- C2 Die Gruppe wählt gemeinsam eine Persona. Die schwere ist mehr Punkte wert.

**D. Dialog und Konsens-Spielzug**
- D1 Die Persona nennt nacheinander ihre Needs.
- D2 Ein Mitglied schlägt eine seiner Karten als Antwort vor, die anderen Mitglieder bestätigen auf ihren Devices, dann wird die Karte gespielt.
- D3 Die Persona reagiert auf die gespielte Karte (Reaktion zunächst geskriptet, siehe Abschnitt 7).
- D4 Passt die Karte zum aktuellen Need, gibt es Punkte (deterministischer Abgleich, siehe Abschnitt 7).
- D5 Eine gespielte Karte ist verbraucht und steht nicht erneut zur Verfügung.
- D6 Pro Persona ist die Zahl der Argumente begrenzt (tbd). Danach gilt die Persona als überzeugt oder nicht.

**E. Spielende und Wertung**
- E1 Das Spiel der Gruppe endet, wenn ihr Deck aufgebraucht ist.
- E2 Gruppenpunkte pro überzeugter Persona, skaliert nach Schwierigkeit.
- E3 Einzelpunkte: jedes aktive Mitglied erhält einen Anteil am Gruppenerfolg, plus einen kleinen Bonus, wenn die eigene Karte den Ausschlag gab.
- E4 Keine manuelle Punktevergabe durch den Trainer.

**F. Leaderboards**
- F1 Gruppen-Leaderboard, Punkte und Zahl der überzeugten Personas.
- F2 Übergreifendes Einzel-Leaderboard über alle Teilnehmer, zahlt in die workshopübergreifende Einzelwertung ein.

---

## 6. User Stories mit Akzeptanzkriterien (Fokus auf das Neue)

### US-1 Gruppe bilden
Als **Trainer** möchte ich die Anzahl der Gruppen festlegen und pro Gruppe einen QR-Code ausgeben, damit die Teilnehmer sich unabhängig von der Marktgröße sinnvoll aufteilen.
- Ich setze die Gruppenzahl bei Sessionstart, Vorgabe vier.
- Pro Gruppe entsteht ein QR-Code.
- Teilnehmer landen per Scan in der richtigen Gruppe.
- Es entsteht keine leere Gruppe.

### US-2 Karten erhalten und sichten
Als **Teilnehmer** möchte ich meinen Teil der Gruppenkarten sehen und bestätigen, damit ich weiß, womit ich spielen kann.
- Ich sehe nur meine eigenen Karten.
- Die Deckgröße ist für alle Gruppen gleich, unabhängig von der Gruppengröße.
- Ich bestätige, dass ich meine Karten gesichtet habe.

### US-3 Persona gemeinsam wählen
Als **Gruppe** möchten wir zwischen einer leichten und einer schweren Persona wählen, damit wir Risiko und Punkte abwägen.
- Beide Personas zeigen ihren Schwierigkeitsgrad offen.
- Die Wahl ist eine gemeinsame Gruppenentscheidung.
- Die schwere Persona ist mehr Punkte wert.

### US-4 Argument im Konsens spielen
Als **Gruppe** möchten wir gemeinsam entscheiden, welches Argument wir auf einen Need spielen, damit wir zusammenarbeiten müssen.
- Ein Mitglied schlägt eine seiner Karten vor.
- Die anderen bestätigen auf ihren Devices, dann wird gespielt.
- Passt die Karte zum Need, gibt es Punkte.
- Die Karte ist danach verbraucht.

### US-5 Karten zum besten Zeitpunkt ausspielen
Als **Gruppe** möchten wir unsere Karten über die Personas hinweg klug einsetzen, damit jede Karte im besten Moment fällt.
- Jede Karte kann nur einmal gespielt werden.
- Eine Karte kann auf Needs mehrerer Personas passen (many-to-many), daraus entsteht die Timing-Entscheidung.
- Das Spiel endet, wenn alle Karten der Gruppe gespielt sind.

### US-6 Wertung und Leaderboards
Als **Trainer** möchte ich sehen, welche Gruppe gewinnt und wie die Einzelnen abschneiden, damit ich den Wettbewerb abschließe.
- Gruppenpunkte pro überzeugter Persona, nach Schwierigkeit skaliert.
- Einzelpunkte als Anteil am Gruppenerfolg plus kleiner Beitrags-Bonus.
- Gruppen-Leaderboard und übergreifendes Einzel-Leaderboard.

---

## 7. Spiel- und Matching-Logik im Detail

**Matching Argument zu Need.** Grundwahrheit ist eine hinterlegte Zuordnung von Karten zu Needs, many-to-many. Eine gespielte Karte trifft einen Need, wenn das Paar in der Zuordnung steht. Deterministischer Lookup, keine KI. Dass eine Karte auf mehrere Needs passt, ist gewollt, denn nur dadurch entsteht die Timing-Entscheidung.

**Einmal-Spielen.** Jede Karte hat einen Zustand gespielt oder offen. Gespielte Karten sind raus. Spielende der Gruppe, wenn keine offene Karte mehr existiert.

**Persona-Reaktion.** Zunächst geskriptet, eine hinterlegte Reaktion je Kombination aus Need und gespielter Karte. Deterministisch und günstig. Eine KI-generierte, in-character reagierende Variante ist eine Option, die SAPERED intern prüft, und wäre der einzige nennenswerte KI-Posten in diesem Workshop.

**Konsens-Spielzug.** Geteilter Gruppenzustand in Echtzeit. Ein Vorschlag eines Mitglieds wird den anderen angezeigt, deren Bestätigung löst den Spielzug aus. Das ist der technische Kern dieses Workshops.

**Wertung.**
- Gruppe: Punkte pro überzeugter Persona, skaliert nach Schwierigkeit.
- Einzeln: Anteil am Gruppenerfolg für jedes aktive Mitglied, plus kleiner Bonus für die ausschlaggebende Karte. Der Bonus ist klein genug, dass Glück die Einzelwertung nicht dominiert.

---

## 8. Balance-Regeln (Content-Design, Abhängigkeit fürs Feinkonzept)

Diese Regeln sind Aufgabe von SAPERED und CUPRA, nicht des Developers, aber sie entscheiden, ob das Spiel fair ist:

- **Volle Abdeckung.** Jede Karte muss über die gespielten Personas mindestens einen guten Moment haben, sonst ist sie eine tote Karte und ihr Halter benachteiligt. Argumente und Persona-Needs werden zusammen entworfen.
- **Feste Deckgröße pro Gruppe.** Unabhängig von der Gruppengröße, sonst hätte eine größere Gruppe mehr Punktchancen. Feste Deckgröße hält auch die Spieldauer aller Gruppen gleich.

---

## 9. Nicht-funktionale Anforderungen

Wie Comp I. Zusätzlich ist der geteilte Gruppenzustand in Echtzeit hier anspruchsvoller als das individuelle Spiel in Comp I und II, weil mehrere Devices einer Gruppe konsistent denselben Spielstand sehen und der Konsens-Spielzug synchron laufen muss.

---

## 10. Umfang zur Schätzung

**Neu zu bauen (auf der Plattform aus Comp I und II):**
- Gruppenbildung und Zuteilung per Gruppen-QR, Trainer legt Gruppenzahl fest.
- Deck-Erzeugung fester Größe und verdeckte Verteilung auf Mitglieder.
- Konsens-Spielzug über mehrere Devices mit geteiltem Gruppenzustand in Echtzeit.
- Einmal-Spielen-Mechanik inklusive Spielende-Erkennung.
- Persona-Dialog mit geskripteten Reaktionen.
- Deterministisches Matching Karte zu Need gegen die Zuordnung.
- Gruppen- und Einzelwertung, zwei Leaderboards.

**Wiederverwendet:** Session, Identität, Trainer-View, Leaderboard-Grundgerüst, Realtime-Grundgerüst, Konfiguration.

**Schätz-Hebel, bitte getrennt ausweisen:**
- Realtime-Mehrspieler und geteilter Gruppenzustand, das ist hier der Hauptposten.
- Persona-Reaktion geskriptet versus die optionale KI-Variante.
- Konfigurierbarkeit von Deckgröße, Gruppenzahl, Rundenzahl.

**Nicht Teil dieses Workshops:** Fahrzeugbezug, KI-Freitext-Matching, finales visuelles Design, breiter Multi-Markt-Rollout.

---

## 11. Datenmodell (Delta zu Comp I und II)

- **Group** (id, sessionRef, Score, Anzahl überzeugter Personas)
- **GroupMembership** (userRef, groupRef)
- **ArgumentCard** (id, Text, Zustand offen oder gespielt, Halter userRef)
- **CardNeedMap** (Menge gültiger Paare aus Karte und Need, many-to-many)
- **Persona** (id, Schwierigkeit, Needs, optional geskriptete Reaktionen)
- **Move** (groupRef, personaRef, cardRef, need, Treffer ja oder nein, points, contributorUserRef)
- **Round** (sessionRef, personaRef, Reihenfolge)
- Session, User, Participation, Leaderboards: wie Comp I.

---

## 12. Offene Punkte und Abhängigkeiten

- **Von SAPERED und CUPRA:** Argumentkarten, Personas mit Needs, die Karte-Need-Zuordnung, die Deck-Balance nach den Regeln in Abschnitt 8, optional die geskripteten Persona-Reaktionen.
- **Reifegrad Pitch, tbd fürs Feinkonzept:** Deckgröße, Rundenzahl, Argumente pro Persona-Dialog, Punkteschwellen und die Frage, wann eine Persona als überzeugt gilt.
- **Zu prüfen bei SAPERED:** geskriptete versus KI-generierte Persona-Reaktion.
- **Zu entscheiden mit dem Developer:** Realtime-Framework für den geteilten Gruppenzustand, das ist der Hauptaufwand.
- **Vom Grafiker:** finales Visual, Kartendarstellung, Dialogansicht, Leaderboards.

---

## 13. Annahmen

- Rein digitales Teamspiel, keine Fahrzeuge, die Teilnehmer sitzen in Gruppen.
- Gruppen spielen parallel und treffen dieselben Personas, damit der Wettbewerb fair ist.
- Jede Karte nur einmal spielbar, Spielende bei aufgebrauchtem Deck, feste Deckgröße pro Gruppe.
- Baut auf der Plattform aus Comp I und II auf, geteilte Bausteine existieren dort bereits oder werden dort geschätzt.
- Dieses Dokument dient der Aufwandsschätzung des Konzepts, nicht dem Bau eines Prototyps.
