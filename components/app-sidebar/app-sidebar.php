<?php
/**
 * The sidebar containing the main widget area
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package hello
 */

if ( ! is_active_sidebar( 'sidebar-1' ) ) {
	return;
}
?>

<aside id="secondary" class="widget-area">
	<?php dynamic_sidebar( 'sidebar-1' ); ?>
  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minima voluptatum incidunt voluptate accusamus voluptatem rem iusto sunt harum nisi recusandae! Recusandae laboriosam, sunt sapiente enim deserunt excepturi quo sint iure!
</aside><!-- #secondary -->
