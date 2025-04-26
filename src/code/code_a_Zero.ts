import { ZT, PT, T, Z, equal, psi, plus, sanitize_plus_term, ONE, OMEGA, cacheKey, serialize } from "../intersection";
import { Hyouki } from "../junction";

export class Zero_Function implements Hyouki {
    fund(a: T, b: T): T {
        return fund(a, b);
    }

    dom(a: T): T {
        return dom(a);
    }
}

const domCache = new Map<string, ZT | PT>();

function dom(t: T): ZT | PT {
    const key = serialize(t);
    if (fundCache.has(key)) {
        return domCache.get(key)!;
    }

    let result: ZT | PT;

    if (t.type === "zero") {
        result = Z;
    } else if (t.type === "plus") {
        result = dom(t.add[t.add.length - 1]);
    } else {
        if (t.arr.every(x => x.type === "zero")) result = ONE;
        result = OMEGA;
    }

    domCache.set(key, result);
    return result;
}

const fundCache = new Map<string, T>();

function fund(s: T, t: T): T {
    const key = cacheKey(s, t);
    if (fundCache.has(key)) {
        return fundCache.get(key)!;
    }

    let result: T;

    if (s.type === "zero") {
        result = Z;
    } else if (s.type === "plus") {
        const lastfund = fund(s.add[s.add.length - 1], t);
        const remains = sanitize_plus_term(s.add.slice(0, -1));
        result = plus(remains, lastfund);
    } else {
        let i_0 = 0;
        while (i_0 < s.arr.length) {
            if (!equal(s.arr[i_0], Z)) break;
            i_0++;
        }
        if (i_0 === s.arr.length) {
            result = Z;
        } else {
            const alpha = [...s.arr];
            const domi_0 = dom(alpha[i_0]);
            if (equal(domi_0, ONE)) {
                if (equal(dom(t), ONE)) {
                    alpha[i_0] = fund(s.arr[i_0], Z);
                    if (i_0 === 0)
                        result = plus(fund(s, fund(t, Z)), psi(alpha));
                    else {
                        alpha[i_0 - 1] = fund(s, fund(t, Z));
                        result = psi(alpha);
                    }
                } else {
                    result = Z;
                }
            } else {
                alpha[i_0] = fund(s.arr[i_0], t);
                result = psi(alpha);
            }
        }
    }

    fundCache.set(key, result);
    return result;
}

// function fund(s: T, t: T): T {
//     if (s.type === "zero") {
//         return Z;
//     } else if (s.type === "plus") {
//         const lastfund = fund(s.add[s.add.length - 1], t);
//         const remains = sanitize_plus_term(s.add.slice(0, -1));
//         return plus(remains, lastfund);
//     } else {
//         let i_0 = 0;
//         while (i_0 < s.arr.length) {
//             if (!equal(s.arr[i_0], Z)) break;
//             i_0++;
//         }
//         if (i_0 === s.arr.length) return Z;
//         const alpha = [...s.arr];
//         const domi_0 = dom(alpha[i_0]);
//         if (equal(domi_0, ONE)) {
//             if (equal(dom(t), ONE)) {
//                 alpha[i_0] = fund(s.arr[i_0], Z);
//                 if (i_0 === 0)
//                     return plus(fund(s, fund(t, Z)), psi(alpha));
//                 alpha[i_0-1] = fund(s, fund(t, Z));
//                 return psi(alpha);
//             }
//             return Z;
//         }
//         alpha[i_0] = fund(s.arr[i_0], t);
//         return psi(alpha);
//     }
// }