import { Point } from './Point.js';

/**
 * 提供三維座標的儲存功能
 * @class {Framework.Point3D}
 * @extends {Framework.Point}
 * @property {Number} z
 */
export class Point3D extends Point {

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    constructor(x, y, z) {
        super(x, y);
        this._z = floatval(z) || 0;
    }

    writeTo(target) {
        super.writeTo(target);
        if (target instanceof Point3D) {
            target.z = this.z;
        } else {
            throw new ReferenceError('Target is not an instance of Point3D');
        }
    }

    get z() {
        if (isNaN(this._z)) this._z = 0;
        return this._z;
    }
    set z(value) { this._z = floatval(value); }

    clone() { return new Point3D(this._x, this._y, this._z); }

    get isZero() { return this._x === 0 && this._x === this._y && this._x === this._z; }

    offset(x, y, z) {
        this.x += floatval(x);
        this.y += floatval(y);
        this.z += floatval(z);
        return this;
    }

    toString() { return `(${this._x}, ${this._y}, ${this._z})`; }
}

Framework.Point3D = Point3D;
