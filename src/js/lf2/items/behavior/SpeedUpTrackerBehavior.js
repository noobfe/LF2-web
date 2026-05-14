"use strict";

import { HorizontalTrackerBehavior } from './HorizontalTrackerBehavior.js';

export class SpeedUpTrackerBehavior extends HorizontalTrackerBehavior {
    constructor(ball, world) {
        super(ball, world);
    }

    get FA() {
        return 3;
    }

    toString() {
        return 'lf2.SpeedUpTrackerBehavior';
    }
}

lf2.SpeedUpTrackerBehavior = SpeedUpTrackerBehavior;
