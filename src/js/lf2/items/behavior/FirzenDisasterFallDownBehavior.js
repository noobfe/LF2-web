"use strict";

import { Point } from '../../../Framework/Point.js';
import { Point3D } from '../../../Framework/Point3D.js';
import { AbstractBehavior } from './AbstractBehavior.js';
import { GameItem } from '../GameItem.js';

const MIN_V = GameItem.MIN_V;
const GRAVITY = GameItem.GRAVITY;
const MIN_SPEED = 10;

export class FirzenDisasterFallDownBehavior extends AbstractBehavior {
    constructor(ball, world) {
        super(ball, world);

        this._maxVelocity = new Framework.Point3D(MIN_SPEED, 0, 5);
        this._targetCatched = false;
        this._radiusX = 0;
        this._counter = 0;
    }

    update() {
        super.update();
        this._counter++;
    }

    getVelocity() {
        const TARGET = this.getTarget();

        let vx, vy, vz;
        vx = vy = vz = 0;

        if (TARGET !== null) {
            const IS_FRONT = this._ball.isFront(TARGET);

            if (IS_FRONT) {
                let _x = this._counter;
                let eee = Math.exp(-_x * _x / 1e3);
                vx = this._radiusX * eee;
                vy = this._maxVelocity.y * (1 - Math.exp(-_x * _x / 50));
            } else {
                this._ball._direction = !this._ball._direction;
                vx = this._radiusX;
            }

            const dy = this._ball.position.y - (TARGET.position.y);
            const MIN_Y_DIFF = 8;
            vz = dy === 0 ? 0 : (dy > 0 ? -1 : 1);
            if (Math.abs(dy) >= MIN_Y_DIFF) {
                vz *= 2;
            }
        }

        return new Point3D(vx, vy, vz);
    }

    getTarget() {
        if (!this._world) return null;

        let target = this._world.getEnemy(this.belongTo);

        if (!this._targetCatched) {
            this._maxVelocity = this._ball._prevVelocity.clone();
            this._maxVelocity.x = Math.abs(this._maxVelocity.x) + (((Math.random() * 4) | 0) - 2);
            this._maxVelocity.y = Math.abs(this._maxVelocity.y);
            this._maxVelocity.z = Math.abs(this._maxVelocity.z);
            this._radiusX = Math.abs(this._maxVelocity.x);
            this._radiusY = Math.abs(this._maxVelocity.y);
        }
        this._targetCatched = true;

        return target;
    }

    get FA() {
        return 7;
    }

    toString() {
        return 'lf2.FirzenDisasterFallDownBehavior';
    }
}

lf2.FirzenDisasterFallDownBehavior = FirzenDisasterFallDownBehavior;
