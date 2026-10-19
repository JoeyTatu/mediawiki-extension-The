<?php

declare( strict_types = 1 );

namespace MediaWiki\Extension\The;

use MediaWiki\Hook\BeforePageDisplayHook;

/** Loads display-only substitutions on ordinary wiki pages. */
class Hooks implements BeforePageDisplayHook {
    public function onBeforePageDisplay( $out, $skin ): void {
        $replacements = $out->getConfig()->get( 'TheReplacements' );
        $safe = [];
        if ( is_array( $replacements ) ) {
            foreach ( $replacements as $source => $target ) {
                if ( is_string( $source ) && trim( $source ) !== '' && is_string( $target ) ) {
                    $safe[ $source ] = $target;
                }
            }
        }
        if ( $safe === [] ) {
            return;
        }

        $out->addJsConfigVars( 'wgTheReplacements', $safe );
        $out->addJsConfigVars( 'wgTheHighlight', (bool)$out->getConfig()->get( 'TheHighlight' ) );
        $out->addModules( 'ext.the' );
    }
}
