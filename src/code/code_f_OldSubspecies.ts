import { ZT, PT, T, Z, equal, psi, plus, sanitize_plus_term, ONE, OMEGA } from "../intersection";
import { Hyouki } from "../junction";

export class Old_Subspecies_Function implements Hyouki {
    fund(a: T, b: T): T {
        return fund(a, b);
    }

    dom(a: T): T {
        return dom(a);
    }
}

function dom(t: T): ZT | PT {
    if (t.type === "zero") {
        return Z;
    } else if (t.type === "plus") {
        return dom(t.add[t.add.length - 1]);
    } else {
        let i_0 = 0;
        while (i_0 < t.arr.length) {
            if (!equal(t.arr[i_0], Z)) break;
            i_0++;
        }
        if (i_0 === t.arr.length) return ONE;
        const domi_0 = dom(t.arr[i_0]);
        if (equal(domi_0, ONE)) {
            if (i_0 === 0) return OMEGA;
            return t;
        } else if (equal(domi_0, OMEGA)) {
            return OMEGA;
        } else {
            if (domi_0.type !== "psi") throw Error("なんでだよ");
            let j_0 = 1;
            while (j_0 < domi_0.arr.length) {
                if (!equal(domi_0.arr[j_0], Z)) break;
                j_0++;
            }
            if (i_0 >= j_0) return domi_0;
            return OMEGA;
        }
    }
}

function fund(s: T, t: T): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const lastfund = fund(s.add[s.add.length - 1], t);
        const remains = sanitize_plus_term(s.add.slice(0, -1));
        return plus(remains, lastfund);
    } else {
        let i_0 = 0;
        while (i_0 < s.arr.length) {
            if (!equal(s.arr[i_0], Z)) break;
            i_0++;
        }
        if (i_0 === s.arr.length) return Z;
        const alpha = [...s.arr];
        const domi_0 = dom(alpha[i_0]);
        if (equal(domi_0, ONE)) {
            if (i_0 > 0) return t;
            if (equal(dom(t), ONE)) {
                alpha[0] = fund(s.arr[0], Z);
                return plus(fund(s, fund(t, Z)), psi(alpha));
            }
            return Z;
        } else if (equal(domi_0, OMEGA)) {
            alpha[i_0] = fund(s.arr[i_0], t);
            return psi(alpha);
        } else {
            if (domi_0.type !== "psi") throw Error("なんでだよ");
            let j_0 = 1;
            while (j_0 < domi_0.arr.length) {
                if (!equal(domi_0.arr[j_0], Z)) break;
                j_0++;
            }
            if (i_0 >= j_0) {
                alpha[i_0] = fund(alpha[i_0], t);
                return psi(alpha);
            } else {
                if (equal(dom(t), ONE)) {
                    const p = fund(s, fund(t, Z));
                    if (p.type !== "psi") throw Error("なんでだよ");
                    const Gamma = p.arr[i_0];
                    const beta = [...domi_0.arr];
                    beta[j_0] = fund(beta[j_0], Z);
                    beta[j_0 - 1] = Gamma;
                    alpha[i_0] = fund(alpha[i_0], psi(beta));
                    return psi(alpha);
                } else {
                    alpha[i_0] = fund(alpha[i_0], Z);
                    return psi(alpha);
                }
            }
        }
    }
}