# HTML5-LF2 设计思路文档

> Little Fighter 2 网页移植版 · 架构与设计分析

---

## 目录

1. [整体架构](#1-整体架构)
2. [分层设计](#2-分层设计)
3. [游戏循环](#3-游戏循环)
4. [帧动画状态机](#4-帧动画状态机)
5. [物理系统](#5-物理系统)
6. [碰撞检测](#6-碰撞检测)
7. [伤害系统](#7-伤害系统)
8. [投射物行为系统](#8-投射物行为系统)
9. [输入系统](#9-输入系统)
10. [对象池模式](#10-对象池模式)
11. [场景管理](#11-场景管理)
12. [构建系统](#12-构建系统)
13. [数据驱动设计](#13-数据驱动设计)
14. [设计模式汇总](#14-设计模式汇总)
15. [关键设计决策](#15-关键设计决策)

---

## 1. 整体架构

项目分为两层：**通用游戏引擎框架层**和**LF2 游戏逻辑层**，两层通过继承解耦。

```
src/js/
├── Framework/          # 通用游戏引擎（不含 LF2 逻辑）
│   ├── Game.js         # 游戏主控、帧循环
│   ├── Level.js        # 场景基类（生命周期）
│   ├── GameObject.js   # 所有可绘制对象的基类
│   ├── ResourceManager.js
│   ├── Audio.js
│   ├── KeyboardEventInterface.js
│   └── ...
└── lf2/                # LF2 游戏逻辑
    ├── !MainGame.js    # 游戏入口，注册所有场景
    ├── game/define.js  # 全局常量
    ├── enums/          # 枚举（Effect、ItrKind、FrameStage、Bound）
    ├── frame/          # 帧数据结构（Frame、Interaction、Body）
    ├── objects/        # 游戏对象基类（GameItem、GameMap、Pool）
    ├── items/          # 具体实体（Character、Ball、Weapon + Behavior）
    ├── level/          # 具体场景（菜单、选角、战斗……）
    └── player/         # 玩家与团队管理
```

**类继承关系：**

```
Framework.GameObject
├── lf2.GameItem          ← 所有动态实体基类（物理、帧、碰撞）
│   ├── lf2.Character     ← 角色（输入、HP/MP、连击）
│   ├── lf2.Ball          ← 投射物（追踪行为、生命时间）
│   └── lf2.Weapon        ← 武器（摩擦、持有/投掷状态）
└── lf2.GameMap           ← 静态地图背景

Framework.Level
├── LaunchMenu            ← 主菜单
├── LoadingLevel          ← 加载场景
├── SelectionLevel        ← 角色选择
├── FightLevel            ← 战斗场景
├── HelpLevel             ← 帮助
└── MySettingLevel        ← 按键设置
```

---

## 2. 分层设计

### 2.1 为什幺要分层

引擎层（Framework）不知道 LF2 的任何概念，只管理"有位置的可绘制对象"和"有生命周期的场景"。LF2 层通过继承覆盖生命周期方法来注入游戏逻辑。

这样做的好处：
- Framework 可复用于其他游戏
- 修改碰撞逻辑不影响渲染代码
- 测试各层可以独立进行

### 2.2 Framework 层职责

| 类 | 职责 |
|----|------|
| `Game` | 唯一单例，持有当前 Level，驱动帧循环 |
| `Level` | 定义场景生命周期（5个阶段） |
| `GameObject` | 持有 3D 坐标、父子关系、脏标记，提供 attach/detach |
| `ResourceManager` | 异步加载图片/音效/ZIP |
| `Audio` | 空间音效（根据位置计算音量和左右声道） |

### 2.3 LF2 层职责

| 类 | 职责 |
|----|------|
| `GameItem` | 速度/重力/摩擦、帧推进、ITR/BDY 碰撞 |
| `Character` | 按键驱动状态机、HP/MP 回复、掉落值 |
| `Ball` | 追踪行为委托、生命倒计时、反弹 |
| `Weapon` | 持有/投掷状态、掉地摩擦 |
| `FightLevel` | 初始化场景、判断胜负、管理状态面板 |

---

## 3. 游戏循环

采用**固定时间步长**（Fixed Timestep）策略，解耦逻辑更新和渲染。

```
requestAnimationFrame
        │
        ▼
  now >= nextGameTick?
     YES → update()   → 推进物理、帧状态、碰撞
          → draw()    → 绘制脏矩形区域
          → nextGameTick += skipTicks (1000/60 ms)
     NO  → 跳过，等待下一帧
```

**脏矩形优化（Dirty Rectangle）：**
不重绘整个 Canvas，只重绘发生变化的区域。`GameObject._getChangedRect()` 遍历场景树，收集所有 `isObjectChanged === true` 的对象的新旧包围盒合并后作为重绘区域。

---

## 4. 帧动画状态机

这是整个游戏引擎的核心设计。LF2 的所有游戏逻辑都编码在**帧数据**里——每一帧不只是一张图，而是包含：

```
Frame {
  id          : 帧编号
  pictureIndex: 图片索引（精灵表中的哪一帧）
  wait        : 持续几个 tick
  nextFrameId : 结束后跳转到哪帧
  dvx/dvy/dvz : 此帧给予对象的速度偏移
  state       : 当前所处的动作状态（FrameStage 枚举）
  mp          : 消耗蓝量
  hit { a, d, j, Fa, Fj, ... } : 各按键对应的帧跳转目标
  itr[]       : 攻击框列表（Interaction 数组）
  bdy         : 受击框（Body）
  opoint      : 发射点（生成投射物）
  bpoint      : 流血点
  soundPath   : 进入此帧时播放的音效
}
```

### 4.1 帧推进逻辑

每 tick 执行：

```
_updateCounter++
if (_frameForceChange || _updateCounter >= frame.wait):
    nextId = _getNextFrameId()   ← 由子类覆盖
    setFrameById(nextId)
    updateVelocity()             ← 应用 dvx/dvy/dvz
    _updateCounter = 0
```

### 4.2 Character 的帧跳转决策

`Character._getNextFrameId()` 是一个二维查找表：

```
DEFAULT_KEY[当前 FrameStage][当前按键组合] → 目标帧 ID
```

例如：
- 站立状态 + 按 A → 随机出拳帧
- 跑步状态 + 按 J → 跳跃攻击帧
- 跳跃状态 + 按 D → 空中防御帧

按键组合用**位运算**表示（LEFT | RIGHT | JUMP | ATTACK …），查表时屏蔽方向键只取功能键，避免组合爆炸。

### 4.3 特殊帧 ID 约定

| 帧 ID | 含义 |
|-------|------|
| `0` | 重复当前帧（循环动画） |
| `999` | 回到默认状态 |
| `1000` | 销毁此对象 |
| `1100–1299` | 隐身（跳过碰撞检测） |
| 负数 | 翻转方向后执行该帧 |

---

## 5. 物理系统

### 5.1 坐标系

使用 **3D 坐标**（x, y, z）：
- `x`：水平位置
- `y`：垂直位置（屏幕向下为正）
- `z`：纵深（向屏幕内为负，正值表示在地面以上）

`z < 0` 时对象在空中，重力持续施加；`z >= 0` 时落地，施加摩擦。

### 5.2 重力与摩擦

```
每 tick：
  if z < 0:
      velocity.y += GRAVITY (1.7 px/tick²)   ← 空中重力
  if z > 0:
      z = 0; velocity.y = 0                   ← 落地清零纵向速度

  if on_ground:
      velocity.x *= (1 - friction)             ← 水平摩擦衰减
      if |velocity.x| < MIN_V: velocity.x = 0 ← 停止阈值
```

摩擦系数通过查找表（Lookup Table）而非线性计算，保证特定速度区间的手感与原版一致。

### 5.3 伤害速度

当角色被攻击时，`Interaction` 的 `dvx/dvy` 直接叠加到角色速度向量，实现击退和弹飞效果。

---

## 6. 碰撞检测

### 6.1 ITR / BDY 模型

LF2 使用**攻击框与受击框分离**的模型：
- `ITR`（Interaction）：攻击框，只有攻击帧才存在
- `BDY`（Body）：受击框，几乎每帧都存在

检测逻辑：遍历所有对象，对每对（攻击者 ITR，被攻击者 BDY）做矩形相交测试。

### 6.2 AABB 三维检测

```
碰撞条件（同时满足 XYZ 三轴）：
  minX_a ≤ maxX_b  AND  maxX_a ≥ minX_b   ← X 轴重叠
  minY_a ≤ maxY_b  AND  maxY_a ≥ minY_b   ← Y 轴重叠
  minZ_a ≤ maxZ_b  AND  maxZ_a ≥ minZ_b   ← Z 轴（纵深）重叠
```

Z 轴宽度（`zwidth`）防止站在同一平面但纵深不同的对象误判碰撞。

### 6.3 Vrest / Arest 冷却机制

防止同一攻击帧在同一目标上持续触发：
- `vrest`：同一目标的再命中冷却（tick 数）
- `arest`：切换目标的冷却

实现方式：用 Map 记录每个目标的最后命中 tick，检测时先查表过滤。

### 6.4 CollisionSearchTree

对多对象场景，用 BSP 树减少无效的遍历对数，降低复杂度从 O(n²) 到接近 O(n log n)。

---

## 7. 伤害系统

### 7.1 掉落值（Fall Value）

`_fall`（0–100）是衡量角色被击打累积程度的指标：

```
被命中 → fall += Interaction.fall
每 tick → fall -= 0.45（自然恢复）

fall 区间对应不同受击动画：
  1–20   → 轻微踉跄（帧 220）
  21–30  → 被击退（帧 222）
  60–100 → 击飞（帧 180/186）
```

### 7.2 防御击破（BDefend）

`bdefend` 值累积超过阈值后，防御被打破，角色进入硬直状态。同样有自然恢复机制。

### 7.3 属性效果（Effect）

| Effect | 效果 |
|--------|------|
| 0 普通 | 标准伤害 |
| 1 刀刃 | 穿透部分防御 |
| 2 火焰 | 点燃（燃烧跑 BURN_RUN 状态） |
| 3 冰冻 | 冻结（进入冰冻帧 200） |
| 4 穿透 | 无视BDY直接命中 |

---

## 8. 投射物行为系统

### 8.1 策略模式（Strategy Pattern）

投射物追踪逻辑通过策略模式实现，运行时根据帧数据的 `FA` 字段选择行为：

```
AbstractBehavior
├── CenterTrackerBehavior     FA=1  追踪敌人中心，弧形轨迹
├── HorizontalTrackerBehavior FA=2  纯水平追踪
├── SpeedUpTrackerBehavior    FA=3  逐渐加速追踪
├── FasterTrackerBehavior     FA=10 高速追踪
├── JulianBallTrackerBehavior FA=14 Julian 连环炮
├── FirzenDisasterFallDown    FA=7  Firzen 冰柱下落
└── FirzenDisasterInit        FA=9  Firzen 冰柱初始化
```

每帧调用 `behavior.getVelocity()` 更新投射物方向，行为逻辑封装在各子类中，互不干扰。

### 8.2 追踪算法（以 CenterTracker 为例）

```
目标中心 = world.getEnemyCenter(owner)
方向向量 = normalize(目标 - 当前位置)
新速度   = 当前速度 * 0.9 + 方向向量 * 追踪力度
```

结合重力分量，形成弧形追踪轨迹，而非直线飞行。

### 8.3 生命时间

Ball 的 `_remainderTime` 每 tick 递减，归零后跳转到 `hit.d` 指定的消散帧（通常是消失动画）。不同投射物通过数据文件配置不同的生命时间。

---

## 9. 输入系统

### 9.1 按键状态位标志

所有按键状态压缩为一个整数的各个位：

```
0b00000001  LEFT
0b00000010  RIGHT
0b00000100  UP（z 轴）
0b00001000  DOWN（z 轴）
0b00010000  JUMP
0b00100000  ATTACK
0b01000000  DEFEND
```

组合检测：`currentKey & (JUMP | ATTACK)` 等于同时按跳跃和攻击。

### 9.2 KeyEventPool 时序检测

双击冲刺、特殊技等需要**时序组合**的操作，通过事件队列检测：记录近 200ms 内的按键序列，匹配预定义的模式（如"左左"触发向左冲刺）。

### 9.3 MP 消耗前置检查

技能帧的 `mp` 字段定义消耗量。`Player.requestMp(cost)` 在帧跳转前检查是否有足够 MP，不足则阻止跳转（动作无法发出）。

---

## 10. 对象池模式

### 10.1 GameObjectPool（定义池）

存储从数据文件解析好的 GameItem **模板对象**（角色、武器、投射物的完整帧数据）。使用时通过 `get(id)` 获取引用，避免重复解析数据文件。

```
GameObjectPool.get(id) → 已解析的模板对象（只读）
场景中的实例 → 拷贝模板状态，独立运行
```

### 10.2 GameMapPool（地图池）

同理缓存地图背景层数据，9 张地图在游戏首次加载后驻留内存。

### 10.3 实例销毁

对象销毁时调用 `onDestroy()`，从场景树 detach，但模板数据保留在 Pool 中。下次生成同类型对象直接从 Pool 取模板，无需重新解析。

---

## 11. 场景管理

### 11.1 Level 生命周期（模板方法模式）

Framework 定义执行顺序，子类覆盖具体实现：

```
阶段 1: initializeProgressResource()  → 加载进度条自身的资源
阶段 2: loadingProgress()             → 显示加载界面
阶段 3: load()                        → 加载本场景资源
阶段 4: initialize()                  → 初始化游戏对象
阶段 5: update() / draw()             → 主循环
```

### 11.2 场景树（Composite 模式）

每个 `GameObject` 可以 attach 子对象，形成树状结构：

```
rootScene
└── WorldScene（FightLevel）
    ├── GameMap（背景层）
    ├── Character × N（角色）
    │   └── Weapon（持有的武器）
    └── Ball × M（飞行中的投射物）
```

`draw()` 和 `update()` 递归传播到整棵树，父节点的坐标变换会累积到子节点。

### 11.3 场景切换

`Framework.Game.goToLevel(name)` 替换 `_currentLevel`，自动触发新场景的生命周期初始化。

---

## 12. 构建系统

Gulp 管理**有序的多阶段流水线**，解决"无模块化的 ES6 文件"的依赖顺序问题：

```
clean
  └─► resources（复制图片、音乐、CSS、数据）
        └─► buildJs + buildCss（并行）
              ├─ buildJs: 按依赖顺序合并 → Babel 转译 → Babili 混淆压缩 → SourceMap
              └─ buildCss: 合并 CSS → 最小化 → SourceMap
                    └─► zipData + zipResources + zipEgg（并行）
                              └─► docs（JSDoc 生成）
```

**关键：文件合并顺序**由 gulpfile.js 第 15–113 行手动维护，按以下层次排列：
1. 工具函数与 polyfill
2. Framework 核心（Point → GameObject → Scene → Level → Game）
3. 资源/输入管理器
4. LF2 枚举与常量
5. 帧数据结构（Frame、Interaction、Body）
6. 游戏实体（Character、Ball、Weapon、Behavior）
7. 场景与 UI
8. 主入口（!MainGame.js）

---

## 13. 数据驱动设计

游戏内容（角色属性、技能、地图）全部存储在 `src/data/` 下的 `.txt` 文件中，与代码完全分离。

```
data/
├── character/*.txt   → 35 个角色的帧数据（图片、攻击框、技能）
├── ball/*.txt        → 65 种投射物定义
├── weapon/*.txt      → 15 种武器
├── bg/*.txt          → 9 张地图
└── data_list.json    → 资源索引，按类型分组
```

`.txt` 格式来自原版 LF2 的数据文件格式，保持兼容便于直接复用原版资源。`Frame.js` 负责解析这种格式，提取 `key: value` 对和 `<itr>...</itr>` 多行块。

---

## 14. 设计模式汇总

| 模式 | 应用位置 | 作用 |
|------|----------|------|
| **单例** | `Framework.Game` | 唯一游戏主控实例 |
| **模板方法** | `Framework.Level` | 定义场景生命周期，子类填充细节 |
| **策略** | `AbstractBehavior` 及子类 | 投射物追踪算法可替换 |
| **状态机** | `Character._getNextFrameId()` | 帧状态驱动动作转换 |
| **对象池** | `GameObjectPool` / `GameMapPool` | 复用解析好的模板，避免重复解析 |
| **组合** | `GameObject` 场景树 | 统一处理单个对象和对象组 |
| **观察者** | `KeyboardEventInterface` | 事件广播到当前 Level |
| **工厂** | `Ball._getVelocity()` 中的 Behavior 创建 | 根据 FA 值动态选择行为类 |
| **数据驱动** | 帧数据 `.txt` 文件 | 内容与逻辑解耦，可热替换资源 |

---

## 15. 关键设计决策

### 15.1 为什幺不用现成游戏框架（Phaser 等）

项目是 2017 年的课程作业，自建框架有两个理由：
1. 学习目的——理解游戏引擎底层原理
2. 控制权——LF2 的帧数据格式和碰撞模型非常特殊，现成框架难以无缝适配

代价是需要手动维护文件加载顺序和碰撞系统。

### 15.2 帧数据即游戏逻辑

最核心的决策：**把攻击框、速度偏移、状态转换全部编码在帧数据里**，而不是写在代码中。这与原版 LF2 的设计完全对应，使得：
- 添加新角色只需新增 `.txt` 数据文件
- 调整技能数值无需改代码
- 代码只负责"解读"数据，不负责"决定"游戏内容

### 15.3 3D 坐标而非纯 2D

用 z 轴表示纵深，解决了 LF2 中"角色在不同纵深不应碰撞"的问题，同时自然表达"跳起在空中"的状态，比用布尔标志位更统一。

### 15.4 Canvas 2D 而非 WebGL

选择 Canvas 2D API 而非 WebGL：
- 兼容性更好（Chrome 59 即可）
- LF2 是精灵图动画，不需要 3D 渲染
- 脏矩形优化足够应对 4 个角色 + 65 个投射物的场景

---

*文档基于源码分析生成，2026-05-13*
