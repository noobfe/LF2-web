const { src, dest, task, series, parallel } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const cleanCss = require('gulp-clean-css');
const merge = require('merge-stream');
const del = require('del');
const zip = require('gulp-zip');
const jsdoc = require('gulp-jsdoc3');

const DIST_DIR = 'dist/';

const JS_SRCS = [
    'src/js/utils.js',
    'src/js/jquery-3.2.1.js',
    'src/js/jquery-ui-1.12.1.js',
    'src/js/jszip.min.js',

    "src/js/Framework/AttachableInterface.js",
    "src/js/Framework/KeyboardEventInterface.js",
    "src/js/Framework/MouseEventInterface.js",

    "src/js/Framework/Config.js",
    "src/js/Framework/Record.js",
    "src/js/Framework/Replay.js",
    "src/js/Framework/Util.js",
    "src/js/Framework/DebugInfo.js",
    "src/js/Framework/Point.js",
    "src/js/Framework/Point3D.js",
    "src/js/Framework/GameObject.js",
    "src/js/Framework/Scene.js",
    "src/js/Framework/ResourceManager.js",
    "src/js/Framework/Level.js",
    "src/js/Framework/Game.js",
    "src/js/Framework/MouseManager.js",
    "src/js/Framework/KeyBoardManager.js",
    "src/js/Framework/Audio.js",

    'src/js/lf2/game/define.js',

    'src/js/lf2/enums/Bound.js',
    'src/js/lf2/enums/Effect.js',
    'src/js/lf2/enums/FrameStage.js',
    'src/js/lf2/enums/ItrKind.js',

    'src/js/lf2/game/Prefetch.js',
    'src/js/lf2/game/Bezier.js',
    'src/js/lf2/game/Utils.js',
    'src/js/lf2/game/KeyboardConfig.js',
    'src/js/lf2/game/KeyEventPool.js',
    'src/js/lf2/game/Rectangle.js',
    'src/js/lf2/game/Cube.js',
    'src/js/lf2/game/Egg.js',

    'src/js/lf2/frame/ImageInformation.js',
    'src/js/lf2/frame/BmpInfo.js',
    'src/js/lf2/frame/Interaction.js',
    'src/js/lf2/frame/ObjectPoint.js',
    'src/js/lf2/frame/Body.js',
    'src/js/lf2/frame/BloodPoint.js',

    'src/js/lf2/frame/Frame.js',

    'src/js/lf2/objects/GameObject.js',
    'src/js/lf2/objects/GameObjectBall.js',
    'src/js/lf2/objects/GameObjectWeapon.js',
    'src/js/lf2/objects/GameObjectCharacter.js',
    'src/js/lf2/objects/pool/GameObjectPool.js',
    'src/js/lf2/objects/GameMapLayer.js',
    'src/js/lf2/objects/GameMap.js',
    'src/js/lf2/objects/pool/GameMapPool.js',
    'src/js/lf2/objects/ColorBar.js',

    'src/js/lf2/items/GameItem.js',
    'src/js/lf2/items/Character.js',
    'src/js/lf2/items/Ball.js',
    'src/js/lf2/items/Weapon.js',

    'src/js/lf2/items/behavior/AbstractBehavior.js',
    'src/js/lf2/items/behavior/CenterTrackerBehavior.js',
    'src/js/lf2/items/behavior/FasterTrackerBehavior.js',
    'src/js/lf2/items/behavior/HorizontalTrackerBehavior.js',
    'src/js/lf2/items/behavior/SpeedUpTrackerBehavior.js',
    'src/js/lf2/items/behavior/JulianBallBeginBehavior.js',
    'src/js/lf2/items/behavior/JulianBallTrackerBehavior.js',
    'src/js/lf2/items/behavior/FirzenDisasterFallDownBeginBehavior.js',
    'src/js/lf2/items/behavior/FirzenDisasterFallDownBehavior.js',

    'src/js/lf2/player/Team.js',
    'src/js/lf2/player/PlayerStatusPanel.js',
    'src/js/lf2/player/Player.js',

    'src/js/lf2/game/scenes/WorldScene.js',

    'src/js/lf2/level/LaunchMenu.js',
    'src/js/lf2/level/MySettingLevel.js',
    'src/js/lf2/level/LoadingLevel.js',
    'src/js/lf2/level/HelpLevel.js',
    'src/js/lf2/level/SelectionLevel.js',
    'src/js/lf2/level/FightLevel.js',

    'src/js/lf2/!MainGame.js',
];

task('buildJs', () => {
    return src(JS_SRCS)
        .pipe(sourcemaps.init())
        .pipe(terser({
            keep_classnames: true,
            keep_fnames: true,
            compress: { drop_console: true },
        }))
        .pipe(concat('js/load.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(DIST_DIR));
});

task('buildCss', async () => {
    await del(['dist/css/style.css']);
    return src([
        'src/css/jquery-ui-1.12.1.css',
        'src/css/style.css',
    ])
        .pipe(sourcemaps.init())
        .pipe(cleanCss())
        .pipe(concat('css/style.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(DIST_DIR));
});

task('clean', () => {
    return del([
        'dist/**',
        '!dist',
        '!dist/favicon.ico',
        '!dist/index.html',
    ]);
});

task('resources', () => {
    return merge([
        src('src/data/**').pipe(dest(DIST_DIR + 'data/')),
        src('src/image/**').pipe(dest(DIST_DIR + 'image/')),
        src('src/music/**').pipe(dest(DIST_DIR + 'music/')),
        src('src/css/**').pipe(dest(DIST_DIR + 'css/')),
    ]);
});

task('zipData', () => {
    return src('src/data/**/*.txt')
        .pipe(zip('zip/data.zip'))
        .pipe(dest(DIST_DIR));
});

task('zipResources', () => {
    return src(['src/**/music/*.m4a'])
        .pipe(zip('zip/resources.zip'))
        .pipe(dest(DIST_DIR));
});

task('zipEgg', () => {
    return src(['src/music/egg/*.m4a'])
        .pipe(zip('zip/egg.zip'))
        .pipe(dest(DIST_DIR));
});

task('docs', (cb) => {
    const config = require('./doc_conf.json');
    return src(['README.md', './src/**/*.js'], { read: false })
        .pipe(jsdoc(config, cb));
});

task('line', async () => {
    const fs = require('fs').promises;
    const results = await Promise.all(
        JS_SRCS.map(async (f) => {
            const data = await fs.readFile(f, 'utf8');
            return { name: f, count: data.split('\n').length };
        })
    );
    results.forEach(({ name, count }) => console.log(name, count));
});

task('default', series(
    'clean',
    'resources',
    parallel('buildJs', 'buildCss'),
    parallel('zipData', 'zipResources', 'zipEgg'),
    'docs'
));
