"use strict";

const METHOD_NOT_IMPLEMENT = "Method Not Implemented";

/**
 * Abstract Behavior
 * @class lf2.AbstractBehavior
 * @abstract
 */
export class AbstractBehavior {
    /**
     * @param {lf2.Ball} ball
     * @param {lf2.WorldScene} world
     */
    constructor(ball, world) {
        this._ball = ball;
        this.belongTo = ball.belongTo;
        this._world = world;
    }

    /** @returns {Framework.Point3D} @abstract */
    getVelocity() { throw METHOD_NOT_IMPLEMENT; }

    update() {
        if (this._ball && !this._ball.alive) {
            this._ball._behavior = null;
            this._ball = null;
        }
    }

    /** @returns {lf2.GameItem} @abstract */
    getTarget() { throw METHOD_NOT_IMPLEMENT; }
}

lf2.AbstractBehavior = AbstractBehavior;
