"use strict";

import { Point } from '../../Framework/Point.js';
import { Utils } from '../game/Utils.js';

export class BloodPoint {
    /** @param {String} content */
    constructor(content) {
        this.info = Utils.parseDataLine(content.replace(/\r?\n/g, ""));
        this.point = new Point(
            intval(this.info.get('x')), intval(this.info.get('y')),
        );
    }
}

lf2.BloodPoint = BloodPoint;
