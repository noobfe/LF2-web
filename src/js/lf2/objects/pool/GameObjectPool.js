"use strict";

/**
 * GameObjectPool
 * @class GameObjectPool
 * @extends {Map}
 */
class GameObjectPool extends Map {
    constructor() { super(); }

    set(key, value) {
        key = intval(key);
        if (isNaN(key)) throw "Key must be an integer";
        super.set(key, value);
        return this;
    }
}

export const GameObjectPoolInstance = new GameObjectPool();

lf2.GameObjectPool = GameObjectPoolInstance;
