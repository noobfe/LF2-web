"use strict";

import { Bound } from '../enums/Bound.js';
import { ItrKind } from '../enums/ItrKind.js';
import { Effect } from '../enums/Effect.js';
import { FrameStage } from '../enums/FrameStage.js';
import { GameItem } from './GameItem.js';

const DIRECTION = GameItem.DIRECTION;
const NONE = GameItem.NONE;
const INIT_TIME = 500;
const ALLOW_FALL_DOWN_ID = [220, 221, 222];

export class Ball extends GameItem {
    constructor(ballId, player) {
        super(ballId, player);
        this._remainderTime = INIT_TIME;
        this._isOut = false;
        this._affectByFriction = false;

        this._behavior = null;
    }

    _getNextFrameId() {
        if (this._frameForceChangeId !== NONE) return this._frameForceChangeId;

        if (this._isOut) return GameItem.DESTROY_ID;
        const curF = this.currentFrame;
        let next = curF.nextFrameId;
        const hit = curF.hit;

        if (this._remainderTime <= 0 && hit.a !== 0 && hit.d !== 0) {
            next = hit.d;
        }

        if (next === 0) {
            next = this._currentFrameIndex;
        }

        switch (hit.Fa) {
            case 7:
                if (next !== this.DESTROY_ID && this.position.z >= -10 && ALLOW_FALL_DOWN_ID.indexOf(this.obj.id) !== -1) {
                    next = 60;
                }
                break;
        }

        if (next === 999) return 0;

        return next;
    }

    onOutOfBound(bound, map) {
        if (
            (bound & Bound.LEFT) || (bound & Bound.RIGHT)
        ) this._isOut = true;
        if (bound & Bound.TOP) this.position.y = map.zBoundary.first;
        if (bound & Bound.BOTTOM) this.position.y = map.zBoundary.second;
    }

    update() {
        const hit = this.currentFrame.hit;
        super.update();

        if (this._behavior && this._remainderTime > 0) {
            this._behavior.update();
        }

        if (this.isFrameChanged) {
            if (hit.a > 0) {
                this._remainderTime -= hit.a;
            }
        }
    }

    onDestroy() {
        const ERR_MSG = 'Cannot destroy ball';

        if (this.spriteParent) {
            this.spriteParent.detach(this);
        } else {
            throw ERR_MSG;
        }
    }

    _getVelocity() {
        let v = super._getVelocity();
        const hit = this.currentFrame.hit;
        this._ballVel = this._ballVel || new Framework.Point3D(0, 0, 0);
        v.writeTo(this._ballVel);
        v = this._ballVel;

        if (hit.j) {
            v.z = hit.j - 50;
        }

        if (!this.world) return v;

        if (hit.Fa !== 0) {
            if (this._behavior) {
                if (this._remainderTime <= 0) {
                    this.velocity = this._behavior._maxVelocity;

                    if (this._behavior.FA !== hit.Fa) {
                        this._behavior = null;
                        this._remainderTime = INIT_TIME;
                    } else {
                        return this._behavior._maxVelocity;
                    }
                }

                if (this._behavior && this._behavior.FA === hit.Fa) {
                    return this._behavior.getVelocity();
                }
            }

            switch (hit.Fa) {
                case 1:
                    this._behavior = new lf2.CenterTrackerBehavior(this, this.spriteParent);
                    break;
                case 14:
                    this._behavior = new lf2.JulianBallTrackerBehavior(this, this.spriteParent);
                    break;
                case 2:
                    this._behavior = new lf2.HorizontalTrackerBehavior(this, this.spriteParent);
                    break;

                case 3:
                    this._behavior = new lf2.SpeedUpTrackerBehavior(this, this.spriteParent);
                    break;

                case 10:
                    this._behavior = new lf2.FasterTrackerBehavior(this, this.spriteParent);
                    break;

                case 7:
                    this._behavior = new lf2.FirzenDisasterFallDownBehavior(this, this.spriteParent);
                    break;

                case 9:
                    this._behavior = new lf2.FirzenDisasterFallDownBeginBehavior(this, this.spriteParent);
                    break;

                case 13:
                    this._behavior = new lf2.JulianBallBeginBehavior(this, this.spriteParent);
                    break;

                default:
                    return new Framework.Point3D(10, 0, 0);
            }

            this._behavior.update();
            if (this._behavior) {
                return this._behavior.getVelocity();
            }

        } else {
            this._behavior = null;
        }

        return v;
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

    _getFrameOffset() {
        let o = super._getFrameOffset().clone();
        o.z -= GameItem.ApplyFriction(this._velocity.z);
        this._velocity.z = o.z;

        return o;
    }

    notifyDamageBy(item, itr) {
        super.notifyDamageBy(item, itr);
        const ITR = itr;
        const DV = ITR.dv;
        const curState = this.currentFrame.state;
        const itemState = item.currentFrame.state;

        const DO_REBOUND = () => {
            this._velocity.x = -ITR.dv.x;
            this.setNextFrame(30);
            this.obj.playHitSound();
            this.update();
            this.belongTo = item.belongTo;
        };

        if (curState === FrameStage.BALL_FLYING) {
            if (
                ITR.kind === ItrKind.REFLECTIVE_SHIELD ||
                (
                    item instanceof lf2.Character &&
                    itemState === FrameStage.PUNCH
                )
            ) {
                DO_REBOUND();
                return true;
            }
        }

        if (ITR.kind === ItrKind.REFLECTIVE_SHIELD) {
            DO_REBOUND();
            return true;
        }

        if (ITR.kind === ItrKind.THREE_D_OBJECTS) {
            if (
                this.currentFrame.itr &&
                this.currentFrame.itr.some(i => i.kind === ItrKind.THREE_D_OBJECTS)
            ) {
                return false;
            }
        }

        const CAN_ATTACK = this.canDamageBy(item, ITR);

        if (!CAN_ATTACK) return false;
        switch (curState) {
            case FrameStage.BALL_WIND_FLYING: {
                this.obj.playHitSound();
                if (itemState === FrameStage.BALL_WIND_FLYING) {
                    this.setNextFrame(20);
                    this.freeze();
                }
            }
                break;
            case FrameStage.BALL_HIT_HEART:
                this.obj.playHitSound();

                if (
                    itemState === FrameStage.BALL_WIND_FLYING ||
                    itemState === FrameStage.BALL_HIT_HEART
                ) {
                    this.setNextFrame(20);
                    this.freeze();
                }
                break;

            case FrameStage.DISAPPEAR_WHEN_HIT:
                if (
                    ITR.kind === ItrKind.THREE_D_OBJECTS &&
                    (
                        this.currentFrame.itr &&
                        this.currentFrame.itr.some(
                            i => i.kind === ItrKind.NORMAL_HIT &&
                            i.effect === Effect.FIXED_ICE
                        )
                    )
                ) {
                    return false;
                }
                break;
            default:
                if (
                    itemState !== FrameStage.FROZEN &&
                    itemState !== FrameStage.FIRE &&
                    itemState !== FrameStage.BALL_WIND_FLYING &&
                    itemState !== FrameStage.BALL_HIT_HEART
                ) {
                    this.setNextFrame(20);
                    this.freeze();
                }
        }

        return true;
    }

    postDamageItems(gotDamageItems) {
        super.postDamageItems(gotDamageItems);
        const curFrame = this.currentFrame;
        const state = curFrame.state;
        const ITR = curFrame.itr[0];
        const HIT = curFrame.hit;

        const HIT_ENEMY = gotDamageItems.some((damagedItem) => damagedItem.belongTo !== this.belongTo);
        const HIT_SAME_GROUP = gotDamageItems.some((damagedItem) => damagedItem.belongTo === this.belongTo);
        const HIT_CHARACTER = gotDamageItems.some((damagedItem) => damagedItem instanceof lf2.Character);

        if (ITR && ITR.kind === ItrKind.REFLECTIVE_SHIELD) {
            if (HIT_ENEMY && HIT_CHARACTER) {
                this.obj.playHitSound();
                this.setNextFrame(HIT.d);
            }
        } else {
            switch (state) {
                case FrameStage.BALL_FLYING:
                    if (HIT_ENEMY) {
                        this.setNextFrame(20);
                        this.obj.playHitSound();
                        this.freeze();
                    } else if (HIT_SAME_GROUP) {
                        this.setNextFrame(10);
                        this.obj.playHitSound();
                        this.freeze();
                    }
                    break;

                case FrameStage.BALL_HITTING:
                    if (HIT_ENEMY) {
                        this.obj.playHitSound();
                        this.setNextFrame(20);
                        this.freeze();
                    }
                    break;

                case FrameStage.BALL_CANCELED:
                    if (HIT_ENEMY) {
                        this.obj.playHitSound();
                        this.setNextFrame(20);
                        this.freeze();
                    }
                    break;
                case FrameStage.BALL_WIND_FLYING:
                    if (HIT_ENEMY) {
                        this.obj.playHitSound();

                        if (gotDamageItems[0].currentFrame.state === FrameStage.BALL_WIND_FLYING) {
                            this.setNextFrame(20);
                            this.freeze();
                        }
                    }
                    break;
                case FrameStage.BALL_HIT_HEART:
                    if (HIT_ENEMY) {
                        this.obj.playHitSound();

                        if (
                            gotDamageItems[0].currentFrame.state === FrameStage.BALL_WIND_FLYING ||
                            gotDamageItems[0].currentFrame.state === FrameStage.BALL_HIT_HEART
                        ) {
                            this.setNextFrame(20);
                            this.freeze();
                        }
                    }
                    break;

                default:
            }
        }
    }

    get __leftTopPoint__lol() {
        const center = this.currentFrame.center;
        let leftTopPoint = new Framework.Point3D(
            this.position.x - center.x,
            this.position.y - this.height + center.y,
            this.position.z
        );

        if (this._direction === DIRECTION.LEFT) {
            leftTopPoint.x = this.position.x - (this.width - center.x);
        }

        return leftTopPoint;
    }
}

lf2.Ball = Ball;
