<nav class="app-main-nav navbar navbar-expand-lg navbar-light">
  <div class="container">
    <a class="navbar-brand" href="<?php echo get_bloginfo('url'); ?>"><?php echo get_bloginfo('name'); ?></a>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#app-main-nav" aria-controls="app-main-nav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="app-main-nav">
      <?php wp_nav_menu([
        'theme_location' => 'app-main-nav',
        'container_class' => 'app-main-nav__menu'
      ]); ?>
    </div>
  </div>
</nav>
<!-- /.app-main-nav -->
