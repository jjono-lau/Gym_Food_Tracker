# Obsidian Vault AI Generation Ruleset

## Purpose

This ruleset defines how AI must generate, structure, and maintain Markdown files for an Obsidian vault. The goal is consistency, scalability, and compatibility with search, linking, and future AI/chatbot use.

---

## 1. Core Principles

### 1.1 Atomic Notes

* Each file must represent **one single concept only**
* Do not combine multiple topics into one file
* If multiple ideas exist, split into separate notes

### 1.2 Clarity Over Volume

* Avoid unnecessary length
* Prioritize usefulness and readability
* No filler or generic explanations

### 1.3 No Duplication

* Do not create duplicate concepts
* If overlap exists, link to the existing note instead

---

## 2. File Naming Rules

### 2.1 Naming Format

* File name must exactly match the note title
* Use plain English, descriptive names

### 2.2 Examples

* ✅ `Chicken Congee.md`
* ✅ `Progressive Overload.md`
* ❌ `note1.md`
* ❌ `gymStuff.md`

### 2.3 Naming Constraints

* No abbreviations unless widely known
* No special characters except spaces
* Use Title Case

---

## 3. Folder Structure

All files must be placed into one of the following folders:

* `Inbox/` → unprocessed or raw notes
* `Notes/` → atomic knowledge notes
* `Projects/` → goal-based work
* `Resources/` → reference material (recipes, guides)
* `Archive/` → inactive or deprecated notes

AI must assign the correct folder based on content type.

---

## 4. Note Structure (MANDATORY)

Every note must follow this exact structure:

```
# <Title>

## Summary
A short explanation written in simple terms.

## Key Points
- Bullet point insights
- Important facts only
- No repetition

## Related
- [[Linked Note 1]]
- [[Linked Note 2]]
```

---

## 5. Internal Linking Rules

### 5.1 Linking Format

* Use Obsidian format: `[[Note Name]]`

### 5.2 Linking Requirements

* Each note must include **at least 2 relevant internal links**
* Links must point to real or expected notes
* Do not create orphan notes (notes with no connections)

### 5.3 Contextual Linking

* Only link when there is a meaningful relationship
* Avoid forced or irrelevant links

---

## 6. Tags

### 6.1 Usage Rules

* Tags are optional, not required
* Use only for broad categories

### 6.2 Examples

* `#recipe`
* `#fitness`
* `#nutrition`

### 6.3 Restrictions

* Maximum 3 tags per note
* Do not duplicate folder structure using tags

---

## 7. Content Rules

### 7.1 Writing Style

* Use clear, concise language
* Avoid conversational tone
* No fluff or storytelling

### 7.2 Accuracy

* Ensure factual correctness
* Do not invent data or specifics

### 7.3 Formatting

* Use Markdown only
* Use bullet points instead of long paragraphs
* Keep structure consistent across all notes

---

## 8. Templates by Type

### 8.1 Standard Knowledge Note

```
# <Title>

## Summary
<Short explanation>

## Key Points
- 
- 

## Related
- [[...]]
```

---

### 8.2 Recipe Note

```
# <Dish Name>

## Summary
Brief description of the dish and purpose.

## Ingredients
- 

## Steps
1. 

## Nutrition Notes
- 

## Related
- [[...]]
```

---

### 8.3 Hub (Map of Content)

```
# <Topic Name> Hub

## Sections
### <Category>
- [[Note 1]]
- [[Note 2]]

## Related
- [[...]]
```

---

## 9. AI Output Format

When generating multiple notes:

* Each file must be clearly separated
* Use this format:

```
--- FILE: <File Name>.md ---
<content>

--- FILE: <File Name>.md ---
<content>
```

* Do not merge multiple notes into one file

---

## 10. Quality Control Checklist

Before outputting, AI must verify:

* [ ] One concept per note
* [ ] Correct file name format
* [ ] Proper folder assignment
* [ ] Structure followed exactly
* [ ] At least 2 internal links included
* [ ] No duplicate topics
* [ ] Clean Markdown formatting

---

## 11. Future Compatibility Requirements

Notes must be:

* Easily parseable by AI systems
* Suitable for website export
* Compatible with chatbot retrieval systems (RAG)

Avoid:

* Deep nesting
* Inconsistent formatting
* Ambiguous titles

---

## 12. Strict Prohibitions

AI must NOT:

* Create vague or generic notes
* Use inconsistent formatting
* Skip required sections
* Invent fake links that will never exist
* Combine unrelated topics
* Use different structures per note

---

## End of Ruleset
