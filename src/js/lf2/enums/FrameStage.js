/**
 * 定义游戏内Frame状态的列举型别
     0=站立(stand)
     1=行走(walk)
     2=跑步(run)
     3=普通拳脚攻击(punch)
     4=跳(jump)
     5=突进(dash，即跑+跳)
     7=挡(defend)
     8=破挡(broken defend)
     9=捉人(catching)
     10=被捉(picked caught)
     11=被攻击(injured)
     12=fall大于60才会被打到
     13=有冰碎效果
     14=倒在地上(lying，可使com不会追你)
     15=被冰封(ice，可被同盟攻击)
     16=晕眩(tired)可被敌人捉住
     17=喝(weapon drink)可以喝的物件被消耗
     18=燃烧(fire，可攻击我方同盟)
     19=firen的烈火焚身(burn run)
     301=deep的鬼哭斩(dash sword，此state具有人物上下移动的功能)
     400=woody瞬间转移(teleport，移往最近的敌人)
     401=woody瞬间转移(teleport，移往最近的队友)
     500=rudolf转换成其他角色(transform)
     501=rudolf转换回来(transform_b)
     1700=治疗自己
     9995=变身成LouisEX(transform，任何人都可以)
     9996=爆出盔甲(transform，任何人都可以)
     9997=讯息(come,move之类，能在任何地方看见)
     9998=讯息删除
     9999=毁坏的武器(broken weapon)

 * @type {
            {
                STAND: number,
                WALK: number,
                RUN: number,
                PUNCH: number,
                JUMP: number,
                DASH: number,
                DEFEND: number,
                BROKEN_DEFEND: number,
                CATCHING: number,
                PICKED_CAUGHT: number,
                INJURED: number,
                FALL: number,
                ICE: number,
                LYING: number,
                FROZEN: number,
                TIRED: number,
                DRINK: number,
                FIRE: number,
                BURN_RUN: number,
                DASH_SWORD: number,
                CLOSED_BAD_GUY: number,
                CLOSED_TEAMMATE: number,
                CURE_SELF: number,
                DISAPPEAR_WHEN_HIT: number,
                HIT_TEAMMATE: number,
                BALL_FLYING: number,
                BALL_HITTING: number,
                BALL_CANCELED: number,
                BALL_REBOUNDING: number,
                BALL_DISAPPEAR: number,
                BALL_WIND_FLYING: number,
                BALL_HIT_HEART: number,
                WEAPON_IN_THE_SKY: number,
                WEAPON_ON_HAND: number,
                WEAPON_THROWING: number,
                WEAPON_REBOUNDING: number,
                WEAPON_ON_GROUND: number,
                DELETE_MESSAGE: number
            }
        }
 */
export const FrameStage = Object.freeze({
    /**
     * Character used start
     */
    STAND: 0,
    WALK: 1,
    RUN: 2,
    PUNCH: 3,
    JUMP: 4,
    DASH: 5,
    DEFEND: 7,
    BROKEN_DEFEND: 8,
    CATCHING: 9,
    PICKED_CAUGHT: 10,
    INJURED: 11,
    FALL: 12,
    ICE: 13,
    LYING: 14,
    FROZEN: 15,
    TIRED: 16,
    DRINK: 17,
    FIRE: 18,
    BURN_RUN: 19,
    DASH_SWORD: 301,
    CLOSED_BAD_GUY: 400,
    CLOSED_TEAMMATE: 401,
    CURE_SELF: 1700,
    /**
     * Character used end
     */


    /**
     * Ball used start
     */
    DISAPPEAR_WHEN_HIT: 15,
    HIT_TEAMMATE: 18,
    BALL_FLYING: 3000,
    BALL_HITTING: 3001,
    BALL_CANCELED: 3002,
    BALL_REBOUNDING: 3003,
    BALL_DISAPPEAR: 3004,
    BALL_WIND_FLYING: 3005,
    BALL_HIT_HEART: 3006,
    /**
     * Ball used end
     */

    /**
     * Weapon used start
     */
    WEAPON_IN_THE_SKY: 1000,
    WEAPON_ON_HAND: 1001,
    WEAPON_THROWING: 1002,
    WEAPON_REBOUNDING: 1003,
    WEAPON_ON_GROUND: 1004,
    DELETE_MESSAGE: 9998,
    /**
     * Weapon used end
     */
});
