"use strict";

import { GameObject } from './GameObject.js';

const SOUND_KEY = "_hitSoundUrl _dropSoundUrl _brokenSoundUrl".split(' ');

export class GameObjectBall extends GameObject {
    /**
     * @param {Object} fileInfo
     * @param {String} context
     */
    constructor(fileInfo, context) {
        super(fileInfo, context);
        const headerData = this.bmpInfo._data;
        this._hitSoundUrl = headerData.get("weapon_hit_sound");
        this._dropSoundUrl = headerData.get("weapon_drop_sound");
        this._brokenSoundUrl = headerData.get("weapon_broken_sound");
    }

    playHitSound() {
        this._hitSoundUrl && this._audio.play(define.MUSIC_PATH + this._hitSoundUrl);
    }

    playDropSound() {
        this._dropSoundUrl && this._audio.play(define.MUSIC_PATH + this._dropSoundUrl);
    }

    playBrokenSound() {
        this._brokenSoundUrl && this._audio.play(define.MUSIC_PATH + this._brokenSoundUrl);
    }

    getSoundList() {
        let soundSet = super.getSoundList();
        SOUND_KEY.forEach((k) => {
            if (this[k]) {
                soundSet.add(define.MUSIC_PATH + this[k]);
            }
        });
        return soundSet;
    }
}

lf2.GameObjectBall = GameObjectBall;
