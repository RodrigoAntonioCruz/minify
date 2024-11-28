import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import csso from 'gulp-csso';
import terser from 'gulp-terser';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import { deleteAsync } from 'del';

const hash = Date.now();

const paths = {
  html: 'src/**/*.html',
  css: [
    'src/assets/css/style-one.css',
    'src/assets/css/style-two.css'
  ],
  js: [
    'src/assets/js/script-one.js',
    'src/assets/js/script-two.js'
  ],
  static: [
    'src/assets/svg/**/*',
    'src/assets/img/**/*'
  ],
  dest: 'dist'
};

// Tarefa para limpar a pasta de destino
export const clean = () => deleteAsync([paths.dest]);

// Tarefa para minificar HTML
export const minifyHtml = () => {
  return gulp.src(paths.html)
    .pipe(htmlmin({
      collapseWhitespace: true, // Remove espaços em branco desnecessários
      removeComments: true, // Remove todos os comentários
      minifyCSS: true, // Minifica CSS inline
      minifyJS: true, // Minifica JS inline
      removeEmptyAttributes: true, // Remove atributos vazios
      removeAttributeQuotes: true, // Remove aspas desnecessárias em atributos
      collapseInlineTagWhitespace: true, // Remove quebras de linha em tags inline
      keepClosingSlash: false, // Remove barras de fechamento de tags autossuficientes
      sortAttributes: true, // Ordena atributos para consistência
      sortClassName: true, // Ordena classes no atributo `class`
      decodeEntities: true // Decodifica entidades HTML
    }))
    .pipe(gulp.dest(paths.dest)); // Copiar para a raiz de dist
};

// Tarefa para minificar e concatenar CSS em um único bundle
export const bundleCss = () => {
  return gulp.src(paths.css, { allowEmpty: true })
    .pipe(concat(`bundle-${hash}.css`))
    .pipe(csso({ comments: false })) // Remove comentários
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${paths.dest}/assets/css`));
}

// Tarefa para minificar e concatenar JS em um único bundle
export const bundleJs = () => {
  return gulp.src(paths.js)
    .pipe(concat(`bundle-${hash}.js`))
    .pipe(terser({
      mangle: true, // Obfuscate variáveis e funções
      compress: { // Remove espaços desnecessários e otimiza
        drop_console: true, // Remove console.log
        drop_debugger: true // Remove debugger
      },
      format: {
        comments: false // Remove todos os comentários
      }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${paths.dest}/assets/js`));
};

// Tarefa para copiar imagens para uma única pasta
export const copyStatic = () => {
  return gulp.src(paths.static, { allowEmpty: true })
    .pipe(gulp.dest(`${paths.dest}/assets/img`)); // Copiar para assets/img
};

// Substituir referências a arquivos CSS e JS no HTML pelos bundles
export const replaceHtml = () => {
  return gulp.src(`${paths.dest}/**/*.html`)
    .pipe(
      replace(
        /<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi,
        '' // Remove todas as tags <link rel="stylesheet">
      )
    )
    .pipe(
      replace(
        /<script[^>]*src=["']?[^"']*\.js["']?[^>]*><\/script>/gi,
        '' // Remove todas as tags <script src="*.js"></script>
      )
    )
    .pipe(
      replace(
        /<\/head>/i,
        `<link rel="stylesheet" href="assets/css/bundle-${hash}.min.css"></head>` // Insere o bundle CSS antes de </head>
      )
    )
    .pipe(
      replace(
        /<\/body>/i,
        `<script src="assets/js/bundle-${hash}.min.js"></script></body>` // Insere o bundle JS antes de </body>
      )
    )
    .pipe(gulp.dest(paths.dest)); // Sobrescrever arquivos na raiz de dist
};


// Tarefa padrão (executa todas as tarefas em sequência)
export const build = gulp.series(
  clean,
  gulp.parallel(minifyHtml, bundleCss, bundleJs, copyStatic),
  replaceHtml
);

export default build;
