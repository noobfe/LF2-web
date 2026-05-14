const METHOD_NOT_IMPLEMENT = "Method Not Implemented";
/**
 * Keyboard Event Interface
 * 提供键盘事件的介面
 *
 * @interface Framework.KeyboardEventInterface
 * @type {KeyboardEventInterface}
 */
export class KeyboardEventInterface {

    /**
     *
     * 处理键盘被压下按钮的事件
     *
     * @abstract
     * @event keydown
     * @param {Object} e 改写过后的事件的参数表示按下去的最后一个键, 其包含有
     * altKey, ctrlKey, shiftKey表示是否按下的状态,
     * firstTimeStamp 表示刚按下去这个按钮的时间,
     * key 存的是按下去的键的string,
     * lastTimeDiff 则为刚按下这个键到目前有多久了
     *  @param {Object} list 目前按下去所有可以被侦测到的键
     *  @param {KeyboardEvent} oriE W3C定义的事件的e
     * 表示的是目前最新触控到的位置
     * @example
     *
     * keydown (e, list) {
     *     if(e.key === 'A' && e.key.lastTimeDiff > 3000) {
     *         console.log('A');     //当A按下超过3秒, 才会印出A
     *     }
     *     if(list.A && list.B) {
     *         console.log('A+B');   //当A和B都被按下时, 才会印出A+B
     *     }
     * }
     * //FYI: 每个真正的keyCode与相对应的string
     * _keyCodeToChar = {
     *     8:'Backspace',9:'Tab',13:'Enter',
     *     16:'shiftKey',17:'ctrlKey',18:'altKey',19:'Pause/Break',
     *     20:'Caps Lock',27:'Esc',32:'Space',33:'Page Up',34:'Page Down',
     *     35:'End',36:'Home',37:'Left',38:'Up',39:'Right',40:'Down',
     *     45:'Insert',46:'Delete',48:'0',49:'1',50:'2',51:'3',52:'4',
     *     53:'5',54:'6',55:'7',56:'8',57:'9',65:'A',66:'B',67:'C',
     *     68:'D',69:'E',70:'F',71:'G',72:'H',73:'I',74:'J',75:'K',
     *     76:'L',77:'M',78:'N',79:'O',80:'P',81:'Q',82:'R',83:'S',
     *     84:'T',85:'U',86:'V',87:'W',88:'X',89:'Y',90:'Z',91:'Windows',
     *     93:'Right Click',96:'Numpad 0',97:'Numpad 1',98:'Numpad 2',
     *     99:'Numpad 3',100:'Numpad 4',101:'Numpad 5',102:'Numpad 6',
     *     103:'Numpad 7',104:'Numpad 8',105:'Numpad 9',106:'Numpad *',
     *     107:'Numpad +',109:'Numpad -',110:'Numpad .',111:'Numpad /',
     *     112:'F1',113:'F2',114:'F3',115:'F4',116:'F5',117:'F6',118:'F7',
     *     119:'F8',120:'F9',121:'F10',122:'F11',123:'F12',144:'Num Lock',
     *     145:'Scroll Lock',182:'My Computer',
     *     183:'My Calculator',186:';',187:'=',188:',',189:'-',
     *     190:'.',191:'/',192:'`',219:'[',220:'\\',221:']',222:'\''
     * };
     *
     */
    keydown(e, list, oriE) {

    }


    /**
     * 处理键盘被压下按钮的事件, 除了W3C定义的参数外,
     * Framework尚支援进阶的功能history
     *
     * @abstract
     * @event keyup
     *  @param {Object} e 原生的事件参数
     *  @param {Object} history 储存最近几秒内keyup的按键
     * (可以用来处理类似小朋友齐打交, 发动攻击技能的Scenario)
     * history可以设定多久清除一次, 请参考
     * {{#crossLink "KeyBoardManager/setClearHistoryTime:method"}}{{/crossLink}}
     *  @param {KeyboardEvent} oriE W3C定义的事件的e
     * @example
     * keyup (e, history) {
     *     var right = history.length >= 3, i;
     *     if (history.length > 2) {
     *         for (i = 3; i > 0; i--) {
     *             right = right && (history[history.length - i].key === 'Right');
     *         }
     *     }
     *     if (right) {
     *         console.log(right);   //当一秒内按了右键超过3次, 才会印出true
     *     }
     * },
     */
    keyup(e, history, oriE) {
    }
}
