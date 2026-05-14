"use strict";

import { CenterTrackerBehavior } from './CenterTrackerBehavior.js';

export class HorizontalTrackerBehavior extends CenterTrackerBehavior {
    constructor(ball, world) {
        super(ball, world);
    }

    getVelocity() {
        let v = super.getVelocity();
        v.y = 0;
        return v;
    }

    get FA() {
        return 2;
    }

    toString() {
        return 'lf2.HorizontalTrackerBehavior';
    }
}

lf2.HorizontalTrackerBehavior = HorizontalTrackerBehavior;
