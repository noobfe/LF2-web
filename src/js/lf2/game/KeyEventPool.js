"use strict";

const KEY_KEEP_COUNT = 5;

/**
 * KeyEvent Pool
 * @class lf2.KeyEventPool
 */
export class KeyEventPool extends Array {
    constructor(size) {
        if (!size) size = KEY_KEEP_COUNT;
        super(size);
        this._size = size;
    }

    _shiftOne() {
        for (let i = this._size - 2; i >= 0; i--) {
            this[i + 1] = this[i];
        }
    }

    push(value) {
        this._shiftOne();
        this[0] = value;
    }
}

KeyEventPool.KEY_KEEP_COUNT = KEY_KEEP_COUNT;

lf2.KeyEventPool = KeyEventPool;
