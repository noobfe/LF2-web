"use strict";

import { GameObject } from './GameObject.js';

export class Scene extends GameObject {
    constructor() {
        super();
        this.id = undefined;
        this.type = undefined;
        this.texture = undefined;
        /** @type {Array} */
        this.attachArray = [];
        this.pushSelfToLevel();
    }

    load() {
        this.attachArray.forEach(function (ele) {
            ele.load();
        }, this);
    }

    initTexture() {
        this.attachArray.forEach(function (ele) {
            if (!Framework.Util.isUndefined(ele.initTexture)) {
                ele.initTexture();
            }
        }, this);
    }

    update() {
        this.attachArray.forEach(function (ele) {
            ele.update();
        }, this);
    }

    draw(painter) {
        painter = painter || Framework.Game._context;
        this.attachArray.forEach(function (ele) {
            ele.draw(painter);
        }, this);
    }

    attach(target) {
        if (Framework.Util.isUndefined(target)) {
            throw 'target is undefined.';
        }

        if (Framework.Util.isUndefined(target.draw) || Framework.Util.isUndefined(target.update)) {
            throw 'target.draw or target.update is undefined.';
        }

        if (this.layer > target.layer && target.spriteParent) {
            throw 'target is the child of the object which be attached.';
        }

        this.attachArray.push(target);
        target.spriteParent = this;
        target.layer = this.layer + 1;
    }

    detach(target) {
        let index = this.attachArray.indexOf(target);

        if (index > -1) {
            this.attachArray.splice(index, 1);
            target.spriteParent = undefined;
            target.layer = 1;
        }
    }

    toString() {
        return '[Scene Object]';
    }
}

Framework.Scene = Scene;
