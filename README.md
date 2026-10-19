# Extension:The

A MediaWiki extension that displays deliberate typos in article text (for example, `the` → `hte`) without changing the stored wikitext.

## Requirements

* MediaWiki 1.46 or later (matching Extension:Pride).

## Installation

1. Put the extension in `extensions/The/`.
2. Add `wfLoadExtension( 'The' );` to `LocalSettings.php`.
3. Clear relevant caches and reload an article.

## Configuration

The default configuration automatically replaces `the` with `hte`. Whole-word matching is case-insensitive and preserves basic capitalisation: `the` → `hte`, `The` → `Hte`, `THE` → `HTE`.

Add the following **after** `wfLoadExtension( 'The' );` to customise:

```php
$wgTheReplacements = [
    'the' => 'hte',
    'because' => 'becuase',
];
$wgTheHighlight = true;
```

By default, replacements have black backgrounds and white text in light mode, and white backgrounds with black text in dark mode (including MediaWiki automatic/system preference). Set `$wgTheHighlight = false;` to display substitutions as plain text.

Text within links, code, form fields, references, and Pride-highlighted spans is skipped. This makes The compatible with Pride, although **if a term is targeted by both extensions**, whichever runs first gets to decorate it; avoid overlapping configured words. Client-side rendering means text may briefly show unchanged before ResourceLoader initialises.

## Troubleshooting

In the browser console run:

```js
mw.loader.getState( 'ext.the' )
mw.config.get( 'wgTheReplacements' )
document.querySelectorAll( '.the-replacement' ).length
```

`ready`, `{ the: 'hte' }`, and a positive replacement count on a page with eligible instances of `the` indicate successful loading. If the module fails to load, check MediaWiki's debug log and reload after clearing cache.

## Licence

MIT — see [LICENSE](LICENSE).
