"use strict";

import { Scene } from './Scene.js';

export class Level {
    constructor() {
        /**
         * @property rootScene
         * @type {Framework.Scene}
         */
        this.rootScene = new Scene();
        this.autoDelete = true;
        this._firstDraw = true;
        this._allGameElement = [];
        this.timelist = [];
        this.updatetimelist = [];
        this.cycleCount = 0;
        this._forceDraw = false;

        this.config = Framework.Config;
    }

    _traversalAllElement(func) {
        this._allGameElement.forEach(func);
    }

    _initializeProgressResource() {
        this.initializeProgressResource();
    }

    _load() {
        this.load();
        this._traversalAllElement(function (ele) {
            ele.load();
        });
    }

    _loadingProgress(ctx, requestInfo) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.loadingProgress(ctx, requestInfo);
    }

    _initialize() {
        this.cycleCount = 0;
        this.initialize();
        this._traversalAllElement(function (ele) {
            ele.initialize();
        });
    }

    _update() {
        this.rootScene.clearDirtyFlag();
        this._traversalAllElement(function (ele) {
            ele.clearDirtyFlag();
        });
        this.update();
    }

    receiveExtraDataWhenLevelStart(extraData) {}

    countAverage(list) {
        var sum = 0;
        for (var i = 0; i < list.length; i++) {
            sum += list[i];
        }
        return sum / list.length;
    }

    _teardown() {
        for (var i in this._allGameElement) {
            var deleteObj = this._allGameElement[i];
            if (Framework.Util.isFunction(deleteObj.teardown)) {
                deleteObj.teardown();
            }
            this._allGameElement[i] = null;
            delete this._allGameElement[i];
        }
        this._allGameElement.length = 0;
        this.teardown();
    }

    _getChangedRect(maxWidth, maxHeight) {
        var rect = { x: maxWidth, y: maxHeight, x2: 0, y2: 0 };

        this._traversalAllElement(function (ele) {
            if (ele.isObjectChanged) {
                var nowDiagonal = Math.ceil(Math.sqrt(ele.width * ele.width + ele.height * ele.height)),
                    nowX = Math.ceil(ele.absolutePosition.x - nowDiagonal / 2),
                    nowY = Math.ceil(ele.absolutePosition.y - nowDiagonal / 2),
                    nowX2 = nowDiagonal + nowX,
                    nowY2 = nowDiagonal + nowY,
                    preDiagonal = Math.ceil(Math.sqrt(ele.previousWidth * ele.previousWidth + ele.previousHeight * ele.previousHeight)),
                    preX = Math.ceil(ele.previousAbsolutePosition.x - preDiagonal / 2),
                    preY = Math.ceil(ele.previousAbsolutePosition.y - preDiagonal / 2),
                    preX2 = preDiagonal + preX,
                    preY2 = preDiagonal + preY,
                    x = (nowX < preX) ? nowX : preX,
                    y = (nowY < preY) ? nowY : preY,
                    x2 = (nowX2 > preX2) ? nowX2 : preX2,
                    y2 = (nowY2 > preY2) ? nowY2 : preY2;

                if (x < rect.x) rect.x = x;
                if (y < rect.y) rect.y = y;
                if (x2 > rect.x2) rect.x2 = x2;
                if (y2 > rect.y2) rect.y2 = y2;
            }
        });

        rect.width = rect.x2 - rect.x;
        rect.height = rect.y2 - rect.y;

        return rect;
    }

    forceDraw() {
        this._forceDraw = true;
        return this;
    }

    _showAllElement() {
        this._traversalAllElement(function (ele) {
            console.log(ele, "ele.isMove", ele._isMove, "ele.isRotate", ele._isRotate, "ele.isScale", ele._isScale, "ele.changeFrame", ele._changeFrame, "ele.isObjectChanged", ele.isObjectChanged);
        });
    }

    _draw(ctx) {
        this.rootScene.countAbsoluteProperty();
        if (this.canvasChanged) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.draw(ctx);
        }
    }

    initializeProgressResource() {}
    load() {}

    loadingProgress(context, requestInfo) {}

    initialize() {}

    update() {
        this.rootScene.update();
    }

    draw(context) {
        this.rootScene.draw(context);
    }

    click(e) {}
    mousedown(e) {}
    mouseup(e) {}
    mousemove(e) {}
    touchstart(e) {}
    touchend(e) {}
    touchmove(e) {}
    keydown(e) {}
    keyup(e, list, orgI) {}
    keypress(e) {}
    teardown() {}

    autodelete() {
        for (var i in this.rootScene.attachArray) {
            if (Framework.Util.isFunction(this.rootScene.attachArray[i].teardown)) {
                this.rootScene.attachArray[i].teardown();
            }
            this.rootScene.attachArray[i] = null;
            delete this.rootScene.attachArray[i];
        }
        this.rootScene.attachArray.length = 0;
        this._teardown();
    }

    get isCurrentLevel() {
        return Framework.Game._currentLevel == this;
    }
}

Object.defineProperty(Level.prototype, 'canvasChanged', {
    get: function () {
        if (this._forceDraw) {
            this._forceDraw = false;
            return true;
        }
        return this._allGameElement.some(e => e.isObjectChanged);
    }
});

Framework.Level = Level;
