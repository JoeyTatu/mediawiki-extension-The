<?php
/**
 * Hooks for the The extension.
 *
 * @license MIT
 */

namespace MediaWiki\Extension\The;

use MediaWiki\Output\Hook\BeforePageDisplayHook;
use OutputPage;
use Skin;

class Hooks implements BeforePageDisplayHook {

    /**
     * @param OutputPage $out
     * @param Skin $skin
     */
    public function onBeforePageDisplay( $out, $skin ): void {
        $config = $out->getConfig();
        $replacements = $config->get( 'TheReplacements' );

        // Only expose validated plain-string mappings to client-side code.
        $safe = [];
        if ( is_array( $replacements ) ) {
            foreach ( $replacements as $source => $target ) {
                if ( is_string( $source ) && $source !== '' && is_string( $target ) ) {
                    $safe[$source] = $target;
                }
            }
        }

        $out->addJsConfigVars( [
            'wgTheReplacements' => $safe,
            'wgTheHighlight' => (bool)$config->get( 'TheHighlight' )
        ] );
        $out->addModules( 'ext.the' );
    }
}
