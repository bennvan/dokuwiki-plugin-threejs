<?php
/**
 * Options for the threejs plugin
 *
 * @author Ben van Magill <ben.vanmagill16@gmail.com>
 */

$meta['cdn'] = array('multichoice', '_choices' => array('local', 'skypack', 'custom'));
$meta['customcdn_base'] = array('string');
$meta['customcdn_mod'] = array('string');
$meta['customcdn_ex'] = array('string');