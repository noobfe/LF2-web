"use strict";

const _CONTAINER_ID = "__loading_container";

let LoadingVideoSrc = define.IMG_PATH + 'loading_video.mp4';
let LoadingVideoLoadState = 0;

export class LoadingLevel extends Framework.Level {
    constructor() {
        super();

        if (LoadingLevel.prototype.Instance === undefined) {
            LoadingLevel.prototype.Instance = this;
        } else {
            throw 'Only One instance of Loading Level allowed';
        }

        this.html = "";
        this._htmlLoader = Framework.ResourceManager.loadResource(define.DATA_PATH + 'LoadingScreen.html', {method: "GET"}).then((data) => {
            return data.text();
        }).then((html) => {
            this.html = html;
        });

        this.zip = {};
    }

    initializeProgressResource() {
        super.initializeProgressResource();

        this._htmlLoader.then(() => {
            this.showLoadingVideo();
        });

        LoadingLevel.PreloadLoadingVideo();
    }

    loadingProgress(context, requestInfo) {
    }

    load() {
        this.allDone = false;
        this._startLoadingTime = Date.now();
        this.promiseList = [];
        this.objInfo = [];
        this.bgInfo = [];
        new Promise((_resolve, _reject) => {
            return Promise.all([
                lf2.Prefetch.get('DATA_LIST'),
                lf2.Prefetch.get('DATA')
                    .then(zip => this.zip = zip)
                    .catch((e) => {
                        console.error("Fail to load zip file", "fallback to txt file", e);
                    })
                ,
            ]).then(r => {
                return r[0];
            }).then((data) => {
                const objs = data.object, $ = this;
                console.log('Loading GameObject');

                return new Promise((res, rej) => {
                    let loadObjectRes = function*() {
                        let i = 0;
                        while (i < objs.length) {
                            yield objs[i++];
                        }
                        return null;
                    };
                    let loadObjGen = loadObjectRes();

                    let loadObj = function () {
                        let v = loadObjGen.next();
                        const _o = v.value;
                        if (_o === null) {
                            res(data);
                        } else {
                            $._showLoadFile(_o.file);

                            $.loadDataResource(_o.file).then((datText) => {
                                const obj = $.parseObj(_o, datText);
                                if (obj instanceof lf2.GameObject) {
                                    $.objInfo.push(obj);

                                    obj.done().then(() => {
                                        console.log(`"${_o.file}" including images Loaded.`);
                                        loadObj();
                                    });
                                } else {
                                    loadObj();
                                }
                            });
                        }
                    };

                    loadObj();
                });
            }).then((data) => {
                console.log("GameObject all loaded");
                return data;
            }).then((data) => {
                const bgs = data.background, $ = this;
                console.log('Loading GameMap');
                return new Promise((res, rej) => {
                    let loadMapRes = function*() {
                        let i = 0;
                        while (i < bgs.length) {
                            yield bgs[i++];
                        }
                        return null;
                    };
                    let loadMapGen = loadMapRes();

                    let loadMap = function () {
                        let v = loadMapGen.next();
                        const _o = v.value;
                        if (_o === null) {
                            res(data);
                        } else {
                            $._showLoadFile(_o.file);

                            $.loadDataResource(_o.file).then((datText) => {
                                const map = $.parseMap(_o, datText);
                                if (map instanceof lf2.GameMap) {
                                    $.bgInfo.push(map);

                                    map.done().then(() => {
                                        console.log(`"${_o.file}" including images Loaded.`);
                                        loadMap();
                                    });
                                } else {
                                    loadMap();
                                }
                            });
                        }
                    };

                    loadMap();
                });
            }).then(_resolve);
        }).then((data) => {
            console.log("GameMap all loaded");
            return data;
        }).then((a, b) => {
            console.log("Preloading extra image resources");
            let arrUrl = [
                define.IMG_PATH + "player_status_panel.png",
                define.IMG_PATH + "countdown_1.png",
                define.IMG_PATH + "countdown_2.png",
                define.IMG_PATH + "countdown_3.png",
                define.IMG_PATH + "countdown_4.png",
                define.IMG_PATH + "countdown_5.png",
                define.IMG_PATH + "join_char_1.png",
                define.IMG_PATH + "join_char_2.png",
                define.IMG_PATH + "selection_panel.png",
                define.IMG_PATH + "random_char.png",
            ];
            let arr = [];

            arrUrl.forEach(u => {
                console.log("Loading " + u);
                arr.push(Framework.ResourceManager.loadImage({url: u}));
            });

            return Promise.all(arr);
        }).then((a, b) => {
            console.log("Extra image resources all loaded");
            return a;
        }).then((a, b) => {
            console.log("Preloading extra resources");
            let arrUrl = [
                define.DATA_PATH + 'SelectionScreen.html',
                define.DATA_PATH + 'FightScreen.html',
            ];
            let arr = [];

            arrUrl.forEach(u => {
                console.log("Loading " + u);
                arr.push(Framework.ResourceManager.loadResource(u));
            });

            return Promise.all(arr);
        }).then((a, b) => {
            console.log("Extra resources all loaded");
            return a;
        }).then((a, b) => {
            console.log("---------------------------");
            console.log("All object loaded.");
            console.log("---------------------------");
            this.allDone = true;
        });
    }

    loadDataResource(path) {
        path = path.replace(/\\/g, '/').replace(/\/\//, '/');

        const ZipFileEntry = this.zip.files ? this.zip.files[path] : undefined;
        if (!define.DEBUG && ZipFileEntry) {
            return ZipFileEntry.async('text');
        } else {
            return Framework.ResourceManager.loadResource(define.DATA_PATH + path).then(r => r.text());
        }
    }

    update() {
        if (this.allDone && (Date.now() - this._startLoadingTime) >= define.LOADING_MIN_TIME) {
            Framework.Game.goToLevel('selection');
        }
    }

    draw(ctx) {
        super.draw(ctx);
    }

    parseObj(info, content) {
        let obj = undefined;

        switch (info.type) {
            case 0:
                obj = new lf2.GameObjectCharacter(info, content);
                break;
            case 1:
                obj = new lf2.GameObjectWeapon(info, content);
                break;
            case 3:
                obj = new lf2.GameObjectBall(info, content);
                break;
            default:
                obj = new lf2.GameObject(info, content);
        }

        lf2.GameObjectPool.set(info.id, obj);
        obj._preLoadSound();

        return obj;
    }

    parseMap(info, content) {
        let map = new lf2.GameMap(info, content);
        lf2.GameMapPool.set(info.id, map);
        return map;
    }

    showLoadingVideo() {
        if (!this.isCurrentLevel) return;
        if (this.html !== "" && !this._loadingContainer) {
            $("#" + _CONTAINER_ID).remove();

            this._loadingContainer = $(this.html);
            this._loadingContainer.attr("id", _CONTAINER_ID);
            this._loadingContainer.find("#loadProcess").attr('src', LoadingLevel.LOADING_RESOURCE_SRC);
            this._loadPath = this._loadingContainer.find("#loadDatPath");
        }
        if (!this._attached && this._loadingContainer) {
            $("body").append(this._loadingContainer);
            this._attached = true;
            this._startLoadingTime = Date.now();

            Framework.Game.resizeEvent();
        }
    }

    autodelete() {
        if (this._loadingContainer) {
            this._loadingContainer.remove();
            this._loadingContainer = undefined;
        }
    }

    _showLoadFile(url) {
        const showUrl = url.replace(/\\/g, '/');
        console.log(`Loading "${showUrl}".`);
        this._loadPath.text("正在讀取: " + showUrl);
    }

    static get LOADING_RESOURCE_SRC() {
        return LoadingVideoSrc;
    }

    static PreloadLoadingVideo() {
        if (LoadingVideoLoadState > 0) return;
        LoadingVideoLoadState = 1;
        lf2.Prefetch.get('LOADING_VIDEO')
            .then(blobUrl => {
                LoadingVideoSrc = blobUrl;
                LoadingVideoLoadState = 4;
            });
    }
}

lf2.LoadingLevel = LoadingLevel;
