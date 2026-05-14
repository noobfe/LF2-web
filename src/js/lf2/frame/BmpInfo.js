"use strict";

import { Utils } from '../game/Utils.js';
import { Rectangle } from '../game/Rectangle.js';
import { ImageInformation } from './ImageInformation.js';

const TAG_START = "<bmp_begin>";
const TAG_END = "<bmp_end>";

const EMPTY_CANVAS = document.createElement('canvas');
EMPTY_CANVAS.width = EMPTY_CANVAS.height = 1;

let _preloadResources = new Map();

export class BmpInfo {
    /** @param {String} context */
    constructor(context) {
        this.source = context.getStringBetween(TAG_START, TAG_END);
        this.imageNormal = [];
        this.imageMirror = [];
        this._data = new Map();
        this._bmpLoad = [];

        this.source.lines().forEach((str) => {
            str = str.trim();
            if (str.length === 0) return;

            if (str.startsWith('file(')) {
                this._bmpLoad.push(this._processImage(str));
            } else if (str.indexOf(':') !== -1) {
                let d = Utils.parseDataLine(str);
                d.forEach((value, key, map) => {
                    this._data.set(key, value);
                });
            } else {
                let d = str.split(/\s+/);
                this._data.set(d[0].trim(), parseFloat(d[1]));
            }
        });

        this.imageNormal[-1] = this.imageMirror[-1] = new ImageInformation(
            new Rectangle(EMPTY_CANVAS.width, EMPTY_CANVAS.height, 0, 0),
            EMPTY_CANVAS
        );
    }

    addPreloadResource(url) {
        let promise = null;
        if (url instanceof Promise) {
            promise = url;
        } else {
            promise = _preloadResources.get(url);
            if (promise === undefined) {
                promise = Framework.ResourceManager.loadResource(url, { method: 'GET' });
                _preloadResources.set(url, promise);
            }
        }

        this._bmpLoad.push(promise);
        return promise;
    }

    _processImage(str) {
        const pairContent = Utils.parseDataLine(str);
        const key = str.split(':')[0];
        const
            index = key.match(/(\d+)/g),
            startIndex = intval(index[0]),
            endIndex = intval(index[1]),
            width = intval(pairContent.get('w')),
            height = intval(pairContent.get('h')),
            $ = this,
            row = intval(pairContent.get('col')),
            col = intval(pairContent.get('row'));

        return new Promise((resolve, reject) => {
            Framework.ResourceManager.loadImage({
                url: define.IMG_PATH + pairContent.get(key)
            }).then((resp) => {
                const img = resp.response;
                let canvas = document.createElement('canvas');
                canvas.width = img.width * 2;
                canvas.height = img.height;
                let renderContext = canvas.getContext('2d');

                renderContext.save();
                renderContext.drawImage(img, 0, 0);

                renderContext.translate(canvas.width, 0);
                renderContext.scale(-1, 1);
                renderContext.drawImage(img, 0, 0);

                renderContext.restore();

                let i = startIndex;
                let j = startIndex;

                const imgObj = new Image();

                for (let r = 0; r < row; r++) {
                    const _y = r * (height + 1);
                    for (let c = 0; c < col; c++) {
                        const _x = c * (width + 1);
                        $.imageNormal[i] = new ImageInformation(
                            new Rectangle(width, height, _x, _y),
                            imgObj
                        );
                        i++;
                    }

                    for (let c = 0; c < col; c++) {
                        const _x = canvas.width + 1 - c * (width + 1) - (width + 1);
                        $.imageMirror[j] = new ImageInformation(
                            new Rectangle(width, height, _x, _y),
                            imgObj
                        );
                        j++;
                    }
                }

                if (canvas.toBlob) {
                    canvas.toBlob(function (b) {
                        imgObj.src = URL.createObjectURL(b) + '#' + pairContent.get(key);
                        resolve();
                    });
                } else {
                    imgObj.src = canvas.toDataURL();
                    resolve();
                }
            });
        });
    }
}

lf2.BmpInfo = BmpInfo;
