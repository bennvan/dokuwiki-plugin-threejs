<?php

/**
 * DokuWiki Plugin threejs (Helper functions)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Ben van Magill <ben.vanmagill16@gmail.com>
 */

/**
 * Common functions
 */
class helper_plugin_threejs extends \dokuwiki\Extension\Plugin {

    function getPaths() {

        switch ($this->getConf('cdn')) {
            case 'local':
                $base = DOKU_PLUGIN.'threejs/vendor/three.js';
                $mod = $base.'/three.module.js';
                $ex = $base.'/examples';
                break;
            case 'unpkg':
                $base = 'https://unpkg.com/three@'.$this->getConf('cdn_version');
                $mod = $base.'/build/three.module.js';
                $ex = $base.'/examples';
                break;
            case 'custom':
                $base = $this->getConf('customcnd_base');
                $mod = $base.$this->getConf('customcnd_mod');
                $ex = $base.$this->getConf('customcnd_ex');
                break;
            
            default:
                $base = '';
                $mod = '';
                $ex = '';
                break;
        }

        return array($base, $mod, $ex);
    }
}

