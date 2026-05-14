"use strict";

import { Point } from '../../Framework/Point.js';
import { Utils } from '../game/Utils.js';

export class ObjectPoint {
    constructor(content) {
        this.info = Utils.parseDataLine(content.replace(/\r?\n/g, ""));
        this.kind = intval(this.info.get('kind') || 1);
        this.appearPoint = new Point(
            intval(this.info.get('x') || 0),
            intval(this.info.get('y') || 0)
        );
        this.action = intval(this.info.get('action'));
        this.dv = new Point(
            intval(this.info.get('dvx') || 0),
            intval(this.info.get('dvy') || 0)
        );
        this.objectId = intval(this.info.get('oid') || 0);
        this.facing = intval(this.info.get('facing') || 0);
        this.count = (this.facing / 10) | 0;
        this.dir = this.facing % 2 === 0 ? lf2.GameItem.DIRECTION.RIGHT : lf2.GameItem.DIRECTION.LEFT;
        if (this.count <= 0) {
            this.count = 1;
        }
    }
}

lf2.ObjectPoint = ObjectPoint;
