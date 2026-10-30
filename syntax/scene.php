<?php
/**
 * DokuWiki Plugin threejs (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Ben van Magill <ben.vanmagill16@gmail.com>
 */
class syntax_plugin_threejs_scene extends \dokuwiki\Extension\SyntaxPlugin
{

    // Setup class variables

    /** @var $helper helper_plugin_threejs */
    var $helper = null;

    public $scene = null; // Path to the template script 
    public $ext   = 'PLUGIN_THREEJS'; // File Extension to connect pattern. Be mindful of potential conflicts with other media syntax pugins 
    public $context = [];

    /** Returns plugin type*/
    public function getType()
    {
        return 'substition';
    }

    /** Returns paragraph handling type */
    public function getPType()
    {
        return 'block';
    }

    public function getSort()
    {
        return 310;
    }

    public function connectTo($mode)
    {
        $this->Lexer->addSpecialPattern('\{\{[^\}]*?(?:\.'.$this->ext.')[^\}]*?\}\}', $mode, 'plugin_threejs_' . $this->getPluginComponent());
    }

    // Build html attributes for tags, including style.
    protected function buildAttributes($attributes, $override_attributes = array())
    {

        $attributes      = array_merge_recursive($attributes, $override_attributes);
        $html_attributes = array();

        foreach ($attributes as $attribute => $value) {
            if ($attribute == 'class') {
                $value = trim(implode(' ', array_unique($value)));
            }
            if ($attribute == 'style') {
                $tmp = '';
                if (is_array($value)){
                    foreach ($value as $property => $val) {
                        $tmp .= "$property:$val;";
                    }
                    $value = $tmp;
                }  
            }
            if ($value) {
                $html_attributes[] = $attribute . '="' . hsc($value) . '"';
            }
        }
        return implode(' ', $html_attributes);
    }

    /** Handle syntax */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        // Load the helper
        if (!$this->helper)
                $this->helper = plugin_load('helper', 'threejs');

        // Keep the original markup for media alignment; parse custom flags separately.
        $mediaMatch = $match;
        $match = substr($match, 2, -2);
        // Split the title
        list($tmp, $title) = array_pad(explode('|', $match, 2), 2, null);
        // Try to split at ?, else &
        list($link, $flags) = array_pad(explode('?', $tmp, 2), 2, '');
        if (strpos($tmp, '?') === false && !media_isexternal(trim($tmp))) {
            list($link, $flags) = array_pad(explode('&', $tmp, 2), 2, '');
            if ($flags !== '') {
                $mediaMatch = '{{' . $link . '?' . $flags . ($title === null ? '' : '|' . $title) . '}}';
            }
        }
        $flags = str_replace(['&', '?'], ' ', $flags);
        $flags = preg_split('/\s+/', trim($flags), -1, PREG_SPLIT_NO_EMPTY);

        $p = class_exists(\dokuwiki\Parsing\ParserMode\Media::class)
            ? \dokuwiki\Parsing\ParserMode\Media::parseMedia($mediaMatch)
            : Doku_Handler_Parse_Media($mediaMatch);
        
        $handler->addCall(
                    $p['type'],
                    array($p['src'], $p['title'], $p['align'], $p['width'],
                    $p['height'], $p['cache'], $p['linking'], true),
                    null
                );

        $p['uid'] = substr(md5(uniqid()),0,4);
        $p['flags'] = $flags;

        list($base, $mod, $ex) = $this->helper->getPaths();

        foreach($flags as $flag) {
            // Try to split key from variable
            list($key, $val) = array_pad(explode('=', $flag, 2), 2, '1');
            if ($val === '') $val = '1';
            $p[$key] = hsc($val);
        }
        $p['source'] = $base;
        $p['module'] = $mod;
        $p['examples'] = $ex;

        return $p;
    }

    /** Render syntax */
    public function render($mode, Doku_Renderer $renderer, $data)
    {
        if ($mode !== 'xhtml') return false;

        if (empty($data)) return False;

        /** @var Doku_Renderer_xhtml $renderer */
        global $ID;

        if ($data['linking'] === 'linkonly') {
            $method = $data['type'] === 'externalmedia' ? 'externalmedia' : 'internalmedia';
            $renderer->$method($data['src'], $data['title'], $data['align'], $data['width'], $data['height'],
                $data['cache'], $data['linking']);
            return true;
        }

        // Set default values
        $fsize = 0;
        if ($data['type'] === 'internalmedia') {
            $data['src'] = (new \dokuwiki\File\MediaResolver($ID))->resolveId($data['src'], $renderer->date_at, true);
            $exists = media_exists($data['src'], $renderer->date_at, false, true);
            if ($exists) {
                $fn = mediaFN($data['src']);
                $fsize = filesize($fn);
                $fsize_str = ($fsize >= 1<<20) ? number_format($fsize/(1<<20),2)."MB" : number_format($fsize/(1<<10),2)."KB";
                $fname = basename($fn);
            }
            
        }

        $data['url'] = ml($data['src'], '', true, '&');
        $data['fname'] = isset($fname) ? $fname.' ('.$fsize_str.')' : $data['src'];
        if (!empty($data['noautoload'])){
            $data['autoload'] = false;
        } else {
            $data['autoload'] = ($fsize && $fsize < $this->getConf('autoload_max_fsize'));
        }

        // Set the class instance context;
        $this->context = $data;
        // dbg($data);


        // Setup the styles
        $attrs = [
            'title' => '',
            'id'    => $data['uid'],
            'class' => ['threejs-canvas'],
            'style' => ['width'=>'1920px','height'=>'600px']
        ];
        $attrs['title'] = $data['title'];
        $attrs['class'][] = $data['align'];
        if (!empty($data['width'])) {
            $attrs['style']['width'] = $data['width'].'px';
            if (empty($data['height'])) $attrs['style']['height'] = $data['width']/16*9 .'px';
        }
        if (!empty($data['height'])) $attrs['style']['height'] = $data['height'].'px';


        // Render to the page
        $out  = '<div class="threejs-wrapper">';
        $out .= '<a title="Download" href="'.hsc($data['url']).'" class="threejs-model-download" role="button" rel="noopener"></a>';
        $out .= '<div '.$this->buildAttributes($attrs).' >'.DOKU_LF;
        $out .= '<div class="threejs-info">';
        $out .= '<p>'.hsc($data['fname']).'</p>';
        $out .= '<button class="threejs-load">Load Model</button>';
        $out .= '</div>';
        $out .= '<script type="module">'.DOKU_LF;
        $out .= $this->getScene();
        $out .= '</script>'.DOKU_LF.'</div></div>'.DOKU_LF;


        $renderer->doc .= $out; 
        return true;
    }

    public function getScene(){
        $content = file_get_contents(DOKU_PLUGIN.'threejs/scenes/'.$this->scene.'.js');
        $content = preg_replace_callback('/{{([a-zA-Z0-9_-]+)}}/', 
            function ($match) {
                return $this->context[$match[1]] ?? '';
            }, 
            $content
        );
        return $content;
    }

}

