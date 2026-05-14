"use strict";

import { Point } from '../../Framework/Point.js';
import { Point3D } from '../../Framework/Point3D.js';
import { Audio } from '../../Framework/Audio.js';
import { GameObject as FrameworkGameObject } from '../../Framework/GameObject.js';
import { Bezier } from '../game/Bezier.js';
import { Bound } from '../enums/Bound.js';
import { FrameStage } from '../enums/FrameStage.js';
import { ItrKind } from '../enums/ItrKind.js';
import { Rectangle } from '../game/Rectangle.js';
import { Cube } from '../game/Cube.js';
import { ImageInformation } from '../frame/ImageInformation.js';

const HALF_SCREEN_WIDTH = Framework.Config.canvasWidth >> 1;
const DESTROY_ID = 1000;
const NONE = -1;
const STOP_ALL_MOVE_DV = 550;

const FRICTION = 0.25;
const MIN_SPEED = 1;
const MIN_V = 1;
const GRAVITY = 1.7;

const SOUND_BEZIER = [0.895, 0.03, 0.685, 0.22];
const KEEP_SOUND_DISTANCE = 100;

let dvxArray = [0];
const getDvxPerWait = function (i) {
    return i;
};

const getMinX = (gameItem, rect) => {
    const W = (gameItem.currentFrame.center.x);
    return (gameItem.position.x | 0) + (
        gameItem._direction === DIRECTION.RIGHT ?
            (-W + rect.position.x) :
            (W - rect.position.x - rect.width)
    );
};

const getMinZ = (gameItem, rect) => {
    return gameItem.position.z - gameItem.currentFrame.center.y + rect.position.y;
};

const DIRECTION = {
    RIGHT: true,
    LEFT: false,
};
Object.freeze(DIRECTION);

export class GameItem extends FrameworkGameObject {
    /**
     * @param gameObjId
     * @param {lf2.Player} player
     */
    constructor(gameObjId, player) {
        super();

        if (!(player instanceof lf2.Player)) throw TypeError('player argument must be a instance of lf2.Player');

        this.obj = lf2.GameObjectPool.get(gameObjId);

        this.position = new Point3D(0, 0, 0);
        this.absolutePosition = new Point3D(0, 0, 0);
        this.relativePosition = new Point3D(0, 0, 0);

        this._velocity = new Point3D(0, 0, 0);

        this._previousFrameIndex = 0;
        this._currentFrameIndex = 0;
        this._lastFrameSetTime = Date.now();
        this._config = Framework.Config;
        this._direction = DIRECTION.RIGHT;
        this._lastFrameId = NONE;
        this.belongTo = player;
        this._frameForceChange = false;
        this._frameForceChangeId = NONE;
        this._createTime = Date.now();
        this._allowDraw = true;
        this._updateCounter = 0;
        this._affectByFriction = true;
        this._bdyItems = [];
        this._itrItem = null;
        this._itrItr = null;
        this._itrItemFrame = null;
        this._arestCounter = 0;
        this._vrestCounter = 0;
        this._flashing = false;
        this._flashCounter = false;
        this._isNew = true;
        this.alive = true;
        /** @type {lf2.WorldScene|null} */
        this._world = null;

        /** @type {Audio} */
        this._audio = new Audio(this.obj.getPlayList());

        this._nextDirection = null;

        /** @type {Point3D} */
        this._prevVelocity = this._velocity.clone();

        this.pushSelfToLevel();
    }

    set world(v) { this._world = v; }
    get world() { return this._world; }

    get currentFrame() { return this.obj.frames[this._currentFrameIndex]; }
    get previousFrame() { return this.obj.frames[this._previousFrameIndex]; }

    load() {}
    initialize() {}

    update() {
        if (this._isNew) {
            this._isNew = false;
            return;
        }
        const curFrame = this.currentFrame;
        this._updateCounter++;
        this.applyFriction();

        let offset = this._getFrameOffset();
        this.position.z += offset.y;
        this.position.y += offset.z;
        if (this._direction === DIRECTION.RIGHT) {
            this.position.x += offset.x;
        } else {
            this.position.x -= offset.x;
        }
        if (this.position.z > 0) {
            this.position.z = 0;
            this._velocity.y = 0;
        }

        switch (curFrame.state) {
            case FrameStage.CLOSED_BAD_GUY: {
                if (this.world) {
                    let item = this.world.getEnemy(this.belongTo);
                    if (item) this.setPosition(item.position);
                }
            } break;
            case FrameStage.CLOSED_TEAMMATE: {
                if (this.world) {
                    let item = this.world.getFriend(this.belongTo);
                    if (item) this.setPosition(item.position);
                }
            } break;
        }

        let bound = 0;
        if (this._frameForceChange || this._updateCounter >= this.currentFrame.wait) {
            this.setFrameById(this._getNextFrameId());
            this._frameForceChange = false;
            this._frameForceChangeId = NONE;
            if (this._nextDirection !== null) {
                this._direction = this._nextDirection;
            }
            this._nextDirection = null;
            this.updateVelocity();
        }

        if (this._arestCounter > 0) {
            this._arestCounter--;
        } else {
            this._arestCounter = 0;
        }

        if (this._vrestCounter > 0) {
            this._vrestCounter--;
        } else {
            this._vrestCounter = 0;
        }

        if (this._flashing) {
            this._flashCounter = !this._flashCounter;
        }
    }

    setBdyItems(items) {
        this._bdyItems = items;
    }

    _getFrameOffset() {
        const wait = this.currentFrame.wait;
        this._frameOffset = this._frameOffset || new Point3D(0, 0, 0);
        let ret = this._frameOffset;
        this._frameOffset.x = this._velocity.x;
        this._frameOffset.y = this._velocity.y;
        this._frameOffset.z = this._velocity.z;

        if (ret.x === STOP_ALL_MOVE_DV) ret.x = 0;
        if (ret.y === STOP_ALL_MOVE_DV) ret.y = 0;
        if (ret.z === STOP_ALL_MOVE_DV) ret.z = 0;

        this._frameOffset = ret;
        return ret;
    }

    _getVelocity() {
        return this.currentFrame.velocity;
    }

    updateVelocity() {
        const getVelocityVal = (cur, next) => {
            if (next === 0) return cur;
            return next;
        };

        this._velocity.writeTo(this._prevVelocity);
        const v = this._getVelocity();

        this._velocity.x = getVelocityVal(this._velocity.x, v.x);
        this._velocity.y = getVelocityVal(this._velocity.y, v.y);
        this._velocity.z = getVelocityVal(this._velocity.z, v.z);
    }

    applyFriction() {
        if (this._affectByFriction) {
            const FX = GameItem.ApplyFriction(this._velocity.x);
            const FZ = GameItem.ApplyFriction(this._velocity.z);

            if (this.position.z === 0) {
                if (FX && this._velocity.x) {
                    this._velocity.x += this._velocity.x > 0 ? -FX : FX;
                }
                if (FZ && this._velocity.z) {
                    this._velocity.z += this._velocity.z > 0 ? -FZ : FZ;
                }
            }

            if (this.position.z < 0) {
                this._velocity.y += GRAVITY;
            }

            if (this.position.z > 0) {
                this.position.z = 0;
                this._velocity.y = 0;
            }

            if (Math.abs(this._velocity.x) < MIN_V) this._velocity.x = 0;
            if (Math.abs(this._velocity.y) < MIN_V) this._velocity.y = 0;
            if (Math.abs(this._velocity.z) < MIN_V) this._velocity.z = 0;
        }
    }

    setFrameById(frameId) {
        if (frameId < 0 && this.frameExist(-frameId)) {
            this._direction = !this._direction;
            return this.setFrameById(-frameId);
        }
        if (!this.frameExist(frameId)) throw new RangeError(`Object (${this.obj.id}) Frame (${frameId}) not found`);
        if (frameId === DESTROY_ID) {
            this.onDestroy();
            return;
        }
        this._previousFrameIndex = this._currentFrameIndex;
        this._currentFrameIndex = frameId;
        this._lastFrameSetTime = Date.now();
        this._updateCounter = 0;
    }

    getFrameIdByName(frameName) {
        let frame = this.obj.frames.filter(o => o.name === frameName)[0];
        if (!frame) throw new RangeError(`Object (${this.obj.id}) Frame (${frameName}) not found`);
        return frame.id;
    }

    canDamageBy(item, ITR) {
        const itemState = item.currentFrame.state;
        if (itemState === FrameStage.FIRE && item.obj.id !== 211) return true;
        if (ITR.kind === ItrKind.THREE_D_OBJECTS) return true;

        switch (ITR.kind) {
            case ItrKind.CATCH:
            case ItrKind.PICK_WEAPON:
            case ItrKind.CATCH_BDY:
            case ItrKind.FALLING:
            case ItrKind.WEAPON_STRENGTH:
            case ItrKind.SUPER_PUNCH:
            case ItrKind.PICK_WEAPON_2:
                return false;
        }

        return !this.isSameTeam(this, item);
    }

    frameExist(frameId) {
        if (frameId === DESTROY_ID) return true;
        return !!this.obj.frames[frameId];
    }

    setFrameByName(frameName) {
        this.setFrameById(this.getFrameIdByName(frameName));
    }

    draw(ctx) {
        const imgInfo = this.ImgInfo;
        const leftTopPoint = this.leftTopPoint;
        const curFrame = this.obj.frames[this._currentFrameIndex];

        const REAL_DRAW_POS_X = leftTopPoint._x | 0;
        const REAL_DRAW_POS_Y = (leftTopPoint._y + leftTopPoint._z) | 0;

        if (this._allowDraw) {
            if (!this._flashing || (this._flashing && this._flashCounter)) {
                const infoRect = imgInfo._rect;
                ctx.drawImage(
                    imgInfo._img,
                    infoRect.position._x | 0,
                    infoRect.position._y | 0,
                    infoRect.width,
                    infoRect.height,
                    REAL_DRAW_POS_X,
                    REAL_DRAW_POS_Y,
                    infoRect.width,
                    infoRect.height
                );
            }
        }

        if (this.isFrameChanged) {
            if (curFrame.soundPath) {
                if (this.world instanceof lf2.WorldScene) {
                    const DistanceFrom = this.world.getDistanceBetweenCameraAndItem(this);
                    let balance = DistanceFrom / HALF_SCREEN_WIDTH;

                    if (balance > 1) balance = 1;
                    if (balance < -1) balance = -1;

                    this._audio.balance = balance;

                    if (DistanceFrom > HALF_SCREEN_WIDTH) {
                        let vol = (DistanceFrom - HALF_SCREEN_WIDTH) / KEEP_SOUND_DISTANCE;
                        if (vol > 1) vol = 1;
                        vol = 1 - Bezier(SOUND_BEZIER, vol);
                        if (vol < 0) vol = 0;
                        this._audio.rightVolume = vol;
                    }

                    if (DistanceFrom < -HALF_SCREEN_WIDTH) {
                        let vol = (-DistanceFrom - HALF_SCREEN_WIDTH) / KEEP_SOUND_DISTANCE;
                        if (vol > 1) vol = 1;
                        vol = 1 - Bezier(SOUND_BEZIER, vol);
                        if (vol < 0) vol = 0;
                        this._audio.leftVolume = vol;
                    }
                }
                this._audio.play(curFrame.soundPath);
            }

            if (curFrame.opoint) {
                let opoint = curFrame.opoint;
                switch (opoint.kind) {
                    case 4100:
                        break;
                    case 1:
                    default:
                        this.belongTo.addBall(opoint, this);
                        break;
                }
            }
        }

        this._lastFrameId = this._currentFrameIndex;

        if (define.DEBUG) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FF00FF";
            ctx.strokeRect(
                REAL_DRAW_POS_X, REAL_DRAW_POS_Y,
                imgInfo.rect.width, imgInfo.rect.height
            );

            const bdy = this.getBdyRect();
            if (bdy) {
                ctx.strokeStyle = "#FF0000";
                bdy.draw(ctx, leftTopPoint.z);
            }

            const itr = this.getItrBox();
            if (itr) {
                ctx.strokeStyle = "#0000FF";
                itr.forEach(i => i.draw(ctx, leftTopPoint.z));
            }

            let msg = [];
            msg.push(`ID: ${this.obj.id}`);
            msg.push(`CurrentFrameId: ${this._currentFrameIndex} / wait: ${this.currentFrame.wait}`);
            msg.push(`position: (${this.position.x | 0}, ${this.position.y | 0}, ${this.position.z | 0}) / ${this._direction ? 'RIGHT' : 'LEFT'}`);
            msg.push(`velocity: (${this._velocity.x | 0}, ${this._velocity.y | 0}, ${this._velocity.z | 0})`);
            msg.push(`VrestCounter: ${this._vrestCounter}`);

            if (this instanceof lf2.Character) {
                msg.push(`Fall: ${this._fall | 0}`);
            }

            if (this instanceof lf2.Ball) {
                if (this._behavior) {
                    msg.push(`Behavior: ${this._behavior.toString()}`);
                }
            }

            ctx.font = "200 12px Arial";
            ctx.textAlign = "start";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            for (let i = 0; i < msg.length; i++) {
                const _y = REAL_DRAW_POS_Y + 12 * i;
                ctx.strokeText(msg[i], REAL_DRAW_POS_X, _y);
                ctx.fillText(msg[i], REAL_DRAW_POS_X, _y);
            }
        }
    }

    getItrBox() {
        const _itr = this.currentFrame.itr;
        if (!_itr) return null;
        return _itr.map(itr => {
            let rect = this._transferRect(itr.rect);
            return new Cube(
                rect.width, rect.height, _itr.zwidth,
                rect.position.x, rect.position.y
            );
        });
    }

    getBdyRect() {
        if (!this.currentFrame.bdy || !this._allowDraw) return null;
        return this._transferRect(this.currentFrame.bdy.rect);
    }

    _transferRect(rect) {
        if (!rect) return null;

        const leftTopPoint = this.leftTopPoint;

        if (this._direction === DIRECTION.RIGHT) {
            return new Rectangle(
                rect.width, rect.height,
                leftTopPoint.x + rect.position.x,
                leftTopPoint.y + rect.position.y
            );
        } else if (this._direction === DIRECTION.LEFT) {
            return new Rectangle(
                rect.width, rect.height,
                leftTopPoint.x + this.width - rect.position.x - rect.width,
                leftTopPoint.y + rect.position.y
            );
        }
    }

    transferPoint(p) {
        if (!p) return null;

        const leftTopPoint = this.leftTopPoint;

        if (this._direction === DIRECTION.RIGHT) {
            return new Point(
                leftTopPoint.x + p.x,
                leftTopPoint.y + p.y
            );
        } else if (this._direction === DIRECTION.LEFT) {
            return new Point(
                leftTopPoint.x + this.width - p.x,
                leftTopPoint.y + p.y
            );
        }
    }

    getAttackItems() {
        const ITRs = this.currentFrame.itr;
        if (!ITRs) return [];

        let res = [];
        ITRs.forEach(ITR => {
            if (ITR.kind === 4) return [];
            if (ITR.kind === 6) return [];

            const
                a_minX = getMinX(this, ITR.rect),
                a_maxX = a_minX + ITR.rect.width,
                a_minY = this.position.y - (ITR.zwidth >> 1), a_maxY = a_minY + ITR.zwidth,
                a_minZ = getMinZ(this, ITR.rect),
                a_maxZ = a_minZ + ITR.rect.height;

            const checkCollision = (bdyItem) => {
                const bdy = bdyItem.currentFrame.bdy;
                if (!bdy || bdyItem._flashing) return false;

                const
                    b_minX = getMinX(bdyItem, bdy.rect),
                    b_maxX = b_minX + bdy.rect.width,
                    b_minY = bdyItem.position.y - 6, b_maxY = b_minY + 12,
                    b_minZ = getMinZ(bdyItem, bdy.rect),
                    b_maxZ = b_minZ + bdy.rect.height;

                return (a_minX <= b_maxX && a_maxX >= b_minX) &&
                    (a_minY <= b_maxY && a_maxY >= b_minY) &&
                    (a_minZ <= b_maxZ && a_maxZ >= b_minZ);
            };

            for (let i = 0; i < this._bdyItems.length && this._vrestCounter === 0; i++) {
                const item = this._bdyItems[i];

                if (this._arestCounter > 0) break;
                if (this === item) continue;

                if (checkCollision(item) && item._itrItem === null) {
                    if (item !== this) {
                        res.push({ item: item, itr: ITR });

                        if (
                            (ITR.hasArest || !ITR.hasVrest) &&
                            item instanceof lf2.Character &&
                            ItrKind.ITR_ALLOW_FALL.binarySearch(ITR.kind) !== -1
                        ) {
                            this._arestCounter = ITR.arest;
                        }
                    }
                }
            }
        });

        return res;
    }

    cleanUpItr() {
        this._itrItem = null;
        this._itrItr = null;
        this._itrItemFrame = null;
    }

    notifyDamageBy(item, itr) {
        this._itrItem = item;
        this._itrItr = itr;
        this._itrItemFrame = item.currentFrame;
        return true;
    }

    postDamageItems(gotDamageItems) {
        this.currentFrame.itr.forEach(ITR => {
            if (ITR && !ITR.hasArest && ITR.hasVrest && gotDamageItems.length > 0) {
                if (gotDamageItems.some(x => x instanceof lf2.Character)) {
                    this._vrestCounter = ITR.vrest;
                }
            }
        });
    }

    setNextFrame(id) {
        this._frameForceChangeId = id;
        this._frameForceChange = true;
    }

    onOutOfBound(bound, map) {}

    onDestroy() {
        throw 'METHOD NOT IMPLEMENT';
    }

    get ImgInfo() {
        const imgArray = this._direction ? this.obj.bmpInfo.imageNormal : this.obj.bmpInfo.imageMirror;
        const curFrame = this.currentFrame;
        let imgInfo = imgArray[curFrame.pictureIndex];
        if (imgInfo instanceof ImageInformation) {
            return imgInfo;
        } else {
            return imgArray[-1];
        }
    }

    get leftTopPoint() {
        const center = this.currentFrame.center;
        let leftTopPoint = this._leftTopPointRef || new Point3D(0, 0, 0);
        leftTopPoint.x = this.position.x - center.x;
        leftTopPoint.y = this.position.y - center.y;
        leftTopPoint.z = this.position.z;

        if (this._direction === DIRECTION.LEFT) {
            leftTopPoint.x = this.position.x - (this.width - center.x);
        }

        this._leftTopPointRef = leftTopPoint;
        return leftTopPoint;
    }

    _getNextFrameId() {
        if (this._frameForceChangeId !== NONE) return this._frameForceChangeId;
        let next = this.currentFrame.nextFrameId;
        if (next === 0) return this.currentFrame.id;
        if (next === 999) return 0;
        return next;
    }

    freeze() {
        this._velocity.x = this._velocity.y = this._velocity.z = 0;
    }

    isSameTeam(item1, item2) {
        return item1.belongTo.team.equalsTo(item2.belongTo.team);
    }

    get isFrameChanged() {
        return this._currentFrameIndex !== this._lastFrameId;
    }

    get isObjectChanged() {
        return true;
    }

    get width() {
        return this.ImgInfo.rect.width;
    }

    get height() {
        return this.ImgInfo.rect.height;
    }

    get isStopping() {
        return this._velocity.x === this._velocity.y && this._velocity.y === this._velocity.z
            && this._velocity.x === 0;
    }

    get velocity() {
        return this._velocity.clone();
    }

    set velocity(p) {
        this._velocity.x = p.x;
        this._velocity.y = p.y;
        this._velocity.z = p.z;
    }

    isFront(item) {
        let ret = true;
        if (this._direction === DIRECTION.RIGHT) {
            ret = this.position.x < item.position.x;
        } else {
            ret = this.position.x > item.position.x;
        }
        return ret;
    }

    setPosition(p) {
        this.position.x = p.x;
        this.position.y = p.y;
        if (p.z !== undefined) {
            this.position.z = p.z;
        }
    }

    setNextDirection(v) {
        this._nextDirection = v;
    }

    static GetFriction(speed) {
        const TABLE = {
            3: 1,
            5: 2,
            6: 4,
            9: 5,
            13: 7,
            25: 9
        };

        if (speed < 0) speed = -speed;

        let targetSpeed;
        for (targetSpeed in TABLE) {
            if (speed <= targetSpeed) {
                return TABLE[targetSpeed];
            }
        }

        return TABLE[targetSpeed];
    }

    static ApplyFriction(val, f) {
        if (f === undefined) {
            f = GameItem.GetFriction(val);
        }
        if (val === 0) return 0;
        if (val === STOP_ALL_MOVE_DV) return 0;
        return FRICTION * f;
    }
}

GameItem.prototype.DIRECTION = GameItem.DIRECTION = DIRECTION;
GameItem.prototype.DESTROY_ID = GameItem.DESTROY_ID = DESTROY_ID;
GameItem.prototype.NONE = GameItem.NONE = NONE;
GameItem.prototype.MIN_V = GameItem.MIN_V = MIN_V;
GameItem.prototype.FRICTION = GameItem.FRICTION = FRICTION;
GameItem.prototype.GRAVITY = GameItem.GRAVITY = GRAVITY;
GameItem.prototype.STOP_ALL_MOVE_DV = GameItem.STOP_ALL_MOVE_DV = STOP_ALL_MOVE_DV;

lf2.GameItem = GameItem;
