<?php
/**
 * Options for the threejs plugin
 *
 * @author Ben van Magill <ben.vanmagill16@gmail.com>
 */

$lang['cdn'] = 'Should the scripts be delivered from server locally or CDN';
$lang['cdn_o_local'] = 'Local delivery';
$lang['cdn_o_skypack'] = 'CDN at cdn.skypack.dev';
$lang['cdn_o_custom'] = 'Custom CDN';
$lang['customcdn_base'] = 'Retrieve the javascript files from this URL as base. eg.<code>https://cdn.skypack.dev/</code> ';
$lang['customcdn_mod'] = 'Path to three js module (appended to base) eg.<code>three</code>';
$lang['customcdn_ex'] = 'Path to three js examples folder (appended to base) eg. <code>three/examples/</code>';