<?php wpc_component('app-header'); ?>

<section class="app-post-list">
	<div class="app-post-list__header">
		<h1>Post List</h1>
	</div>
	<div class="app-post-list__body">
		<?php if (have_posts()) : ?>
			<?php while (have_posts()): the_post(); ?>
				<h2><?php the_title(); ?></h2>
				<?php the_content(); ?>
        <hr>
			<?php endwhile; ?>
		<?php else : ?>
			No post
		<?php endif; ?>
	</div>
</section>
<!-- /.app-post-list -->

<?php wpc_component('app-footer'); ?>
