"use strict";

/**
 * 提供图片资料的储存功能
 * @class lf2.ImageInformation
 */
export class ImageInformation {
    /**
     * @param {lf2.Rectangle} rect
     * @param {Image|HTMLCanvasElement} imgObj
     */
    constructor(rect, imgObj) {
        this._img = imgObj;
        this._rect = rect;
    }

    get img() { return this._img; }
    get rect() { return this._rect; }
}

lf2.ImageInformation = ImageInformation;
