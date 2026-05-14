"use strict";

const _SETTING_CONTAINER_ID = "__setting_container";
const CUR = "cur";

const setCur = (ele) => {
    $(`.${CUR}`).removeClass(CUR);
    if (ele) {
        ele.classList.add(CUR);
    }
};
const DISALLOW_KEY = [
    'Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];
for (let i = 0; i < DISALLOW_KEY.length; i++) DISALLOW_KEY[i] = Framework.KeyBoardManager.getKeyCodeByString(DISALLOW_KEY[i]);
DISALLOW_KEY.sort((a, b) => a - b);

export class MySettingLevel extends Framework.Level {
    constructor() {
        super();
    }

    load() {
        this.audio = new Framework.Audio({
            ok: define.MUSIC_PATH + 'm_ok.m4a',
            cancel: define.MUSIC_PATH + 'm_cancel.m4a',
        });

        this.config = JSON.parse(localStorage.getItem(define.KEYBOARD_CONFIG_KEY))
            || JSON.parse(JSON.stringify(lf2.KeyboardConfig.DEFAULT_CONFIG));

        this.html = '';
        this.players = [];
        this._attached = false;
        this._settingContainer = undefined;
        Framework.ResourceManager.loadResource(define.DATA_PATH + 'SettingScreen.html', {method: "GET"}).then((data) => {
            return data.text();
        }).then((html) => {
            this.html = html;
            this.showSettingMenu();
        });
    }

    getConfigByPlayerId(playerId) {
        let conf = this.config[playerId];
        if (!conf) {
            conf = this.config[playerId] = {};
        }
        return conf;
    }

    initialize() {
    }

    update() {
        super.update();
    }

    draw(parentCtx) {
        super.draw(parentCtx);

        const KEY_CLASS = lf2.KeyboardConfig.prototype.KEY_MAP.KEY_LIST;
        for (let i = 0; i < define.PLAYER_COUNT; i++) {
            const p = this.players[i], c = this.getConfigByPlayerId(i);
            if (c === undefined) continue;

            KEY_CLASS.forEach((k) => {
                p.find(".keys." + k).text(Framework.KeyBoardManager.mappingTable()[c[k]]);
            });

            p.find('.name').val(c['NAME']);
        }
    }

    keydown(e, list, oriE) {
        super.keydown(e, list, oriE);
        console.log(oriE.keyCode);
        let curElement = $(".cur");
        let playerId = curElement.parent().data('player');

        if (curElement.length > 0) {
            const ce = curElement[0];
            if (ce.classList.contains('keys')) {
                let key = curElement.data('key');
                if (DISALLOW_KEY.binarySearch(oriE.keyCode) !== -1) {
                    this.getConfigByPlayerId(playerId)[key] = undefined;
                } else {
                    this.getConfigByPlayerId(playerId)[key] = oriE.keyCode;
                }
                setCur(null);
            }
        }

        this.forceDraw();
    }

    showSettingMenu() {
        if (!this.isCurrentLevel) return;
        if (this.html !== "" && !this._settingContainer) {
            $("#" + _SETTING_CONTAINER_ID).remove();

            this._settingContainer = $(this.html);
            this._settingContainer.attr("id", _SETTING_CONTAINER_ID);

            this._settingContainer.bind('mousedown', function (e) {
                setCur(null);
            });

            this._settingContainer.find(".btn_ok").click((e) => {
                this.audio.play('ok');
                this.saveConfig();
                Framework.Game.popLevelHistory();
            });

            this._settingContainer.find(".btn_cancel").click((e) => {
                this.audio.play('cancel');
                Framework.Game.popLevelHistory();
            });
            this.forceDraw();

            let playerElement = this._settingContainer.find(".player:first");
            let playerContainer = this._settingContainer.find(".players");

            for (let i = 0; i < define.PLAYER_COUNT; i++) {
                this.players[i] = playerElement.clone();
                this.players[i].attr('data-player', i);
                this.bindPlayerEvent(this.players[i]);
                playerContainer.append(this.players[i]);
            }

            playerElement.remove();
            $("body").append(this._settingContainer);
            this._attached = true;
            Framework.Game.resizeEvent();
        }
    }

    bindPlayerEvent(playerElement) {
        const _this = this;
        playerElement.find(".name").bind('keydown', function (e) {
            e.stopImmediatePropagation();
        }).bind('mousedown', function (e) {
            setCur(e.target);
            e.stopImmediatePropagation();
        }).bind('keyup', function (e) {
            let playerId = $(this.parentNode).data('player');
            _this.getConfigByPlayerId(playerId)['NAME'] = this.value;
        });

        playerElement.find(".keys").bind('mousedown', function (e) {
            setCur(e.target);
            e.stopImmediatePropagation();
        });
    }

    click(e) {
    }

    autodelete() {
        if (this._settingContainer) {
            this._settingContainer.remove();
            this._settingContainer = undefined;
        }
    }

    saveConfig() {
        localStorage.setItem(define.KEYBOARD_CONFIG_KEY, JSON.stringify(this.config));
        lf2.KeyboardConfig.clearConfigCache();
    }
}

lf2.MySettingLevel = MySettingLevel;
