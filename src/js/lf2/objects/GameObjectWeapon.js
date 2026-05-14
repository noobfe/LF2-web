"use strict";

import { GameObjectBall } from './GameObjectBall.js';

export class GameObjectWeapon extends GameObjectBall {
    /**
     * @param {Object} fileInfo
     * @param {String} context
     */
    constructor(fileInfo, context) {
        super(fileInfo, context);
        const headerData = this.bmpInfo._data;

        this.hp = intval(headerData.get("weapon_hp"));
        this.hurt = intval(headerData.get("weapon_hp"));
    }
}

lf2.GameObjectWeapon = GameObjectWeapon;
