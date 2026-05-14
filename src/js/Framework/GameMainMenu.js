'use strict';
var Framework = (function (Framework) {
    /**
     *
     * @class {GameMainMenu}
     * @namespace {Framework}
     * @extends {Framework.Level}
     */
    Framework.GameMainMenu = class extends Framework.Level {
        constructor() {
            super();
            this.autoDelete = false;
        }
    };

    return Framework;
})(Framework || {});
