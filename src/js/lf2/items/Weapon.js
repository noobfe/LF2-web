"use strict";

import { FrameStage } from '../enums/FrameStage.js';
import { GameItem } from './GameItem.js';
import { Ball } from './Ball.js';

const NONE = GameItem.NONE;
const ON_GROUND_ID = 70;

export class Weapon extends Ball {
    constructor(weaponId, player) {
        super(weaponId, player);
        this._affectByFriction = true;
    }

    _getNextFrameId() {
        if (this._isOut) return GameItem.DESTROY_ID;
        if (this._frameForceChangeId !== NONE) return this._frameForceChangeId;

        const curF = this.currentFrame;
        let next = curF.nextFrameId;
        switch (curF.state) {
            case FrameStage.WEAPON_IN_THE_SKY:
            case FrameStage.WEAPON_THROWING:
                if (this.position.z === 0) {
                    next = ON_GROUND_ID;
                }
                break;
        }

        if (next === 0) {
            switch (curF.state) {
                case FrameStage.WEAPON_THROWING:
                    if (this.position.z === 0) {
                        next = ON_GROUND_ID;
                    }
                    break;
                case FrameStage.DELETE_MESSAGE:
                    next = GameItem.DESTROY_ID;
                    break;
                default:
                    next = 0;
            }
        }
        if (next === 999) return 0;

        return next;
    }

    update() {
        super.update();
        const curF = this.currentFrame;
        if (curF.state === FrameStage.DELETE_MESSAGE) {
            this._allowDraw = false;
        }
    }
}

lf2.Weapon = Weapon;
