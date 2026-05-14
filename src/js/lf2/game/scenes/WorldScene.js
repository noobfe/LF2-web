"use strict";

import { Point } from '../../../Framework/Point.js';
import { Scene } from '../../../Framework/Scene.js';
import { GameItem } from '../../items/GameItem.js';
import { Bound } from '../../enums/Bound.js';

const FPS = Framework.Config.fps;
const CAMERA_MOVE_SPEED = 500;
const PER_FRAME_TIME = CAMERA_MOVE_SPEED / 1000 * FPS;
const HALF_SCREEN_WIDTH = Framework.Config.canvasWidth >> 1;

const isAttachableSortObj = (x) => {
    if (
        x instanceof lf2.Character ||
        x instanceof lf2.Ball ||
        false
    ) return true;

    return false;
};

export class WorldScene extends Scene {
    constructor(config) {
        super();
        this.config = config;

        this.cameraPosition = 0;
        this.players = this.config.players;
        this._stepByStep = false;
        this._allowUpdate = true;

        this.addPlayers(this.players);

        this._targetCameraX = 0;
        this._cameraCounter = 0;
        this._cameraDiff = 0;
        this._startMoveCameraPos = 0;
        this._cameraPositionCache = new Point(0, 0);
        this._cameraChanged = false;
        this._waitForAdd = [];

        this.setMapById(this.config.mapId);
    }

    addPlayers(playerArray) {
        playerArray.forEach((player) => {
            this.attach(player);
            this.attach(player.character);
        });
    }

    update() {
        let sumPlayerX = 0, count = 0;
        this.config.players.forEach((p) => {
            sumPlayerX += p.character.position.x;
            count++;
        });
        this._setCameraPositionByX(sumPlayerX / count);
        if (define.MAP_SMOOTHLY && this._cameraCounter < PER_FRAME_TIME) {
            this._cameraCounter++;
            this.cameraPosition = this._startMoveCameraPos + this._cameraDiff * (this._cameraCounter / PER_FRAME_TIME);
        } else {
            this.cameraPosition = this._targetCameraX;
        }
        this._cameraChanged = true;

        this.map.update();

        if (!this._allowUpdate) return;

        if (this._waitForAdd.length > 0) {
            this._waitForAdd.forEach(item => this.attach(item));
            this._waitForAdd.length = 0;
        }

        let bdyItems = this._getAllBdyItem();

        this.attachArray.forEach((item) => {
            if (item instanceof GameItem) {
                item.setBdyItems(bdyItems);
            }
        });

        this.attachArray.forEach((item) => {
            if (item instanceof GameItem) {
                let attackedItems = item.getAttackItems();
                let actualAttackedItems = [];
                attackedItems.forEach(bdyItem => {
                    const r = bdyItem.item.notifyDamageBy(item, bdyItem.itr);
                    if (r) {
                        define.DEBUG && console.log(bdyItem);
                        actualAttackedItems.push(bdyItem);
                    }
                });

                item.postDamageItems(actualAttackedItems.map(x => x.item));

                let bound = this.map.getBound(item.position);
                if (bound !== Bound.NONE) {
                    item.onOutOfBound(bound, this.map);
                }
            }
        });

        this.attachArray.forEach((ele) => {
            ele.update();
        });

        this.attachArray.forEach((ele) => {
            if (ele instanceof GameItem) {
                ele.cleanUpItr();
            }
        });

        if (this._stepByStep) {
            this._allowUpdate = false;
        }
    }

    addNewItem(item) {
        if (this.attachArray.length - define.PLAYER_COUNT > define.MAX_ITEM_COUNT) return;
        this._waitForAdd.push(item);
    }

    _getAllBdyItem() {
        let bdyItems = [];
        this.attachArray.forEach((item) => {
            if (item instanceof GameItem) {
                if (item.currentFrame.bdy && item._allowDraw) {
                    bdyItems.push(item);
                }
            }
        });

        return bdyItems;
    }

    attach(obj) {
        super.attach(obj);
        if (obj.world !== undefined) {
            obj.world = this;
        }
    }

    _setCameraPositionByX(x) {
        const WIDTH = this.map.width - Framework.Config.canvasWidth;
        const HW = HALF_SCREEN_WIDTH;
        let pos = 0;
        if (x <= HW) {
            pos = 0;
        } else if (x >= this.map.width - HW) {
            pos = 1;
        } else {
            pos = (x - HW) / WIDTH;
        }
        if (pos !== this._targetCameraX) {
            this._startMoveCameraPos = this.cameraPosition;
            this._cameraCounter = 0;
        }

        this._targetCameraX = pos;
        this._cameraDiff = pos - this._startMoveCameraPos;
    }

    _getCameraPositionAsPoint() {
        if (!this._cameraChanged) return this._cameraPositionCache;
        let x = this.map.width - Framework.Config.canvasWidth;
        x *= this.cameraPosition;

        this._cameraPositionCache.x = x | 0;
        this._cameraChanged = false;

        return this._cameraPositionCache;
    }

    getDistanceBetweenCameraAndItem(item) {
        const pos = this._getCameraPositionAsPoint();
        return item.position.x - (pos.x + HALF_SCREEN_WIDTH);
    }

    draw(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.map.draw(ctx);

        ctx.save();
        let canvasTranslate = this._getCameraPositionAsPoint();
        ctx.translate(-canvasTranslate.x, -canvasTranslate.y);

        this.attachArray.sort((e1, e2) => {
            if (!isAttachableSortObj(e1)) return -1;
            if (!isAttachableSortObj(e2)) return 1;
            const p1 = (e1.position);
            const p2 = (e2.position);
            const yd = p1.y - p2.y;
            if (yd === 0) {
                return e1._createTime - e2._createTime;
            } else {
                return yd;
            }
        });

        this.attachArray.forEach(function (ele) {
            ele.draw(ctx);
        }, this);

        ctx.restore();

        if (!this._allowUpdate) {
            const __x = (ctx.canvas.width >> 1), __y = ((ctx.canvas.height - 120) >> 1) + 60;
            ctx.fillStyle = '#FFF';
            ctx.strokeStyle = '#09123b';
            ctx.lineWidth = 5;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '32px bold Arial';
            ctx.strokeText('PAUSE', __x, __y);
            ctx.fillText('PAUSE', __x, __y);
        }
    }

    getEnemy(player) {
        let target = null;
        this.players.forEach(p => {
            if (target !== null) return;

            if (!player.team.equalsTo(p.team)) {
                target = p.character;

                if (!target._allowDraw || p.hp <= 0) target = null;
            }
        });

        return target;
    }

    getFriend(player) {
        let target = null;
        this.players.forEach(p => {
            if (target !== null) return;

            if (player.team.equalsTo(p.team) && p !== player) {
                target = p.character;
            }
        });

        if (target === null) target = player.character;

        return target;
    }

    detach(gameItem) {
        super.detach(gameItem);
        gameItem.alive = false;
    }

    keydown(oriE) {
        if (oriE.keyCode === Framework.KeyBoardManager.getKeyCodeByString('F2')) {
            this._stepByStep = true;
            this._allowUpdate = true;
        } else if (oriE.keyCode === Framework.KeyBoardManager.getKeyCodeByString('F1')) {
            this._stepByStep = false;
            this._allowUpdate = !this._allowUpdate;
        }
    }

    setMapById(id) {
        this.map = lf2.GameMapPool.get(id);
        this.map.initialize(this);
    }
}

lf2.WorldScene = WorldScene;
