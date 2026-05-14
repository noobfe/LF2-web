// All imports are dynamic to guarantee execution order.
// Static imports are hoisted by the JS engine regardless of their position,
// so window.Framework / window.jQuery would be set too late for IIFE files.

import './utils.js';

// 1. Set up globals FIRST — zero-import file, runs synchronously
await import('./framework-init.js');

// 2. jQuery must be on window before jquery-ui executes (UMD global check)
const $ = (await import('jquery')).default;
window.$ = $;
window.jQuery = $;
await import('jquery-ui/dist/jquery-ui.js');
await import('jquery-ui/dist/themes/base/jquery-ui.css');

const JSZip = (await import('jszip')).default;
window.JSZip = JSZip;

// 3. ES modules without self-assignment — must be attached here
const { AttachableInterface } = await import('./Framework/AttachableInterface.js');
const { KeyboardEventInterface } = await import('./Framework/KeyboardEventInterface.js');
const { MouseEventInterface } = await import('./Framework/MouseEventInterface.js');
const { Config } = await import('./Framework/Config.js');
Framework.AttachableInterface = AttachableInterface;
Framework.KeyboardEventInterface = KeyboardEventInterface;
Framework.MouseEventInterface = MouseEventInterface;
Framework.Config = Config;

// Self-assigning ES modules (Framework.X = X at end of each file)
await import('./Framework/Point.js');
await import('./Framework/Point3D.js');
await import('./Framework/Util.js');
await import('./Framework/DebugInfo.js');
await import('./Framework/GameObject.js');
await import('./Framework/Scene.js');

// IIFE singletons — must run after Framework.Config is set
await import('./Framework/Record.js');
await import('./Framework/Replay.js');
await import('./Framework/ResourceManager.js');
await import('./Framework/Game.js');
await import('./Framework/MouseManager.js');
await import('./Framework/KeyBoardManager.js');

// Self-assigning ES modules
await import('./Framework/Level.js');
await import('./Framework/Audio.js');

await import('./lf2/game/define.js');

// Enums without self-assignment — must be attached here
const { Bound } = await import('./lf2/enums/Bound.js');
const { Effect } = await import('./lf2/enums/Effect.js');
const { FrameStage } = await import('./lf2/enums/FrameStage.js');
const { ItrKind } = await import('./lf2/enums/ItrKind.js');
lf2.Bound = Bound;
lf2.Effect = Effect;
lf2.FrameStage = FrameStage;
lf2.ItrKind = ItrKind;

// Self-assigning ES modules (lf2.X = X at end of each file)
await import('./lf2/game/Prefetch.js');
await import('./lf2/game/Bezier.js');
await import('./lf2/game/Utils.js');
await import('./lf2/game/KeyEventPool.js');
await import('./lf2/objects/pool/GameObjectPool.js');
await import('./lf2/objects/pool/GameMapPool.js');
await import('./lf2/frame/ImageInformation.js');
await import('./lf2/items/behavior/AbstractBehavior.js');

await import('./lf2/game/Rectangle.js');
await import('./lf2/game/Cube.js');
await import('./lf2/game/KeyboardConfig.js');
await import('./lf2/game/CollisionSearchTree.js');
await import('./lf2/frame/BloodPoint.js');
await import('./lf2/frame/Body.js');
await import('./lf2/objects/ColorBar.js');

await import('./lf2/game/Egg.js');

await import('./lf2/frame/Interaction.js');
await import('./lf2/frame/BmpInfo.js');
await import('./lf2/frame/Frame.js');
await import('./lf2/objects/GameMapLayer.js');
await import('./lf2/player/Team.js');

await import('./lf2/frame/ObjectPoint.js');

await import('./lf2/objects/GameObject.js');
await import('./lf2/objects/GameObjectBall.js');
await import('./lf2/objects/GameObjectWeapon.js');
await import('./lf2/objects/GameObjectCharacter.js');
await import('./lf2/objects/GameMap.js');

await import('./lf2/items/GameItem.js');
await import('./lf2/items/Character.js');
await import('./lf2/items/Ball.js');
await import('./lf2/items/Weapon.js');

await import('./lf2/items/behavior/CenterTrackerBehavior.js');
await import('./lf2/items/behavior/FasterTrackerBehavior.js');
await import('./lf2/items/behavior/HorizontalTrackerBehavior.js');
await import('./lf2/items/behavior/SpeedUpTrackerBehavior.js');
await import('./lf2/items/behavior/JulianBallBeginBehavior.js');
await import('./lf2/items/behavior/JulianBallTrackerBehavior.js');
await import('./lf2/items/behavior/FirzenDisasterFallDownBeginBehavior.js');
await import('./lf2/items/behavior/FirzenDisasterFallDownBehavior.js');

await import('./lf2/player/PlayerStatusPanel.js');
await import('./lf2/player/Player.js');

await import('./lf2/game/scenes/WorldScene.js');

await import('./lf2/level/LaunchMenu.js');
await import('./lf2/level/MySettingLevel.js');
await import('./lf2/level/LoadingLevel.js');
await import('./lf2/level/HelpLevel.js');
await import('./lf2/level/SelectionLevel.js');
await import('./lf2/level/FightLevel.js');

await import('./lf2/MainGame.js');
