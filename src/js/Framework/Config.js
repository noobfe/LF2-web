// include namespace

window._isTestMode = false;
window._isRecordMode = false;

/**
 * @class {Framework.Config}
 */
export const Config = Object.freeze({
    fps: 30,
    canvasWidth: 794,
    canvasHeight: 520,
//		canvasWidth : 640,
//		canvasHeight :480,
    isBackwardCompatiable: false,
    isOptimize: false,  // 2017.02.20, from V3.1.1
    isMouseMoveRecorded: false,
});
