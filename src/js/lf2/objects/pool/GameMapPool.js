"use strict";

/**
 * GameMapPool
 * @class GameMapPool
 * @extends {Map}
 */
class GameMapPool extends Map {
    constructor() { super(); }

    set(key, value) {
        key = intval(key);
        if (isNaN(key)) throw "Key must be an integer";
        super.set(key, value);
        return this;
    }
}

export const GameMapPoolInstance = new GameMapPool();

lf2.GameMapPool = GameMapPoolInstance;
