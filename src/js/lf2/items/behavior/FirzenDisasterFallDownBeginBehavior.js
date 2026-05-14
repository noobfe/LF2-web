"use strict";

import { Point3D } from '../../../Framework/Point3D.js';
import { AbstractBehavior } from './AbstractBehavior.js';
import { Character } from '../Character.js';

export class FirzenDisasterFallDownBeginBehavior extends AbstractBehavior {
    constructor(ball, world) {
        super(ball, world);
        this._attached = false;
    }

    getVelocity() {
        return new Point3D(0, 0, 0);
    }

    update() {
        if (this._ball && !this._ball.alive && this._attached) {
            this._ball._behavior = null;
            this._ball = null;
        }

        if (this._attached) return;

        let N = this._world.attachArray.filter(x => x instanceof Character).length;
        let ops = [
            new lf2.ObjectPoint(`kind: 1  x: 0  y: 0  action: 0  dvx: 15  dvy: -8  oid: 221  facing: ${N}0`),
            new lf2.ObjectPoint(`kind: 1  x: 0  y: 0  action: 0  dvx: 13  dvy: -10  oid: 222  facing: ${N}0`),
        ];

        ops.forEach(opoint => {
            this.belongTo.addBall(opoint, this._ball);
        });

        this._attached = true;
    }

    getTarget() {
        return null;
    }

    get FA() {
        return 9;
    }
}

lf2.FirzenDisasterFallDownBeginBehavior = FirzenDisasterFallDownBeginBehavior;
