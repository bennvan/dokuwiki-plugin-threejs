<?php
/**
 * Options for the threejs plugin
 *
 * @author Ben van Magill <ben.vanmagill16@gmail.com>
 */

$lang['cdn'] = 'Should the scripts be delivered from server locally or CDN';
$lang['cdn_o_local'] = 'Local delivery';
$lang['cdn_o_unpkg'] = 'CDN at unpkg.com';
$lang['cdn_o_custom'] = 'Custom CDN';
$lang['cdn_version'] = 'Version of ThreeJS module to load if a CDN is selected above.';
$lang['customcdn_base'] = 'Retrieve the javascript files from this URL as base. eg.<code>https://cdn.skypack.dev</code> ';
$lang['customcdn_mod'] = 'Path to three js module (appended to base) eg.<code>/three@0.137.0</code>';
$lang['customcdn_ex'] = 'Path to three js examples folder (appended to base) eg. <code>/three/examples</code>';
$lang['autoload_max_fsize'] = 'Autoload 3D scene for files smaller than the value specified in bytes. <code>2000000B = 2MB</code>';