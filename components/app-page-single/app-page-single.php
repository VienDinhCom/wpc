<h1>Page Single</h1>

<?php
if ( have_posts() ) {
  while ( have_posts() ) {

      the_post(); ?>

      <h2><?php the_title(); ?></h2>

      <?php the_content(); ?>

  <?php }
}
?>
