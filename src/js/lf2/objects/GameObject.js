"use strict";

import { BmpInfo } from '../frame/BmpInfo.js';
import { Frame } from '../frame/Frame.js';
import { Effect } from '../enums/Effect.js';
import { Audio } from '../../Framework/Audio.js';

export class GameObject {
    /**
     * @param {Object} fileInfo
     * @param {String} context
     */
    constructor(fileInfo, context) {
        this.fileInfo = fileInfo;
        this.sourceCode = context;

        this.id = intval(fileInfo.id);
        this.bmpInfo = new BmpInfo(context);
        this.frames = GameObject._parseFrames(context, this);
        this._audio = new Audio();
    }

    done() {
        let arr = [].concat(this.bmpInfo._bmpLoad);
        return Promise.all(arr);
    }

    addPreloadResource(url) {
        return this.bmpInfo.addPreloadResource(url);
    }

    static _parseFrames(context, gameObj) {
        const FRAME_START_TAG = '<frame>';
        const FRAME_END_TAG = '<frame_end>';
        let framesIndex = [], frameContent = [];

        for (
            let index = context.indexOf(FRAME_START_TAG);
            index !== -1;
            index = context.indexOf(FRAME_START_TAG, index + 1)
        ) {
            framesIndex.push(index);
        }
        framesIndex.forEach((i) => {
            let str = context.getStringBetween(FRAME_START_TAG, FRAME_END_TAG, i).trim();
            let frame = new Frame(str, gameObj);

            frameContent[frame.id] = frame;
        });

        return frameContent;
    }

    getSoundList() {
        let soundSet = new Set();

        Effect.allSound.forEach(effectSoundPath => {
            soundSet.add(effectSoundPath);
        });

        this.frames.forEach(frame => {
            if (frame.soundPath !== undefined) {
                soundSet.add(frame.soundPath);
            }
        });

        return soundSet;
    }

    _preLoadSound() {
        let soundPool = {};
        this.getSoundList().forEach(soundPath => {
            if (typeof soundPool[soundPath] === 'undefined') {
                soundPool[soundPath] = soundPath;
            }
        });

        return this.addPreloadResource(
            this._audio.addSongs(soundPool)
        );
    }

    getPlayList() {
        return this._audio.playlist;
    }
}

lf2.GameObject = GameObject;
