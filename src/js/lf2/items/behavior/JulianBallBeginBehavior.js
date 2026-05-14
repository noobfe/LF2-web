"use strict";

import { Point3D } from '../../../Framework/Point3D.js';
import { AbstractBehavior } from './AbstractBehavior.js';

export class JulianBallBeginBehavior extends AbstractBehavior {
    constructor(ball, world) {
        super(ball, world);
        this._attached = false;
    }

    getVelocity() {
        return new Point3D(0, 0, 0);
    }

    update() {
        super.update();
        if (this._attached) return;

        let opoint = new lf2.ObjectPoint(`kind: 1  x: 0  y: 5  action: 0  dvx: 15  dvy: 0  oid: 228  facing: 0`);

        this.belongTo.addBall(opoint, this._ball);
        this._attached = true;
    }

    getTarget() {
        return null;
    }

    get FA() {
        return 13;
    }

    toString() {
        return 'lf2.JulianBallBeginBehavior';
    }
}

lf2.JulianBallBeginBehavior = JulianBallBeginBehavior;
