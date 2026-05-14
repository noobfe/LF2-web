"use strict";

const _FIGHT_CONTAINER_ID = "__fight_container";
const SEC_PER_MIN = 60;
const PLAYER_TAG = 'data-player';

const GAME_STATUS_WIN = 'win';
const GAME_STATUS_LOSE = 'lose';
const GAME_STATUS_DRAW = 'draw';

export class FightLevel extends Framework.Level {
    constructor() {
        super();

        this.html = '';
        this._htmlLoader = Framework.ResourceManager.loadResource(define.DATA_PATH + 'FightScreen.html', {method: "GET"}).then((data) => {
            return data.text();
        }).then((html) => {
            this.html = html;
        });
    }

    receiveExtraDataWhenLevelStart(extraData) {
        this.config = {
            players: [],
            mapId: extraData.mapId,
        };

        for (let playerId in extraData.players) {
            playerId = intval(playerId);
            if (isNaN(playerId)) continue;
            const Data = extraData.players[playerId];

            this.config.players[playerId] = new lf2.Player(playerId, Data.charId, Data.teamId);
        }
    }

    load() {
        super.load();

        lf2['!MainGame'].playBgm();

        this.world = new lf2.WorldScene(this.config);
        this.rootScene.attach(this.world);

        this.audio = new Framework.Audio({
            end: define.MUSIC_PATH + 'm_end.m4a',
        });

        this._statusPanels = new Array(define.SHOW_PLAYER_COUNT);

        const halfWorldWidth = this.world.map.width >> 1;
        const worldHeightDiff = (this.world.map.zBoundary.second - this.world.map.zBoundary.first);
        const halfScreenWidth = Framework.Config.canvasWidth >> 1;
        this.config.players.forEach((player, i) => {
            player.character.position = new Framework.Point3D(
                (halfWorldWidth - halfScreenWidth) + ((Math.random() * Framework.Config.canvasWidth) | 0),
                ((Math.random() * worldHeightDiff) | 0) + this.world.map.zBoundary.first,
                0
            );
        });

        this._funcStatus = {
            'F6': 0,
            'F7': 0,
        };

        this._anyFuncPressed = false;

        this._container = undefined;
        this._htmlLoader.then(() => {
            this.showPanel();
        });

        this._startTime = Date.now();
        this._gameOver = false;
        this._gameOverPanelShown = false;
        this._teamInfoCache = undefined;
    }

    initialize() {
    }

    update() {
        super.update();

        this.config.players.forEach((player) => {
            player.update();
            player.status.update();
        });

        if (this.checkGameOver()) {
            this._gameOver = true;
            this._gameOverTime = Date.now();
            setTimeout(() => this.showGameOverPanel(), 2000);
        }
    }

    draw(ctx) {
        super.draw(ctx);

        this.config.players.forEach((player) => {
            player.status.draw(ctx);
        });

        if (this._anyFuncPressed) {
            let funcStr = 'Function Keys Used:\x20';
            for (let k in this._funcStatus) {
                if (!this._funcStatus.hasOwnProperty(k)) continue;
                funcStr += `　${k}: ${this._funcStatus[k]}\x20time(s)`;
            }

            this._funcBar.textContent = funcStr;
        }
    }

    keydown(e, list, oriE) {
        super.keydown(e, list, oriE);
        this.config.players.forEach((player) => {
            player.keydown(oriE);
        });

        let curCount = (this._funcStatus[e.key] !== undefined) ? ++this._funcStatus[e.key] : 0;
        switch (e.key) {
            case 'F4':
                Framework.Game.goToLevel('selection');
                break;
            case 'F6': {
                let infMpStatus = curCount % 2 === 1;
                this.config.players.forEach((player) => {
                    player.setInfMp(infMpStatus);
                });
                break;
            }
            case 'F7':
                this.config.players.forEach((player) => {
                    player.addHp(500);
                    player.addMp(500);
                });
                break;
            default:
        }

        if (curCount !== 0) this._anyFuncPressed = true;

        this.world.keydown(oriE);
    }

    keyup(e, list, oriE) {
        super.keyup(e, list, oriE);
    }

    keypress(e, list, oriE) {
    }

    click(e) {
    }

    autodelete() {
        super.autodelete();

        if (this._container) {
            this._container.remove();
            this._container = undefined;
        }
    }

    showPanel() {
        if (!this.isCurrentLevel) return;
        if (this.html !== "" && !this._container) {
            $("#" + _FIGHT_CONTAINER_ID).remove();

            this._container = $(this.html);
            this._container.attr("id", _FIGHT_CONTAINER_ID);
            this._funcBar = this._container.find("#funcKeyStatus")[0];

            const _statusPanelsTarget = this._container.find("#statusPanels");

            let statusPanelTemplate = _statusPanelsTarget.find(".status");
            for (let i = 0; i < define.SHOW_PLAYER_COUNT; i++) {
                this._statusPanels[i] = statusPanelTemplate.clone()[0];
                this._statusPanels[i].setAttribute(PLAYER_TAG, i.toString());
                this._statusPanels[i].hp = this._statusPanels[i].querySelector('.hp');
                this._statusPanels[i].mp = this._statusPanels[i].querySelector('.mp');
                this._statusPanels[i].small = this._statusPanels[i].querySelector('.small');
                this._statusPanels[i].flag = this._statusPanels[i].querySelector('.flag');

                _statusPanelsTarget.append(this._statusPanels[i]);
                if (this.config.players[i]) {
                    this.config.players[i].status.setElem(this._statusPanels[i]);
                }
            }
            statusPanelTemplate.remove();

            this._gameOverPanel = this._container.find('#gameOverPanel');
            this._gameOverTimeVal = this._container.find('.time-value');
            this._gameOverPanelPlayerRows = [];
            const _gameOverPanelPlayerRow = this._gameOverPanel.find('.player-row');
            const _gameOverPanelTarget = _gameOverPanelPlayerRow.parent();
            this.config.players.forEach((player, i) => {
                let panel = _gameOverPanelPlayerRow.clone();

                panel.attr(PLAYER_TAG, i);
                panel.find('img.small').attr('src', player.character.obj.small.src);
                panel.find('.player-text').text('P' + (i + 1));
                panel[0]._attackVal = panel.find('.cell-attack>.value');
                panel[0]._hpVal = panel.find('.cell-hp>.value');
                panel[0]._mpVal = panel.find('.cell-mp>.value');
                panel[0]._status = panel.find('.cell-status');

                this._gameOverPanelPlayerRows[i] = panel[0];
                _gameOverPanelTarget.append(panel);
            });
            _gameOverPanelPlayerRow.remove();

            $("body").append(this._container);
            Framework.Game.resizeEvent();
        }
    }

    checkGameOver() {
        if (this._gameOver) return true;
        const TeamInfo = this.getTeamInfo();
        let isGameOver = false;

        TeamInfo.forEach(v => {
            if (v.status !== undefined) isGameOver = true;
        });

        return isGameOver;
    }

    getTeamInfo() {
        let teamMap = new Map();
        let playerCount = 0;
        this.config.players.forEach((player, i) => {
            const team = player.team;
            let mapObj = teamMap.get(team);
            playerCount++;

            if (mapObj === undefined) {
                mapObj = {
                    alive: 0,
                    dead: 0,
                    total: 0,
                    status: undefined,
                };
                teamMap.set(team, mapObj);
            }

            mapObj.total++;

            if (player.hp > 0) {
                mapObj.alive++;
            } else {
                mapObj.dead++;
            }
        });

        let tmpArr = [];
        teamMap.forEach((obj) => {
            tmpArr.push(obj);
        });

        tmpArr.sort((x, y) => y.alive - x.alive);

        const first = tmpArr[0];
        if (first.total === playerCount) {
            first.status = GAME_STATUS_DRAW;
        } else if (first.alive === 0) {
            tmpArr.forEach(v => v.status = GAME_STATUS_DRAW);
        } else if (first.alive > 0 && tmpArr[1].alive === 0) {
            tmpArr.forEach(v => v.status = GAME_STATUS_LOSE);
            first.status = GAME_STATUS_WIN;
        }

        return teamMap;
    }

    clearTeamInfoCache() {
        this._teamInfoCache = undefined;
    }

    showGameOverPanel() {
        if (this._gameOverPanelShown) return;
        const TeamInfo = this.getTeamInfo();

        this._gameOverPanel.removeAttr('hidden');

        this.config.players.forEach((player, i) => {
            const panel = this._gameOverPanelPlayerRows[i];
            panel._attackVal.text(player.attackSum);
            panel._hpVal.text(player.hpLost);
            panel._mpVal.text(player.mpCost);
            panel._status.attr('data-game-status', TeamInfo.get(player.team).status);
            panel._status.attr('data-char-status', player.hp > 0 ? 'alive' : 'dead');
        });

        const costTime = ((this._gameOverTime - this._startTime) / 1000) | 0;
        const ss = costTime % SEC_PER_MIN;
        const mm = (costTime - ss) / SEC_PER_MIN;

        this._gameOverTimeVal.text(`${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`);

        this.audio.play('end');
        this._gameOverPanelShown = true;
    }
}

lf2.FightLevel = FightLevel;
