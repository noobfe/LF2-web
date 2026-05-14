var Framework = window.Framework;
// include namespace
'use strict';
var Framework = (function (Framework) {
    /**
     * 可以用来绘制图片的物件
     *  position 是图片的中间
     *  position 是图片的中间
     *  position 是图片的中间
     *
     *  因为很雷所以要说三次
     *
     * @param  {string} filePath 图片路径
     * @extends {Framework.GameObject}
     * @implements {Framework.AttachableInterface}
     * @example
     *     new Framework.Sprite('clock.png');
     *
     */
    Framework.Sprite = class Sprite extends Framework.GameObject {
        constructor(options) {
            super();
            // this._tmpCanvas = document.createElement('canvas');
            // this._tmpContext = this._tmpCanvas.getContext('2d');
            this.id = undefined;
            this.type = undefined;
            this.texture = undefined;
            this.isDrawBoundry = false;
            this.isDrawPace = false;
            if (Framework.Util.isString(options)) {
                this.id = options;
                Framework.ResourceManager.loadImage({id: options, url: options}).then(rep => {
                    this.texture = rep.response;
                });
                this.type = 'image';
                this.pushSelfToLevel();
            } else if (Framework.Util.isCanvas(options)) {
                this.texture = options;
                this.type = 'canvas';
            } else if (!Framework.Util.isUndefined(options)) {
                Framework.DebugInfo.Log.error('Sprite 不支援的参数' + options);
            }
        }

        /**
         * Init texture.
         *
         * @return  .
         */
        initTexture() {
            if (Framework.Util.isUndefined(this.texture)) {
                this.texture = Framework.ResourceManager.getResource(this.id);
            }
        }

        /**
         * Draws the given painter.
         *
         * @param {CanvasRenderingContext2D} painter
         */
        draw(painter) {
            // this.countAbsoluteProperty();
            if (this.texture === undefined) {
                this.texture = Framework.ResourceManager.getResource(this.id);
            }

            var painter = painter || Framework.Game._context;
            //this.countAbsoluteProperty1();
            //var tmp, realWidth, realHeight, tmpContext;
            if (this.texture instanceof Image || this.texture instanceof HTMLCanvasElement) {
                // realWidth = this.texture.width;
                // realHeight = this.texture.height;

                // 计算缩放后的大小
                // if (false && this.isObjectChanged) {
                //
                //     if (!Framework.Util.isAbout(this.absoluteScale, 1, 0.00001) || !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)) {
                //         realWidth *= this.scale;
                //         realHeight *= this.scale;
                //         // 将canvas 放大才不会被切到
                //         var diagonalLength = Math.ceil(Math.sqrt(Math.pow(realHeight, 2) + Math.pow(realWidth, 2)));
                //         this.canvas.width = diagonalLength;
                //         this.canvas.height = diagonalLength;
                //
                //         var widthRatio = this.canvas.width / realWidth,
                //             heightRatio = this.canvas.height / realHeight,
                //             tranlateX = this.canvas.width / 2,
                //             tranlateY = this.canvas.height / 2;
                //
                //
                //         // 旋转Canvas
                //         //检查是否有旋转
                //         if (this.absoluteRotation % 360 !== 0) {
                //             // 将Canvas 中心点移动到左上角(0,0)
                //             this.context.translate(tranlateX, tranlateY);
                //
                //             this.context.rotate(this.absoluteRotation / 180 * Math.PI);
                //
                //             // 移回来
                //             this.context.translate(-tranlateX, -tranlateY);
                //         }
                //
                //
                //         // 缩放
                //         // 检查是否有缩放
                //         if (this.absoluteScale != 1) {
                //             this.context.scale(this.absoluteScale, this.absoluteScale);
                //         }
                //
                //         // 画图
                //         this.context.drawImage(this.texture, (this.canvas.width - realWidth) / 2 / this.absoluteScale, (this.canvas.height - realHeight) / 2 / this.absoluteScale);
                //
                //     }
                //
                // }

                //console.log("sprite position, " + this.absolutePosition.x + " , " + this.absolutePosition.y);
                // if (painter instanceof Framework.GameObject) {
                //     painter = painter.context;  //表示传进来的其实是GameObject或其 Concrete Class
                // }
                // if (false && (!Framework.Util.isAbout(this.absoluteScale, 1, 0.00001) || !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001))) {
                //     painter.drawImage(this.canvas, this.absolutePosition.x - this.canvas.width / 2, this.absolutePosition.y - this.canvas.height / 2);
                // }
                // else {
                painter.drawImage(this.texture, this.absolutePosition.x, this.absolutePosition.y);
                // }
            }

        }

        /**
         * Tests draw.
         *
         * @param   painter The painter.
         *
         * @return  .
         */
        testDraw(painter) {
            var painter = painter || Framework.Game._context;
            this.countAbsoluteProperty();
            var texture, tmp, realWidth, realHeight, tmpContext;
            if (Framework.Util.isUndefined(this.texture)) {
                this.texture = Framework.ResourceManager.getResource(this.id);
            }
            if (this.type === 'image' || this.type === 'canvas') {
                realWidth = this.texture.width;
                realHeight = this.texture.height;

                // 计算缩放后的大小
                if (this.isObjectChanged) {
                    if (!Framework.Util.isAbout(this.absoluteScale, 1, 0.00001) || !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)) {
                        realWidth = this.texture.width * this.scale;
                        realHeight = this.texture.height * this.scale;
                        // 将canvas 放大才不会被切到
                        var diagonalLength = Math.floor(Math.sqrt(Math.pow(realHeight, 2) + Math.pow(realWidth, 2)));
                        this.canvas.width = diagonalLength;
                        this.canvas.height = diagonalLength;

                        var widthRatio = this.canvas.width / realWidth,
                            heightRatio = this.canvas.height / realHeight,
                            tranlateX = this.canvas.width / 2,
                            tranlateY = this.canvas.height / 2;


                        // 将Canvas 中心点移动到左上角(0,0)
                        this.context.translate(tranlateX, tranlateY);
                        // 旋转Canvas
                        this.context.rotate(this.absoluteRotation / 180 * Math.PI);
                        // 移回来
                        this.context.translate(-tranlateX, -tranlateY);
                        // 缩放
                        this.context.scale(this.absoluteScale, this.absoluteScale);
                        // 画图                
                        this.context.drawImage(this.texture, (this.canvas.width - realWidth) / 2 / this.absoluteScale, (this.canvas.height - realHeight) / 2 / this.absoluteScale);

                    }

                    // 再画到主Canvas上                    
                    if (this.isDrawBoundry) {
                        this.context.rect((this.canvas.width - realWidth) / 2 / this.absoluteScale, (this.canvas.height - realHeight) / 2 / this.absoluteScale, this.texture.width, this.texture.height);
                        this.context.stroke();
                    }

                    if (this.isDrawPace) {
                        this.context.rect(this.absolutePosition.x, this.absolutePosition.y, 1, 1);
                        this.context.stroke();
                    }

                }

                if (painter instanceof Framework.GameObject) {
                    painter = painter.context;  //表示传进来的其实是GameObject或其 Concrete Class
                }
                if (!Framework.Util.isAbout(this.absoluteScale, 1, 0.00001) || !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)) {
                    painter.drawImage(this.canvas, this.absolutePosition.x - this.canvas.width / 2, this.absolutePosition.y - this.canvas.height / 2);
                }
                else {

                    painter.drawImage(this.texture, this.absolutePosition.x - this.texture.width / 2, this.absolutePosition.y - this.texture.height / 2);
                }
            }
        }

        /**
         * Convert this object into a string representation.
         *
         * @return  An unknown that represents this object.
         */
        toString() {
            return '[Sprite Object]';
        }

        /**
         * Teardowns this object.
         *
         * @return  .
         */
        teardown() {
            if (this.type === 'image') {
                Framework.ResourceManager.destroyResource(this.id);
            }
        }
    };
    return Framework;
})(Framework);

window.Framework = Framework;
