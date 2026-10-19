( function () {
    'use strict';

    const skippedTags = new Set( [
        'BUTTON', 'CODE', 'INPUT', 'KBD', 'MATH', 'OPTION', 'PRE',
        'SAMP', 'SCRIPT', 'SELECT', 'STYLE', 'SVG', 'TEXTAREA'
    ] );
    const skippedSelector = [
        'a', '[contenteditable]', '.mw-editsection', '.mw-jump-link',
        '.pride-rainbow', '.the-replacement', '.reference',
        '.mw-references-wrap'
    ].join( ', ' );

    function escapeRegExp( value ) {
        return value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
    }

    function preserveCase( original, replacement ) {
        if ( original === original.toUpperCase() && original !== original.toLowerCase() ) {
            return replacement.toUpperCase();
        }
        if ( original[ 0 ] === original[ 0 ].toUpperCase() &&
            original[ 0 ] !== original[ 0 ].toLowerCase() ) {
            return replacement[ 0 ].toUpperCase() + replacement.slice( 1 );
        }
        return replacement;
    }

    function processTextNode( node, pattern, dictionary, highlight ) {
        const source = node.nodeValue;
        pattern.lastIndex = 0;
        if ( !pattern.test( source ) ) {
            return;
        }
        pattern.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        while ( ( match = pattern.exec( source ) ) !== null ) {
            if ( match.index > lastIndex ) {
                fragment.appendChild( document.createTextNode( source.slice( lastIndex, match.index ) ) );
            }
            const original = match[ 0 ];
            const replacement = preserveCase( original, dictionary[ original.toLowerCase() ] );
            if ( highlight ) {
                const span = document.createElement( 'span' );
                span.className = 'the-replacement';
                span.textContent = replacement;
                span.title = 'Original: ' + original;
                fragment.appendChild( span );
            } else {
                fragment.appendChild( document.createTextNode( replacement ) );
            }
            lastIndex = pattern.lastIndex;
        }
        if ( lastIndex < source.length ) {
            fragment.appendChild( document.createTextNode( source.slice( lastIndex ) ) );
        }
        node.parentNode.replaceChild( fragment, node );
    }

    function replaceWords() {
        const root = document.querySelector( '#mw-content-text' );
        const configured = mw.config.get( 'wgTheReplacements', {} );
        const highlight = mw.config.get( 'wgTheHighlight', true );
        if ( !root || !configured || typeof configured !== 'object' ) {
            return;
        }
        const dictionary = Object.create( null );
        for ( const [ source, target ] of Object.entries( configured ) ) {
            if ( source.trim() && typeof target === 'string' ) {
                dictionary[ source.toLowerCase() ] = target;
            }
        }
        const words = Object.keys( dictionary ).sort( ( a, b ) => b.length - a.length );
        if ( !words.length ) {
            return;
        }
        const pattern = new RegExp(
            '(?<![\\p{L}\\p{N}_])(?:' + words.map( escapeRegExp ).join( '|' ) + ')(?![\\p{L}\\p{N}_])',
            'giu'
        );
        const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT, {
            acceptNode( node ) {
                const parent = node.parentElement;
                if ( !parent || !node.nodeValue.trim() ||
                    skippedTags.has( parent.tagName ) ||
                    parent.closest( skippedSelector ) ) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        } );
        const nodes = [];
        while ( walker.nextNode() ) {
            nodes.push( walker.currentNode );
        }
        nodes.forEach( ( node ) => processTextNode( node, pattern, dictionary, highlight ) );
    }

    // Use the same MediaWiki content hook as Extension:Pride.
    mw.hook( 'wikipage.content' ).add( replaceWords );
}() );
