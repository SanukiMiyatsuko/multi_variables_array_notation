import { ZT, PT, T, Z, equal, psi, plus, sanitize_plus_term, ONE, OMEGA, AT } from "../intersection";
import { Hyouki } from "../junction";

export class aaaSubspecies_Function implements Hyouki {
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
        if (t.arr.every(x => x.type === "zero")) return ONE;
        return OMEGA;
    }
}

function lastfund(s: AT | PT, last: PT, t: T): T {
    let i_0 = 0;
    while (i_0 < last.arr.length) {
        if (!equal(last.arr[i_0], Z)) break;
        i_0++;
    }
    if (i_0 === last.arr.length) return Z;
    const alpha = [...last.arr];
    const domi_0 = dom(alpha[i_0]);
    if (equal(domi_0, ONE)) {
        if (equal(dom(t), ONE)) {
            alpha[i_0] = fund(last.arr[i_0], Z);
            if (i_0 === 0)
                return plus(fund(s, fund(t, Z)), psi(alpha));
            alpha[i_0-1] = fund(s, fund(t, Z));
            return psi(alpha);
        }
        return Z;
    }
    alpha[i_0] = fund(last.arr[i_0], t);
    return psi(alpha);
}

function fund(s: T, t: T): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const remains = sanitize_plus_term(s.add.slice(0, -1));
        const last = s.add[s.add.length - 1];
        return plus(remains, lastfund(s, last, t));
    } else {
        return lastfund(s, s, t);
    }
}