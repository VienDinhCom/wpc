<?php $props = get_query_var('WPC_PROPS'); ?>

<?php wpc_component('app-main-nav'); ?>

<header class="app-header">
  <div class="container">
    <h1 class="app-header__title"><?php echo $props['title']; ?></h1>
    <?php if ($props['desc']): ?>
      <p class="app-desc"><?php echo $props['desc']; ?></p>
    <?php endif; ?>
  </div>
</header>
<!-- /.app-header -->
