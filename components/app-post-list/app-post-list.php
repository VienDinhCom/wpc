<?php
  wpc_component('app-header', [
    'title' => get_the_archive_title(),
    'desc' => get_the_archive_description()
  ]);
?>

<article class="app-post-list">
  <div class="container">
    <div class="row">
      <div class="col-8">
        <div class="app-post-list__body">
          <?php if (have_posts()) : ?>
            <?php while (have_posts()): the_post(); ?>
              <h2><?php the_title(); ?></h2>
              <?php the_content(); ?>
              <hr>
            <?php endwhile; ?>
            <?php the_posts_navigation(); ?>
          <?php else : ?>
          <?php _e('It seems we can’t find what you’re looking for. Perhaps searching can help.', 'wpc'); ?>
          <?php endif; ?>
        </div>
      </div>
      <div class="col-4">
        <?php wpc_component('app-sidebar'); ?>
      </div>
    </div>
  </div>
</article>
<!-- /.app-post-list -->

<?php wpc_component('app-footer'); ?>
