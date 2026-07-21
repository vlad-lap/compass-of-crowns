---
name: localize-names
description: Fill in the `name_ru` field for Compass of Ice and Fire objects (kingdoms, continents, and other data/raw/*.json files that carry a name_ru field), using canonical Russian ASOIAF terminology from 7kingdoms.ru. Use whenever asked to translate/localize names into Russian for a given object type (e.g. "localize kingdom names", "fill in name_ru for continents").
---

Your task is to fill the `name_ru` property on entries in one `data/raw/*.json` file, using the official/canonical Russian translation of each `name` — not a fresh translation of your own.

## Scope

- The user tells you which object type to process (e.g. "kingdoms", "continents"). The raw data file is `data/raw/{type}.json`, and the matching flat dictionary is `languages/ru/{type}.json`.
- Process ONLY entries where `name_ru` is currently `null`. Do not touch entries that already have a `name_ru` value.
- Modify ONLY the `name_ru` field on each entry. Leave `name`, `id`, `description_ru`, and every other field untouched — do not translate `description_ru` unless separately asked.

## Researching the translation

- Do not translate `name` yourself from English. Look up the established Russian name via [7kingdoms.ru](https://7kingdoms.ru) ("Энциклопедия Песни Льда и Пламени"), which follows the official Sokolov (Соколов) book translation terminology used by the Russian fandom.
- Use `WebSearch` with the term plus `7kingdoms.ru`, then open the matching wiki page (or use `WebFetch` directly on the `7kingdoms.ru/wiki/...` URL) to confirm the exact name used as the page title / lead sentence.
- If a name has no direct wiki page (e.g. it's a sub-region only mentioned inside another page, like Brandon's Gift under "Дар"), search for it by its English name plus "7kingdoms.ru" and read the page it redirects to or is described in.
- If 7kingdoms.ru genuinely has no attested translation for something, leave `name_ru` as `null` and flag it to the user rather than guessing.

## Where translated names live — write to BOTH

1. The entry's own record in `data/raw/{type}.json` — its `name_ru` field.
2. Mirrored verbatim into `languages/ru/{type}.json`, a flat `{ "id": "translated name" }` dictionary (same shape as `languages/ru/continents.json` / `languages/ru/kingdoms.json`).

Keep the two files in sync — same id, same string, on every entry you touch.

## Example usage

> Заполни name_ru в data/raw/continents.json для sothoryos, продублируй в languages/ru/continents.json

1. Read `data/raw/continents.json`, find the `sothoryos` entry, confirm `name_ru` is `null`.
2. `WebSearch`: `Sothoryos 7kingdoms.ru` → find/open the `7kingdoms.ru/wiki/Соториос`-style page, confirm the canonical name is "Соториос".
3. Edit `data/raw/continents.json`: set `"name_ru": "Соториос"` on the `sothoryos` entry.
4. Edit `languages/ru/continents.json`: set `"sothoryos": "Соториос"`.