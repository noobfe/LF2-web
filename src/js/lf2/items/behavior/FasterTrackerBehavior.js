"use strict";

import { Point3D } from '../../../Framework/Point3D.js';
import { AbstractBehavior } from './AbstractBehavior.js';
import { GameItem } from '../GameItem.js';

const FRICTION = GameItem.FRICTION;

export class FasterTrackerBehavior extends AbstractBehavior {
    constructor(ball, world) {
        super(ball, world);

        this._maxVelocity = new Framework.Point3D(12, 0, 0);
        this._target = null;
    }

    update() {
        super.update();
    }

    getVelocity() {
        let vx = this._ball._velocity.x;
        vx += vx * FRICTION;
        return new Point3D(vx, 0, 0);
    }

    getTarget() {
        if (this._target && !this._target.alive) this._target = null;
        if (this._target !== null) return this._target;

        this._target = this._world.getEnemy(this.belongTo);
        this._maxVelocity = this._ball._prevVelocity.clone();

        return this._target;
    }

    get FA() {
        return 10;
    }

    toString() {
        return 'lf2.FasterTrackerBehavior';
    }
}

lf2.FasterTrackerBehavior = FasterTrackerBehavior;
