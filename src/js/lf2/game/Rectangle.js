"use strict";

import { Point } from '../../Framework/Point.js';

export class Rectangle {
    /**
     * @param {Number|Rectangle} widthOrRect
     * @param {Number} [height]
     * @param {Number} [px]
     * @param {Number} [py]
     */
    constructor(widthOrRect, height, px, py) {
        if (widthOrRect instanceof Rectangle) {
            this.width = widthOrRect.width;
            this.height = widthOrRect.height;
            this.position = new Point(widthOrRect.position.x, widthOrRect.position.y);
        } else {
            if (py === undefined) throw SyntaxError('Arguments missing');

            this.width = intval(widthOrRect);
            this.height = intval(height);
            this.position = new Point(px, py);
        }
    }

    get area() {
        return this.width * this.height;
    }

    draw(ctx, z) {
        if (z === undefined) z = 0;
        ctx.strokeRect(
            this.position.x, this.position.y + z,
            this.width, this.height
        );
    }

    isIntersect(rect) {
        return this.position.x < rect.position.x + rect.width &&
            this.position.x + this.width > rect.position.x &&
            this.position.y < rect.position.y + rect.height &&
            this.height + this.position.y > rect.position.y;
    }

    static merge(rect1, rect2) {
        if (rect1 === null && rect2 === null) return null;
        if (rect1 === null) return Rectangle.merge(rect2, rect1);
        if (rect2 === null) return new Rectangle(rect1);

        const
            x1 = Math.min(rect1.position.x, rect2.position.x),
            y1 = Math.min(rect1.position.y, rect2.position.y),
            x2 = Math.max(rect1.position.x + rect1.width, rect2.position.x + rect2.width),
            y2 = Math.max(rect1.position.y + rect1.height, rect2.position.y + rect2.height);

        return new Rectangle(x2 - x1, y2 - y1, x1, y1);
    }
}

lf2.Rectangle = Rectangle;
