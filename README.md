# The — MediaWiki extension

**The** is a playful, display-only MediaWiki extension that replaces configured words in rendered article text. By default, `the` appears as `hte`, mimicking a running typo joke. The original wikitext is **never modified**.

## Features

- Default replacement: `the` → `hte` (also `The` → `Hte` and `THE` → `HTE`).
- Whole-word matching, case-insensitive, with capitalisation preserved.
- Light mode: **black background and white text**.
- Dark mode: **white background and black text**.
- Automatic mode follows the system colour scheme on supported MediaWiki skins.
- Excludes links, code, editable fields, references and other technical elements.
- Configurable word mappings and optional highlighting.
- Applies to standard article content via MediaWiki's `wikipage.content` JavaScript hook.

## Requirements

MediaWiki 1.43 or later and a browser with modern JavaScript Unicode property escape support.

## Installation

1. Place this directory in `extensions/The` under your MediaWiki installation.
2. Add the following to `LocalSettings.php`:

   ```php
   wfLoadExtension( 'The' );
   ```

3. Refresh the wiki and, if necessary, clear browser cache.
4. Confirm installation on `Special:Version`.

## Configuration

After `wfLoadExtension( 'The' );` in `LocalSettings.php`:

```php
$wgTheReplacements = [
    'the' => 'hte',
    'because' => 'becuase',
];

// Optional: turn off dark/light background highlights.
$wgTheHighlight = true;
```

Mappings are **replacements**, not additions: if you override `$wgTheReplacements`, include the `the` mapping to keep it.

## Example

Stored wikitext:

> The dog is in the garden.

Displayed to readers (with themed highlighting):

> Hte dog is in hte garden.

The HTML inserted by the extension is display-only. Editors, API consumers and search engines may see the original source, and copying displayed text may copy the substituted spelling. This extension is a visual joke; **do not rely on it for censorship or security**.

## Limitations

- Matching is performed within individual HTML text nodes, so words split across markup are not replaced.
- On a page with both Extension:Pride and Extension:The, processing order can affect which text is replaced or highlighted. Both extensions are designed to avoid modifying each other's already-inserted spans, but nesting and replacement order are not guaranteed.
- The extension does not currently add per-user targeting or special-page processing.
- Displayed titles outside article content are not modified.

## Development

This repository can be used as a source for a future Wikimedia Gerrit repository request. A Gerrit repository is created by Wikimedia maintainers after review; creating this GitHub repository does not create a Gerrit repository automatically.

## Licence

MIT. See [LICENSE](LICENSE).
