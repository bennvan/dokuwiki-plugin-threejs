<?php

/**
 * Action component of threejs plugin
 */
class action_plugin_threejs extends \dokuwiki\Extension\ActionPlugin
{

    /**
     * Registers a callback function for a given event
     *
     * @param \Doku_Event_Handler $controller
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('PLUGIN_MOVE_HANDLERS_REGISTER', 'BEFORE', $this, 'handle_move_register');
    }


    public function handle_move_register(Doku_Event $event, $params) {
        $event->data['handlers']['threejs'] = array($this, 'rewrite_media');
    }

    public function rewrite_media($match, $state, $pos, $pluginname, helper_plugin_move_handler $handler) {
        $handler->media($match, $state, $pos);
    }
}
