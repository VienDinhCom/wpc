<?php
require_once(get_template_directory() . '/global/global.php');

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('vendor-styles', get_theme_file_uri('assets/vendor/vendor.css'), array(), 'latest');
    wp_enqueue_style('app-styles', get_theme_file_uri('assets/app/app.css'), array(), 'latest');
    wp_enqueue_script('vendor-scripts', get_theme_file_uri('assets/vendor/vendor.js'), array(), 'latest', true);
    wp_enqueue_script('app-scripts', get_theme_file_uri('assets/app/app.js'), array(), 'latest', true);
});
