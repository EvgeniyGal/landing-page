## Purpose

Let learners toggle a dichoptic lazy-eye study mode with saved anaglyph glass profiles shared across web and mobile.

## ADDED Requirements

### Requirement: Mode toggle
The learner app MUST expose a Regular / Lazy eye toggle in the header. When Lazy eye is enabled, study surfaces MUST use the user’s active anaglyph profile.

#### Scenario: Enable lazy eye
- **WHEN** the learner turns on Lazy eye
- **THEN** the preference is persisted for that user and study uses dichoptic rendering

### Requirement: Glass profiles
Learners MUST be able to create, rename, save, activate, and delete named glass profiles with left/right eye colors (visual HSL hue + lightness, no numeric entry) and a black/gray/white background.

#### Scenario: Save phone profile
- **WHEN** the learner adjusts left/right colors and saves a profile named “Phone”
- **THEN** that profile is stored on the account and can be set active on web or mobile

### Requirement: Dichoptic study text
In Lazy eye mode, word, part of speech, and transcription MUST alternate left/right colors letter-by-letter. Examples and definition MUST alternate by syllable. Spaces and punctuation stay neutral.

#### Scenario: Show front
- **WHEN** a due card is shown in Lazy eye mode
- **THEN** the headword letters alternate eye colors using the active profile

### Requirement: Dichoptic rating buttons
In Lazy eye mode, Again/Hard/Good/Easy MUST use a vertical left/right color split, dichoptic label letters, and a soft alternating fill pulse.

#### Scenario: Rate card
- **WHEN** the answer step is revealed in Lazy eye mode
- **THEN** rating buttons show split eye colors with a gentle pulse
