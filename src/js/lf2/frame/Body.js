"use strict";

import { Utils } from '../game/Utils.js';
import { Rectangle } from '../game/Rectangle.js';

export class Body {
    /** @param {String} content */
    constructor(content) {
        this.info = Utils.parseDataLine(content.replace(/\r?\n/g, ""));
        this.kind = intval(this.info.get('kind') || 0);
        this.rect = new Rectangle(
            intval(this.info.get('w')), intval(this.info.get('h')),
            intval(this.info.get('x')), intval(this.info.get('y'))
        );
    }
}

lf2.Body = Body;
