## Purpose

Schedule reviews with Anki/Noji-style SM-2 so Home can show cards due today and study buttons apply Again/Hard/Good/Easy.

## ADDED Requirements

### Requirement: Learning then review
New cards MUST walk learning steps `1m` then `10m` before graduating. Review cards MUST grow intervals from ease, with Easy bonus 1.3, Hard 1.2, and ease floor 1.3.

#### Scenario: Good on a new card
- **WHEN** a new card is rated Good
- **THEN** it enters learning at the 1 minute step

#### Scenario: Easy on a new card
- **WHEN** a new card is rated Easy
- **THEN** it graduates with a 4-day interval

### Requirement: Due queue
Cards with `dueAt` less than or equal to now MUST appear in that deck’s study queue and increment “Cards for today”.

#### Scenario: Due today
- **WHEN** a deck has three cards due now
- **THEN** Home shows Cards for today: 3 for that deck
