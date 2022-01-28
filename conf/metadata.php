<?php
/**
 * Options for the threejs plugin
 *
 * @author Ben van Magill <ben.vanmagill16@gmail.com>
 */

$meta['cdn'] = array('multichoice', '_choices' => array('local', 'unpkg', 'custom'));
$meta['cdn_version'] = array('string');
$meta['customcdn_base'] = array('string');
$meta['customcdn_mod'] = array('string');
$meta['customcdn_ex'] = array('string');
$meta['autoload_max_fsize'] = array('numeric', '_min' => 0);