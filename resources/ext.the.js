/* global mw, document, NodeFilter */
/**
 * Display-only text substitutions for rendered MediaWiki page content.
 * Original wikitext, links, and form controls remain unchanged.
 */
( function () {
    'use strict';

    const configured = mw.config.get( 'wgTheReplacements' ) || {};
    const highlight = mw.config.get( 'wgTheHighlight' ) !== false;
    const dictionary = Object.create( null );

    Object.keys( configured ).forEach( ( word ) => {
        if ( word && typeof configured[ word ] === 'string' ) {
            dictionary[ word.toLocaleLowerCase() ] = configured[ word ];
        }
    } );

    const words = Object.keys( dictionary );
    if ( words.length === 0 ) {
        return;
    }

    // Longer keys first: handle overlapping replacements predictably.
    words.sort( ( a, b ) => b.length - a.length );
    const escapeRegExp = ( value ) => value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
    const pattern = new RegExp( '(?:' + words.map( escapeRegExp ).join( '|' ) + ')', 'giu' );

    const ignoredSelector = [
        'a', 'script', 'style', 'noscript', 'textarea', 'input', 'button',
        'select', 'option', 'code', 'pre', 'kbd', 'samp', 'math', 'svg',
        '[contenteditable]', '.mw-editsection', '.the-replacement',
        '.mw-cite-backlink', '.reference', '.mw-references-wrap'
    ].join( ', ' );

    // Unicode-aware word boundaries, including letters/numbers outside ASCII.
    const wordChar = /[\p{L}\p{N}_]/u;
    const isWordChar = ( char ) => char !== undefined && wordChar.test( char );

    function preserveCase( original, replacement ) {
        if ( original === original.toLocaleUpperCase() &&
            original !== original.toLocaleLowerCase() ) {
            return replacement.toLocaleUpperCase();
        }
        if ( original.charAt( 0 ) === original.charAt( 0 ).toLocaleUpperCase() &&
            original.charAt( 0 ) !== original.charAt( 0 ).toLocaleLowerCase() ) {
            return replacement.charAt( 0 ).toLocaleUpperCase() + replacement.slice( 1 );
        }
        return replacement;
    }

    function substitute( node ) {
        const source = node.nodeValue;
        const matches = [];
        pattern.lastIndex = 0;
        let match;

        while ( ( match = pattern.exec( source ) ) !== null ) {
            const start = match.index;
            const end = start + match[ 0 ].length;
            if ( !isWordChar( source[ start - 1 ] ) && !isWordChar( source[ end ] ) ) {
                matches.push( { start, end, original: match[ 0 ] } );
            }
        }

        if ( !matches.length ) {
            return;
        }

        const fragment = document.createDocumentFragment();
        let cursor = 0;
        matches.forEach( ( entry ) => {
            fragment.appendChild( document.createTextNode( source.slice( cursor, entry.start ) ) );
            const key = entry.original.toLocaleLowerCase();
            const replacement = preserveCase( entry.original, dictionary[ key ] );
            if ( highlight ) {
                const span = document.createElement( 'span' );
                span.className = 'the-replacement';
                span.textContent = replacement;
                span.title = 'Original: ' + entry.original;
                fragment.appendChild( span );
            } else {
                fragment.appendChild( document.createTextNode( replacement ) );
            }
            cursor = entry.end;
        } );
        fragment.appendChild( document.createTextNode( source.slice( cursor ) ) );
        node.parentNode.replaceChild( fragment, node );
    }

    function processContent( root ) {
        if ( !root || !root.ownerDocument || root.nodeType !== 1 ) {
            return;
        }
        if ( root.matches( ignoredSelector ) || root.closest( ignoredSelector ) ) {
            return;
        }
        const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT );
        const pending = [];
        while ( walker.nextNode() ) {
            const node = walker.currentNode;
            const parent = node.parentElement;
            if ( parent && !parent.closest( ignoredSelector ) ) {
                pending.push( node );
            }
        }
        pending.forEach( substitute );
    }

    mw.hook( 'wikipage.content' ).add( ( $content ) => {
        $content.each( function () {
            processContent( this );
        } );
    } );
}() );
