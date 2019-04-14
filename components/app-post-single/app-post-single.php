<?php the_post(); ?>

<?php wpc_component('app-header', ['title' => get_the_title()]); ?>

<article class="app-post-single">
  <div class="container">
    <div class="row">
      <div class="col-8">
        <div class="app-post-single__body">
          <?php the_content(); ?>
        </div>
      </div>
      <div class="col-4">
        Sidebar
      </div>
    </div>
  </div>
</article>
<!-- /.app-post-single -->

<?php wpc_component('app-footer'); ?>
