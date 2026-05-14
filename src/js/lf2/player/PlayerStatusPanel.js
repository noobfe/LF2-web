"use strict";

import { Point } from '../../Framework/Point.js';
import { Utils } from '../game/Utils.js';

const PANEL_SIZE = new Point(198, 53);
const PANEL_PER_ROW_COUNT = Math.floor(Framework.Config.canvasWidth / PANEL_SIZE.x);
const PANEL_COL_COUNT = 2;

const HP_COLOR = "#ff0000";
const HP_DARK_COLOR = "#6f081f";

const MP_COLOR = "#0000ff";
const MP_DARK_COLOR = "#1f086f";

const SMALL_POSITION = new Point(7, 4);
const BAR_SIZE = new Point(124, 10);

const HP_POSITION = new Point(57, 15);
const MP_POSITION = new Point(57, 35);

const getEleTransformX = (val) => {
    return "translateX(" + (val - 100) + "%)";
};

export class PlayerStatusPanel {
    constructor(player) {
        this._player = player;
        const playerIndex = this._player.playerId;
        const _ROW = (playerIndex / PANEL_PER_ROW_COUNT) | 0;
        const _COL = (playerIndex % PANEL_PER_ROW_COUNT);

        this.panelPosition = new Point(
            _COL * PANEL_SIZE.x,
            _ROW * PANEL_SIZE.y
        );

        this._hpRatio = 1;
        this._mpRatio = 1;

        this._elem = undefined;
        this._lastTeam = undefined;
    }

    setElem(elem) {
        if (elem && elem.hp && elem.mp && elem.small) {
            this._elem = elem;
            elem.setAttribute('attached', '1');

            this._flagIcon = elem.flag;
            this._hpValueBar = elem.hp.querySelector('.value');
            this._mpValueBar = elem.mp.querySelector('.value');
        }
    }

    load() {}

    update() {
        this._hpRatio = this._player.hp / lf2.Player.prototype.DEFAULT_HP;
        this._mpRatio = this._player.mp / lf2.Player.prototype.DEFAULT_HP;

        this._hpRatio = (Utils.returnInRangeValue(this._hpRatio, 0, 1) * 100) | 0;
        this._mpRatio = (Utils.returnInRangeValue(this._mpRatio, 0, 1) * 100) | 0;
    }

    draw(ctx) {
        if (this._elem) {
            const elem = this._elem;
            if (elem.small.src !== this._player.character.small.src) {
                elem.small.src = this._player.character.small.src;
            }

            if (this._lastTeam !== this._player.team) {
                this._elem.setAttribute('data-team', this._player.team.id);
                this._elem.setAttribute('data-team-str', this._player.team);

                this._flagIcon.style.color = this._player.team.getColor();
                this._lastTeam = this._player.team;
            }

            this._hpValueBar.style.transform = getEleTransformX(this._hpRatio);
            this._mpValueBar.style.transform = getEleTransformX(this._mpRatio);
        }
    }

    getRealPosition(point) {
        let x = point.x + this.panelPosition.x;
        let y = point.y + this.panelPosition.y;

        return new Point(x, y);
    }

    get HPRadio() {
        return this._hpRatio;
    }

    get MPRadio() {
        return this._mpRatio;
    }
}

PlayerStatusPanel.prototype.PANEL_SIZE = PlayerStatusPanel.PANEL_SIZE = PANEL_SIZE;
PlayerStatusPanel.prototype.PANEL_PER_ROW_COUNT = PlayerStatusPanel.PANEL_PER_ROW_COUNT = PANEL_PER_ROW_COUNT;
PlayerStatusPanel.prototype.PANEL_COL_COUNT = PlayerStatusPanel.PANEL_COL_COUNT = PANEL_COL_COUNT;

lf2.PlayerStatusPanel = PlayerStatusPanel;
