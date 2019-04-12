<h1>Post List</h1>

<?php
if ( have_posts() ) {
  while ( have_posts() ) {

      the_post(); ?>

      <h2><?php the_title(); ?></h2>

      <?php the_content(); ?>

  <?php }
}
?>

<?php wpc_component('app-header'); ?>
<?php wpc_component('app-footer'); ?>
