"use strict";

import { Point } from '../../Framework/Point.js';
import { Point3D } from '../../Framework/Point3D.js';
import { Utils } from '../game/Utils.js';
import { KeyboardConfig } from '../game/KeyboardConfig.js';
import { Body } from './Body.js';
import { BloodPoint } from './BloodPoint.js';
import { Interaction } from './Interaction.js';

const BDY_START_TAG = 'bdy:';
const BDY_END_TAG = 'bdy_end:';
const ITR_START_TAG = 'itr:';
const ITR_END_TAG = 'itr_end:';
const SOUND_TAG = 'sound:';
const OPOINT_START_TAG = 'opoint:';
const OPOINT_END_TAG = 'opoint_end:';
const BPOINT_START_TAG = 'bpoint:';
const BPOINT_END_TAG = 'bpoint_end:';

export class Frame {
    /**
     * @param {String} context
     * @param {lf2.GameObject} gameObj
     */
    constructor(context, gameObj) {
        this.sourceCode = context;
        let lines = context.lines();
        let infoArr = lines[0].split(/\s+/);

        this._gameObj = gameObj;

        this.id = intval(infoArr[0]);
        this.name = infoArr[1];

        let picIndex = 1;
        while (picIndex < lines.length && lines[picIndex].indexOf('pic') === -1) picIndex++;

        this.data = Utils.parseDataLine(lines[picIndex]);

        let opoint = context.getStringBetween(OPOINT_START_TAG, OPOINT_END_TAG);
        let bpoint = context.getStringBetween(BPOINT_START_TAG, BPOINT_END_TAG);

        this.opoint = opoint ? new lf2.ObjectPoint(opoint) : undefined;
        this.bpoint = bpoint ? new BloodPoint(bpoint) : undefined;

        this.mp = intval(this.data.get('mp') || 0);

        let itr = context.getStringBetweenMulti(ITR_START_TAG, ITR_END_TAG);
        if (itr.length > 0) {
            /** @type {Interaction[]} */
            this.itr = [];
            itr.forEach(itrString => {
                let iStr = itrString.trim();
                if (iStr) this.itr.push(new Interaction(iStr));
            });
        } else {
            this.itr = undefined;
        }

        let bdy = context.getStringBetween(BDY_START_TAG, BDY_END_TAG);
        bdy = bdy ? bdy.trim() : bdy;
        this.bdy = bdy ? new Body(bdy) : undefined;

        this.soundPath = (function () {
            let soundStr = undefined;
            for (let i = 0; i < lines.length; i++) {
                const lineStr = lines[i].trim();
                if (lineStr.startsWith(SOUND_TAG)) {
                    soundStr = Utils.parseDataLine(lineStr).get('sound');
                    break;
                }
            }

            if (soundStr !== undefined) {
                soundStr = define.MUSIC_PATH + soundStr;
                return soundStr;
            }

            return undefined;
        })();

        this.hit = (() => {
            let ret = {};
            KeyboardConfig.HIT_KEY.HIT_LIST.forEach((k) => {
                const val = intval(this.data.get('hit_' + k) || 0);
                ret[KeyboardConfig.HIT_KEY[k]] = ret[k] = val;
            });
            return ret;
        })();

        this._velocity = new Point3D(
            intval(this.data.get('dvx') || 0),
            intval(this.data.get('dvy') || 0),
            intval(this.data.get('dvz') || 0)
        );

        this._center = new Point(
            intval(this.data.get('centerx')),
            intval(this.data.get('centery'))
        );
    }

    get pictureIndex() {
        return intval(this.data.get('pic') || 0);
    }

    get state() {
        return intval(this.data.get('state') || 0);
    }

    get wait() {
        return intval(this.data.get('wait') || 0) + 1;
    }

    get nextFrameId() {
        return intval(this.data.get('next') || 0);
    }

    get velocity() {
        return this._velocity;
    }

    get center() {
        return this._center;
    }

    get size() {
        if (this._sizeCache === undefined) {
            /** @type {ImageInformation} */
            const img = this._gameObj.bmpInfo.imageNormal[this.pic];
            this._sizeCache = new Point(img.rect.width, img.rect.height);
        }
        return this._sizeCache;
    }
}

lf2.Frame = Frame;
