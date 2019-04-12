<?php

function wpc_component($name, $props = array()) {
  set_query_var('WPC_PROPS', $props);
  return get_template_part('components/' . $name . '/' . $name);
}

function wpc_render() {

  if (is_home() && is_front_page()) {
    return wpc_component('app-post-list');
  } else {
    if (is_home()) return wpc_component('app-page-single');
    if (is_front_page()) return wpc_component('app-front-page');
  }

  if (is_404()) return wpc_component('app-error');
  if (is_page()) return wpc_component('app-page-single');
  if (is_single()) return wpc_component('app-post-single');
  if (is_archive()) return wpc_component('app-archive');
  if (is_search()) return wpc_component('app-search');
}
