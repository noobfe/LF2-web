"use strict";

import { GameObject } from '../../Framework/GameObject.js';

export class ColorBar extends GameObject {
    /**
     * @param {String} color
     * @param {Number} width
     * @param {Number} height
     */
    constructor(color, width, height) {
        super();
        this._color = color;
        this._width = width;
        this._height = height;
    }

    load() {}
    update() {}

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x, this.position.y,
            this.width, this.height
        );
    }

    get width() { return this._width; }
    set width(v) { this._width = v; }

    get height() { return this._height; }
    set height(v) { this._height = v; }

    get color() { return this._color; }
    set color(v) { this._color = v; }
}

lf2.ColorBar = ColorBar;
