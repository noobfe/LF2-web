"use strict";

import { CenterTrackerBehavior } from './CenterTrackerBehavior.js';

export class JulianBallTrackerBehavior extends CenterTrackerBehavior {
    constructor(ball, world) {
        super(ball, world);
    }

    get FA() {
        return 14;
    }

    toString() {
        return 'lf2.JulianBallTrackerBehavior';
    }
}

lf2.JulianBallTrackerBehavior = JulianBallTrackerBehavior;
