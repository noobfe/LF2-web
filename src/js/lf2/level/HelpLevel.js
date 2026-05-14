"use strict";

const _HELP_CONTAINER_ID = "__help_container";

class SimpleCharInfo {
    constructor(fInfo, skillList) {
        this.id = fInfo.id;
        lf2.LoadingLevel.prototype.Instance
            .loadDataResource(fInfo.file)
            .then(txt => {
                const arr = txt.lines();
                let finishCount = 0;
                const MAX_J = 2;
                for (let i = 0; i < arr.length && finishCount < MAX_J; i++) {
                    let txt = arr[i].trim();

                    if (txt.startsWith('name:')) {
                        this.name = txt.substr(5).trim();
                        finishCount++;
                    } else if (txt.startsWith('head:')) {
                        this.headPath = txt.substr(5).trim();
                        finishCount++;
                    }
                }

                if (finishCount < MAX_J) {
                    throw "Parser Error";
                }
            })
            .catch(e => {
                console.error(e);
                this.name = "???";
                this.headPath = "sprite/template1/face.png";
            })
            .then(() => {
                let st = skillList[this.name];
                if (!st) {
                    console.warn(`Skill Table Not Found: ${this.name}`);
                } else {
                    this.skill = st;
                }
            });
    }
}

export class HelpLevel extends Framework.Level {
    constructor() {
        super();
    }

    load() {
        this.audio = new Framework.Audio({
            ok: define.MUSIC_PATH + 'm_ok.m4a',
            cancel: define.MUSIC_PATH + 'm_cancel.m4a',
        });

        this.html = '';
        this._attached = false;
        this._helpContainer = undefined;

        Promise.all([
            Framework.ResourceManager.loadResource(define.DATA_PATH + 'HelpScreen.html', {method: "GET"})
                .then(d => d.text()),
            lf2.Prefetch.get('DATA_LIST'),
            lf2.Prefetch.get('SKILL_LIST')
        ]).then((dList) => {
            this.simInfo = dList[1].object.filter(c => c.type === 0).map(x => new SimpleCharInfo(x, dList[2]));
            this.html = dList[0];
        });
    }

    initialize() {
    }

    update() {
        super.update();

        if (!this._attached) {
            this._forceDraw = true;
        }
    }

    draw(parentCtx) {
        super.draw(parentCtx);

        if (!this._attached) {
            this._showHelp();
        }
    }

    _showHelp() {
        if (!this.isCurrentLevel) return;
        if (this.html !== "" && !this._helpContainer && this.simInfo.every(x => x.name !== undefined)) {
            $("#" + _HELP_CONTAINER_ID).remove();

            this._helpContainer = $(this.html);
            this._helpContainer.attr("id", _HELP_CONTAINER_ID);

            this._helpContainer.find(".btn_ok").click((e) => {
                this._backToMenu();
            });

            this._helpContainer.find('#help-tab').tabs({});

            let videos = this._helpContainer.find('#tabs-1 video');
            videos.each(function () {
                this.loop = true;
                this.parentNode.parentNode.video = this;
            });
            videos.parent().parent().on('mouseover', function () {
                const video = this.video;
                video.play();
            }).on('mouseleave', function () {
                const video = this.video;
                video.pause();
                video.currentTime = 0;
            });

            let charListEle = this._helpContainer.find("#char-list");
            this.simInfo
                .filter(x => x.skill !== undefined)
                .forEach((c) => {
                    let ele = $("<div class='cover-s'></div>"), img = new Image();
                    ele.attr('data-id', c.id).attr('title', c.name).data('c', c);
                    ele.append(img);
                    img.src = define.IMG_PATH + c.headPath;
                    charListEle.append(ele);
                });

            let coverS = charListEle.find('.cover-s');
            coverS.click((e) => {
                coverS.removeClass('active');
                const th = $(e.currentTarget);
                const c = th.data('c');
                th.addClass('active');
                let info = this._helpContainer.find("#char-info").empty();
                let h = $(`
                    <div class="char-info">
                        <img src="${define.IMG_PATH + c.headPath}"/>
                        <div class="char-name"></div>
                    </div>

                    <ul class="char-skill"></ul>
`);
                info.append(h);
                h.find('.char-name').text(c.name);
                let skillEle = info.find('ul.char-skill');
                c.skill.forEach(s => {
                    let sh = $('<li></li>');
                    sh.attr('skillName', s.skillName);
                    sh.attr('keyHint', s.keyHint);
                    skillEle.append(sh);
                });
            });

            $("body").append(this._helpContainer);
            this._attached = true;
            Framework.Game.resizeEvent();
        }
    }

    _backToMenu() {
        this.audio.play('cancel');
        Framework.Game.goToLevel('menu');
    }

    click(e) {
    }

    keydown(e, list, oriE) {
        super.keydown(e, list, oriE);
        if (e.key === 'Esc') {
            this._backToMenu();
        }
    }

    autodelete() {
        if (this._helpContainer) {
            this._helpContainer.find('#help-tab').tabs('destroy');
            this._helpContainer.remove();
            this._helpContainer = undefined;
        }
    }

    static _getFromWord(str) {
        let obj = {}, tmpArr = [], tmpName = '';
        str.trim().split('\n').map(x => x.trim())
            .forEach((str) => {
                if (!str) return;
                if (str.match(/^\D+/)) {
                    if (tmpName) {
                        obj[tmpName] = tmpArr;
                    }
                    tmpName = str;
                    tmpArr = [];
                } else {
                    str = str.replace(/\d+\.	/g, '');
                    let fs = str.indexOf(' ');
                    tmpArr.push({
                        skillName: str.substr(0, fs),
                        keyHint: str.substr(fs + 1)
                    });
                }
            });

        return (JSON.stringify(obj));
    }
}

lf2.HelpLevel = HelpLevel;
