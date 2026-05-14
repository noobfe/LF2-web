"use strict";

const AudioCtx = new window.AudioContext();

let AudioInstanceArray = [];
let AudioDecodedBuffer = new Map();
let AudioInstance = new Map();

const GetRandomAudioCtx = () => AudioCtx;

export class Audio {
    /** @param {Object|Map} playlist */
    constructor(playlist) {
        this._playList = new Map();
        this.audioCtx = GetRandomAudioCtx();
        this.gainNodeLeft = this.audioCtx.createGain();
        this.gainNodeRight = this.audioCtx.createGain();
        this._promisies = [];
        this._leftVolume = 1;
        this._rightVolume = 1;
        this._sources = new Map();
        this._allDone = false;

        if (playlist) {
            this.addSongs(playlist);
        }

        AudioInstanceArray.push(this);
    }

    set volume(v) {
        this.leftVolume = this.rightVolume = v;
    }

    get leftVolume() { return this._leftVolume; }
    get rightVolume() { return this._rightVolume; }

    set leftVolume(v) {
        if (v < 0) throw new RangeError(`Volume out of range, 0~1 expected, ${v} received.`);
        this._leftVolume = v;
        if (this.gainNodeLeft) this.gainNodeLeft.gain.value = this._leftVolume;
    }

    set rightVolume(v) {
        if (v < 0) throw new RangeError(`Volume out of range, 0~1 expected, ${v} received.`);
        this._rightVolume = v;
        if (this.gainNodeRight) this.gainNodeRight.gain.value = this._rightVolume;
    }

    set balance(weight) {
        if (weight > 1 || weight < -1) throw new RangeError(`balance out of range, -1~1 expected, ${weight} received.`);
        if (weight <= 0) {
            this.leftVolume = 1;
            this.rightVolume = weight + 1;
        } else {
            this.rightVolume = 1;
            this.leftVolume = 1 - weight;
        }
    }

    addSongs(list) {
        if (!list) return;
        if (list instanceof Map) {
            list.forEach((v, k) => {
                let p = this._loadSoundAndReturnBuffer(v);
                this._playList.set(k, v);
                this._promisies.push(p);
            });
        } else {
            for (let soundName in list) {
                if (list.hasOwnProperty(soundName)) {
                    let p = this._loadSoundAndReturnBuffer(list[soundName]);
                    this._playList.set(soundName, list[soundName]);
                    this._promisies.push(p);
                }
            }
        }
        return this.done();
    }

    getSource(soundPath) {
        let existSource = this._sources.get(soundPath);
        if (existSource) existSource.disconnect();

        existSource = this.audioCtx.createBufferSource();
        this._sources.set(soundPath, existSource);
        return existSource;
    }

    play(soundName, opts) {
        if (typeof soundName === 'object') {
            console.warn('Play Audio by object is deprecated, please set sound name');
            return this.play(soundName['name'], soundName);
        }

        opts = opts || {};
        let options = {
            loop: false,
            stopPrevious: false,
            volume: undefined,
            leftVolume: undefined,
            rightVolume: undefined,
        };

        for (let k in options) {
            if (opts[k] !== undefined) options[k] = opts[k];
        }

        if (isFinite(options.volume)) this.volume = options.volume;
        if (isFinite(options.leftVolume)) this.leftVolume = options.leftVolume;
        if (isFinite(options.rightVolume)) this.rightVolume = options.rightVolume;

        if (options.stopPrevious) this.stop(soundName);

        const soundPath = this._playList.get(soundName);
        if (soundPath === undefined) throw Error(`Cannot found sound with name: ${soundName}`);
        this.gainNodeLeft = this.gainNodeRight = null;
        return this._loadSoundAndReturnBuffer(soundPath)
            .then(buf => {
                if (typeof buf === 'string') {
                    this._playAsAudio(buf, options);
                    return;
                }

                const source = this.getSource(soundPath);
                const splitter = this.audioCtx.createChannelSplitter(2);
                const merger = this.audioCtx.createChannelMerger(2);
                const gainNodeLeft = this.audioCtx.createGain();
                const gainNodeRight = this.audioCtx.createGain();
                this.gainNodeLeft = gainNodeLeft;
                this.gainNodeRight = gainNodeRight;
                this.leftVolume = this.leftVolume;
                this.rightVolume = this.rightVolume;

                source.buffer = buf;
                source.connect(splitter);
                splitter.connect(gainNodeLeft, 0);
                splitter.connect(gainNodeRight, 0);
                gainNodeLeft.connect(merger, 0, 0);
                gainNodeRight.connect(merger, 0, 1);
                merger.connect(this.audioCtx.destination);

                source.loop = options.loop;
                source.start();
            });
    }

    _playAsAudio(path, opts) {
        let audio = AudioInstance.get(path) || new window.Audio();
        audio.src = path;
        audio.pause();
        audio.volume = (this.leftVolume + this.rightVolume) / 2;
        audio.loop = opts.loop;
        audio.currentTime = 0;
        audio.play();
        AudioInstance.set(path, audio);
    }

    stop(soundPath) {
        const StopSource = (s) => {
            try {
                s.disconnect(this.audioCtx.destination);
                s.stop();
            } catch (e) {}
        };
        if (!soundPath) {
            this._sources.forEach(s => StopSource(s));
        } else {
            let source = this._sources.get(soundPath);
            if (source) StopSource(source);
        }
    }

    get playlist() {
        return new Map(this._playList);
    }

    _loadSoundAndReturnBuffer(soundPath) {
        let ob = AudioDecodedBuffer.get(soundPath);
        if (ob) return new Promise((a, b) => a(ob));

        return Framework.ResourceManager
            .loadResourceAsArrayBuffer(soundPath)
            .then(originalBuffer => this.audioCtx.decodeAudioData(originalBuffer))
            .then(decodedBuffer => {
                AudioDecodedBuffer.set(soundPath, decodedBuffer);
                return decodedBuffer;
            }).catch(err => {
                console.error(soundPath, err);
                console.log('Fallback to audio');
                AudioDecodedBuffer.set(soundPath, soundPath);
            });
    }

    done() {
        return Promise.all(this._promisies);
    }
}

Audio.prototype.stopAll = function () {
    AudioInstanceArray.forEach(ai => ai.stop());
};

Framework.Audio = Audio;
