import { ZT, PT, T, Z, equal, psi, plus, sanitize_plus_term, less_than, ONE, OMEGA } from "../intersection";
import { Hyouki } from "../junction";

export class Three_Claused_Point_Psi_Function implements Hyouki {
    fund(a: T, b: T, code: string): T {
        return fund(a, b, code);
    }

    dom(a: T, code: string): T {
        return dom(a, code);
    }
}

function sm(t: PT, code: string): T | "revOmega" {
    let i = 0;
    while (i < t.arr.length) {
        if (!equal(t.arr[i], Z)) break;
        i++;
    }
    if (i === t.arr.length) throw Error("なんでだよ");
    let i_0 = i;
    while (i_0 < t.arr.length) {
        if (code[i_0] === "M") break;
        i_0 += 1;
    }
    if (i_0 === t.arr.length) return "revOmega";
    const array = new Array(i_0).fill(Z).concat([...t.arr].slice(i_0, t.arr.length));
    array[i_0] = plus(t.arr[i_0], ONE);
    return psi(array);
}

function dom(t: T, code: string): ZT | PT {
    if (t.type === "zero") {
        return Z;
    } else if (t.type === "plus") {
        return dom(t.add[t.add.length - 1], code);
    } else {
        let i_0 = 0;
        while (i_0 < t.arr.length) {
            if (!equal(t.arr[i_0], Z)) break;
            i_0++;
        }
        if (i_0 === t.arr.length) return ONE;
        const domi_0 = dom(t.arr[i_0], code);
        const smt = sm(t,code);
        if (equal(domi_0, ONE)) {
            if (code[i_0] === "M" || code[i_0] === "R") return t;
            return OMEGA;
        } else if (smt !== "revOmega" && equal(domi_0, smt) && i_0 !== 0) {
            return t;
        } else {
            if (less_than(domi_0, t)) return domi_0;
            return OMEGA;
        }
    }
}

function bp(s: T, t: T | "revOmega"): T {
    if (t === "revOmega") return s;
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        if (less_than(s.add[0], t)) return s;
        return bp(sanitize_plus_term(s.add.slice(1)), t);
    } else {
        if (less_than(s, t)) return s;
        else {
            let i_0 = 0;
            while (i_0 < s.arr.length) {
                if (!equal(s.arr[i_0], Z)) break;
                i_0++;
            }
            if (i_0 === s.arr.length) return s;
            return bp(s.arr[i_0], t);
        }
    }
}

function fund(s: T, t: T, code: string): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const lastfund = fund(s.add[s.add.length - 1], t, code);
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
        const domi_0 = dom(alpha[i_0], code);
        const sms = sm(s,code);
        if (equal(domi_0, ONE)) {
            if (code[i_0] === "M" || code[i_0] === "R") return t;
            if (equal(dom(t, code), ONE)) {
                alpha[i_0] = fund(s.arr[i_0], Z, code);
                if (i_0 === 0) {
                    return plus(fund(s, fund(t, Z, code), code), psi(alpha));
                }
                alpha[i_0 - 1] = fund(s, fund(t, Z, code), code);
                return psi(alpha);
            }
            return Z;
        } else if (sms !== "revOmega" && equal(domi_0, sms) && i_0 !== 0) {
            alpha[i_0] = fund(alpha[i_0], t, code);
        } else {
            if (less_than(domi_0, s)) {
                alpha[i_0] = fund(alpha[i_0], t, code);
            } else {
                if (domi_0.type !== "psi") throw Error("なんでだよ");
                let j_0 = 1;
                while (j_0 < domi_0.arr.length) {
                    if (!equal(domi_0.arr[j_0], Z)) break;
                    j_0++;
                }
                const beta = [...domi_0.arr];
                const domj_0 = dom(beta[j_0], code);
                if (equal(domj_0, ONE)) {
                    if (equal(dom(t, code), ONE)) {
                        const p = fund(s, fund(t, Z, code), code);
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const Gamma = p.arr[i_0];
                        beta[j_0] = fund(beta[j_0], Z, code);
                        beta[j_0 - 1] = bp(Gamma, sm(domi_0, code));
                        alpha[i_0] = fund(alpha[i_0], psi(beta), code);
                    } else {
                        alpha[i_0] = fund(alpha[i_0], Z, code);
                    }
                } else {
                    if (equal(dom(t, code), ONE)) {
                        const p = fund(s, fund(t, Z, code), code);
                        if (p.type !== "psi") throw Error("なんでだよ");
                        const Gamma = p.arr[i_0];
                        beta[j_0] = bp(Gamma, sm(domi_0, code));
                        alpha[i_0] = fund(alpha[i_0], psi(beta), code);
                    } else {
                        alpha[i_0] = fund(alpha[i_0], Z, code);
                    }
                }
            }
        }
        return psi(alpha);
    }
}