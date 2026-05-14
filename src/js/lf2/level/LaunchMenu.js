"use strict";

export class LaunchMenu extends Framework.Level {
    constructor() {
        super();
        this.loadResLoadStart = false;
    }

    loadingProgress(ctx, requestInfo) {
        super.loadingProgress(ctx, requestInfo);
    }

    load() {
        super.load();

        this.audio = new Framework.Audio({
            ok: define.MUSIC_PATH + 'm_ok.m4a',
            join: define.MUSIC_PATH + 'm_join.m4a',
            cancel: define.MUSIC_PATH + 'm_cancel.m4a',
            pass: define.MUSIC_PATH + 'm_pass.m4a',
            end: define.MUSIC_PATH + 'm_end.m4a',
        });

        this.html = '';
        this._menuAttached = false;
        this._menuContainer = undefined;
        Framework.ResourceManager.loadResource(define.DATA_PATH + 'LaunchScreen.html', {method: "GET"}).then((data) => {
            return data.text();
        }).then((html) => {
            this.html = html;
            this.showLaunchMenu();
        });
    }

    initialize() {
    }

    update() {
        super.update();

        if (this._menuAttached && !this.loadResLoadStart) {
            lf2['!MainGame'].playBgm();
            this.loadResLoadStart = true;
            this.preload();
        }
    }

    preload() {
        lf2.Prefetch.start();
        lf2.LoadingLevel.PreloadLoadingVideo();
    }

    draw(parentCtx) {
        super.draw(parentCtx);
    }

    click(e, list, orgE) {
        this._fullScreenGame();
    }

    _fullScreenGame() {
        if (define.DEBUG) return;

        if (false) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    }

    showLaunchMenu() {
        if (!this.isCurrentLevel) return;

        if (this.html !== "" && !this._menuAttached) {
            $("#__main_menu").remove();

            this._menuContainer = $(this.html);
            this._menuContainer.attr("id", "__main_menu");
            this._menuContainer.find("#start_game_btn").click((e) => {
                this._fullScreenGame();
                this.audio.play('ok');
                Framework.Game.goToLevel('loading');
            });
            this._menuContainer.find("#control_set_btn").click((e) => {
                this.audio.play('ok');
                Framework.Game.goToLevel('control');
            });
            this._menuContainer.find("#help_btn").click(e => {
                this.audio.play('ok');
                Framework.Game.goToLevel('help');
            });

            $("body").append(this._menuContainer);
            this._menuAttached = true;
            Framework.Game.resizeEvent();
        }
    }

    autodelete() {
        if (this._menuContainer) {
            this._menuContainer.remove();
            this._menuContainer = undefined;
        }
        super.autodelete();
    }
}

lf2.LaunchMenu = LaunchMenu;
