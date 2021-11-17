<?php
/**
 * DokuWiki Plugin threejs (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Ben van Magill <ben.vanmagill16@gmail.com>
 */
class syntax_plugin_threejs_stl extends syntax_plugin_threejs_scene
{

    // Setup class variables
    public $scene = 'mesh'; // Path to the template js script on server
    public $ext   = 'stl'; // File Extension to connect pattern. Be mindful of potential conflicts with other media syntax pugins 

}

