<?php

/**
 * Action component of threejs plugin
 */
class action_plugin_threejs extends \dokuwiki\Extension\ActionPlugin
{   
    /** @var $helper helper_plugin_latexcaption */
    var $helper = null;

    /**
     * Registers a callback function for a given event
     *
     * @param \Doku_Event_Handler $controller
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('PLUGIN_MOVE_HANDLERS_REGISTER', 'BEFORE', $this, 'handle_move_register');
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this, 'handle_tpl_metaheader_output');
    }

    public function handle_move_register(Doku_Event $event, $params) {
        $event->data['handlers']['threejs'] = array($this, 'rewrite_media');
    }

    public function rewrite_media($match, $state, $pos, $pluginname, helper_plugin_move_handler $handler) {
        $handler->media($match, $state, $pos);
    }

    public function handle_tpl_metaheader_output(Doku_Event &$event, $param) {

        if (!$this->$helper)
                $this->$helper = plugin_load('helper', 'threejs');

        list($base, $module, $examples) = $this->$helper->getPaths();

        // Ensure the threejs import map is loaded before any modules.
        array_unshift(
            $event->data['script'], 
            array(
                'type'    => 'importmap',
                '_data'   => '{"imports": {"three": "'.$module.'"}}',
            )
        );
    }
}
