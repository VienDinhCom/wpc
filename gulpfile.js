const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const path = require('path');
const colors = require('colors');
const cssnano = require('cssnano');
const $ = require('gulp-load-plugins')();
const postcssUrl = require('postcss-url');
const browserSync = require('browser-sync');
const autoprefixer = require('autoprefixer');
const bufferReplace = require('buffer-replace');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const postcssCopyAssets = require('postcss-copy-assets');

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

function getPaths() {
  const root = __dirname;
  const src = root;
  const dist = root;

  return {
    root,
    src: {
      base: src,
      components: path.join(src, 'components'),
      global: path.join(src, 'global'),
      vendor: path.join(src, 'vendor'),
    },
    dist: {
      base: dist,
      assets: path.join(dist, 'assets'),
      app: path.join(dist, 'assets/app'),
      vendor: path.join(dist, 'assets/vendor'),
    },
  };
}

function logErrors(filePath, messages) {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array.');
  }

  if (messages.length) {
    const newFilePath = filePath.replace(`${getPaths().root}`, '').slice(1);
    console.log(newFilePath.underline); // eslint-disable-line

    messages.forEach(function({ severity, line, column, message }) {
      console.log( // eslint-disable-line
        ` ${colors.grey(`${line}:${column}`)} ${
          ' ✖ '[severity === 2 ? 'red' : 'green']
        } ${message}`
      );
    });

    console.log('\n'); // eslint-disable-line
  }
}

function getComponentFilePaths(ext) {
  const { components } = getPaths().src;
  const globalFile = path.join(getPaths().src.base, `global/global${ext}`);
  const files = fs
    .readdirSync(components)
    .filter(function(component) {
      return fs.lstatSync(path.join(components, component)).isDirectory();
    })
    .map(function(component) {
      return path.join(components, component, component + ext);
    })
    .filter(function(file) {
      return fs.existsSync(file) && fs.lstatSync(file).isFile();
    });

  if (fs.existsSync(globalFile) && fs.lstatSync(globalFile).isFile()) {
    files.unshift(globalFile);
  }

  return files;
}

function checkComponentNames() {
  const prefix = 'app-';
  const componentDir = getPaths().src.components;

  const errorComponents = fs
    .readdirSync(componentDir)
    .filter(
      component =>
        fs.lstatSync(path.join(componentDir, component)).isDirectory() &&
        !component.startsWith(prefix)
    )
    .map(component => ` ${component}`);

  const errorLength = errorComponents.length;

  if (errorLength) {
    console.log( // eslint-disable-line
      `\n ${colors.grey(`ERROR`)} ${' ✖ '.red} The name of ${
        errorLength > 1 ? 'these' : 'this'
      } component${
        errorLength > 1 ? 's' : ''
      } [${errorComponents} ] must start with app-[name].\n`
    );
    if (isTest || isProd) process.exit(1);
  }
}

gulp.task('styles', function() {
  checkComponentNames();

  return gulp
    .src(getComponentFilePaths('.scss'))
    .pipe($.sourcemaps.init())
    .pipe(
      $.tap(function(styleFile) {
        const component = path.basename(styleFile.path).replace('.scss', '');

        if (component === 'global') {
          return styleFile.contents
            .toString()
            .split(';')
            .filter(line => line.indexOf('@import') >= 0)
            .forEach(line => {
              const currentPath = line
                .split("'")
                .join('"')
                .split('"')[1];

              const newPath = path.join(getPaths().src.global, currentPath);

              styleFile.contents = bufferReplace( // eslint-disable-line
                Buffer.from(styleFile.contents),
                currentPath,
                newPath
              );
            });
        }

        if (styleFile.contents.toString().indexOf(':host') !== 0) {
          logErrors(styleFile.path, [
            {
              severity: 2,
              line: 1,
              column: 1,
              message: `Missing the ':host' selector at the first line.`,
            },
          ]);

          if (isTest || isProd) process.exit(1);

          return null;
        }

        styleFile.contents = bufferReplace( // eslint-disable-line
          Buffer.from(styleFile.contents),
          ':host',
          `/* Component: .${component}\n--------------------------------------------------*/\n.${component}`
        );

        return null;
      })
    )
    .pipe(
      $.stylelint({
        failAfterError: isTest || isProd,
        fix: true,
        reporters: [{ formatter: 'string', console: true }],
        syntax: 'scss',
      })
    )
    .pipe($.concat('app.css', { newLine: '\n' }))
    .pipe(
      $.sass({ outputStyle: 'expanded' }).on(
        'error',
        ({ file, line, column, message }) => {
          const fileName = `${path
            .dirname(file)
            .split(path.sep)
            .pop()}.scss`;

          const filePath = file.split('app.css').join(fileName);

          logErrors(filePath, [
            {
              severity: 2,
              line,
              column,
              message,
            },
          ]);
        }
      )
    )
    .pipe(
      $.if(
        isProd,
        $.postcss([
          postcssPresetEnv(),
          autoprefixer(),
          cssnano({
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
              },
            ],
          }),
        ])
      )
    )
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(getPaths().dist.app))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function scripts() {
  checkComponentNames();

  return gulp
    .src(getComponentFilePaths('.js'))
    .pipe($.sourcemaps.init())
    .pipe(
      $.if(function(file) {
        return path.basename(file.path) !== 'global.js';
      }, $.insert.prepend("jQuery(':host').exists(function() {\n"))
    )
    .pipe(
      $.if(function(file) {
        return path.basename(file.path) !== 'global.js';
      }, $.insert.prepend(
        '/* Component: :host\n--------------------------------------------------*/\n'
      ))
    )
    .pipe(
      $.if(function(file) {
        return path.basename(file.path) !== 'global.js';
      }, $.insert.append('\n});\n'))
    )
    .pipe(
      $.tap(function(scriptFile) {
        const component = path.basename(scriptFile.path).replace('.js', '');

        if (component === 'global') return null;

        scriptFile.contents = bufferReplace( // eslint-disable-line
          Buffer.from(scriptFile.contents),
          ':host',
          `.${component}`
        );

        return null;
      })
    )
    .pipe($.eslint({ fix: true }))
    .pipe(
      $.eslint.result(({ filePath, messages }) => logErrors(filePath, messages))
    )
    .pipe($.if(isTest || isProd, $.eslint.failAfterError()))
    .pipe(
      $.babel({
        sourceType: 'script',
        presets: ['@babel/env'],
      })
    )
    .pipe($.concat('app.js', { newLine: '\n\n' }))
    .pipe($.if(isProd, $.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(getPaths().dist.app))
    .on('end', function() {
      browserSync.reload();
    });
});

gulp.task('vendor-styles', function() {
  return gulp
    .src(path.join(getPaths().src.vendor, 'vendor.scss'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({ outputStyle: 'expanded' }))
    .pipe(
      $.postcss([
        postcssPresetEnv(),
        postcssImport(),
        postcssUrl({ url: 'rebase' }),
        postcssCopyAssets({
          base: path.join(getPaths().dist.assets, 'vendor/media'),
        }),
        autoprefixer(),
        cssnano({
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
            },
          ],
        }),
      ])
    )
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(getPaths().dist.vendor))
    .pipe(browserSync.stream());
});

gulp.task('vendor-scripts', function() {
  const scripts = require(path.join(getPaths().src.vendor, 'vendor.js')).map( // eslint-disable-line
    script => path.join(getPaths().src.vendor, script)
  );

  return gulp
    .src(scripts)
    .pipe($.sourcemaps.init())
    .pipe($.concat('vendor.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(getPaths().dist.vendor))
    .on('end', function() {
      browserSync.reload();
    });
});

gulp.task('vendor', gulp.parallel('vendor-scripts', 'vendor-styles'));

gulp.task('clean', function() {
  return del([getPaths().dist.base], { dot: true });
});

gulp.task('build', gulp.series(gulp.parallel('vendor', 'styles', 'scripts')));

gulp.task('serve', function() {
  browserSync({
    notify: false,
    logPrefix: ` https://github.com/maxvien `,
    server: getPaths().dist.base,
    open: false,
    port: 8080,
  });
});

gulp.task('watch', function() {
  gulp.watch(
    [path.join(getPaths().src.base, 'vendor/**/*.{scss,css}')],
    gulp.parallel('vendor-styles')
  );

  gulp.watch(
    [path.join(getPaths().src.base, 'vendor/**/*.js')],
    gulp.parallel('vendor-scripts')
  );

  gulp.watch(
    [
      path.join(getPaths().src.base, 'global/**/*.scss'),
      path.join(getPaths().src.components, '**/*.scss'),
    ],
    gulp.parallel('styles')
  );

  gulp.watch(
    [
      path.join(getPaths().src.base, 'global/**/*.js'),
      path.join(getPaths().src.components, '**/*.js'),
    ],
    gulp.parallel('scripts')
  );
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve')));
