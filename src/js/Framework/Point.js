/**
 * 2D coordinate, also use as a pair structure
 * 提供二维座标的储存功能
 *
 * @class {Framework.Point}
 * @property {Number} x
 * @property {Number} y
 */
export class Point {

    /**
     * @param {Number} x X axis coordinates
     * @param {Number} y y axis coordinates
     */
    constructor(x, y) {
        this._x = floatval(x);
        this._y = floatval(y);
    }

    writeTo(target) {
        if (target instanceof Point) {
            target.x = this.x;
            target.y = this.y;
        } else {
            throw new ReferenceError('Target is not an instance of Point');
        }
    }

    get first() { return this._x; }
    get second() { return this._y; }
    get x() { return this._x; }
    get isZero() { return this._x === 0 && this._x === this._y; }
    set x(value) { this._x = floatval(value); }

    clone() { return new Point(this.x, this.y); }

    offset(x, y) {
        this.x += floatval(x);
        this.y += floatval(y);
        return this;
    }

    get y() { return this._y; }
    set y(value) { this._y = floatval(value); }

    toString() { return `(${this._x}, ${this._y})`; }
}

Framework.Point = Point;
