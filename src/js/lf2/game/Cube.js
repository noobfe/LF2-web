"use strict";

import { Point } from '../../Framework/Point.js';

export class Cube {
    constructor(width, height, depth, px, py) {
        this.width = intval(width);
        this.height = intval(height);
        this.depth = depth;
        this._depthHalf = (depth / 2) | 0;
        this.position = new Point(px, py);
    }

    draw(ctx, z) {
        if (z === undefined) z = 0;

        ctx.strokeRect(
            this.position.x - this._depthHalf, this.position.y + this._depthHalf + z,
            this.width, this.height
        );
        ctx.strokeRect(
            this.position.x + this._depthHalf, this.position.y - this._depthHalf + z,
            this.width, this.height
        );

        ctx.beginPath();
        ctx.moveTo(this.position.x - this._depthHalf, this.position.y + this._depthHalf + z);
        ctx.lineTo(this.position.x + this._depthHalf, this.position.y - this._depthHalf + z);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.position.x - this._depthHalf + this.width, this.position.y + this._depthHalf + z);
        ctx.lineTo(this.position.x + this._depthHalf + this.width, this.position.y - this._depthHalf + z);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.position.x - this._depthHalf, this.position.y + this.height + this._depthHalf + z);
        ctx.lineTo(this.position.x + this._depthHalf, this.position.y + this.height - this._depthHalf + z);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.position.x - this._depthHalf + this.width, this.position.y + this.height + this._depthHalf + z);
        ctx.lineTo(this.position.x + this._depthHalf + this.width, this.position.y + this.height - this._depthHalf + z);
        ctx.stroke();
    }
}

lf2.Cube = Cube;
