"use strict";

export const Bezier = (function () {
    const { cos, acos, max, PI: pi, sqrt } = Math;
    const tau = 2 * pi;

    function crt(v) {
        return v < 0 ? -Math.pow(-v, 1 / 3) : Math.pow(v, 1 / 3);
    }

    function cardano(curve, x) {
        let pa = x - 0, pb = x - curve[0], pc = x - curve[2], pd = x - 1;
        let pa3 = pa * 3, pb3 = pb * 3, pc3 = pc * 3;
        let d = (-pa + pb3 - pc3 + pd), rd = 1 / d, r3 = 1 / 3,
            a = (pa3 - 6 * pb + pc3) * rd, a3 = a * r3,
            b = (-pa3 + pb3) * rd, c = pa * rd,
            p = (3 * b - a * a) * r3, p3 = p * r3,
            q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
            q2 = q / 2,
            discriminant = q2 * q2 + p3 * p3 * p3,
            u1, v1, x1, x2, x3;

        if (discriminant < 0) {
            let mp3 = -p * r3, mp33 = mp3 * mp3 * mp3, r = sqrt(mp33),
                t = -q / (2 * r), cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
                phi = acos(cosphi), crtr = crt(r), t1 = 2 * crtr;
            x1 = t1 * cos(phi * r3) - a3;
            x2 = t1 * cos((phi + tau) * r3) - a3;
            x3 = t1 * cos((phi + 2 * tau) * r3) - a3;
            if (0 <= x1 && x1 <= 1) {
                if (0 <= x2 && x2 <= 1) return 0 <= x3 && x3 <= 1 ? max(x1, x2, x3) : max(x1, x2);
                return 0 <= x3 && x3 <= 1 ? max(x1, x3) : x1;
            }
            if (0 <= x2 && x2 <= 1) return 0 <= x3 && x3 <= 1 ? max(x2, x3) : x2;
            return x3;
        } else if (discriminant === 0) {
            u1 = q2 < 0 ? crt(-q2) : -crt(q2);
            x1 = 2 * u1 - a3; x2 = -u1 - a3;
            if (0 <= x1 && x1 <= 1) return 0 <= x2 && x2 <= 1 ? max(x1, x2) : x1;
            return x2;
        } else {
            let sd = sqrt(discriminant);
            u1 = crt(-q2 + sd); v1 = crt(q2 + sd);
            return u1 - v1 - a3;
        }
    }

    function get(a, b, c, d, t) {
        let t1 = 1 - t;
        return a * t1 * t1 * t1 + b * 3 * t * t1 * t1 + c * 3 * t * t * t1 + d * t * t * t;
    }

    return function (controlPoints, x) {
        let percent = cardano(controlPoints, x);
        return get(0, controlPoints[1], controlPoints[3], 1, percent);
    };
})();

lf2.Bezier = Bezier;
