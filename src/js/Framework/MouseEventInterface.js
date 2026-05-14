const METHOD_NOT_IMPLEMENT = "Method Not Implemented";
/**
 * Mouse Event Interface
 * 提供滑鼠事件的介面
 *
 * @interface Framework.MouseEventInterface
 * @type {MouseEventInterface}
 */
export class MouseEventInterface {

    /**
     * 处理点击的事件, 当mousedown + mouseup 都成立时才会被触发
     *
     * @abstract
     * @event click
     * @param {Object} e 事件的参数, 会用到的应该是e.x和e.y两个参数,
     * 表示的是目前点击的绝对位置
     */
    click(e) {
    }

    /**
     * 处理滑鼠点下的事件
     *
     * @abstract
     * @event mousedown
     * @param {Object} e 事件的参数, 会用到的应该是e.x和e.y两个参数,
     * 表示的是目前点击的绝对位置
     */
    mousedown(e) {
    }

    /**
     * 处理滑鼠放开的事件
     *
     * @abstract
     * @event mouseup
     * @param {Object} e 事件的参数, 会用到的应该是e.x和e.y两个参数,
     * 表示的是目前放开的绝对位置
     */
    mouseup(e) {
    }

    /**
     * 处理滑鼠移动的事件(不论是否有点下, 都会触发该事件)
     *
     * @abstract
     * @event mousemove
     * @param {Object} e 事件的参数, 会用到的应该是e.x和e.y两个参数,
     * 表示的是目前滑鼠的绝对位置
     */
    mousemove(e) {
    }

}
