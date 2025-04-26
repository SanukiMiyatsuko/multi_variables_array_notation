export type ZT = { readonly type: "zero" };
export type AT = { readonly type: "plus", readonly add: PT[] };
export type PT = { readonly type: "psi", readonly arr: T[] };
export type T = ZT | AT | PT;

export function serialize(t: T): string {
    if (t.type === "zero") return "Z";
    if (t.type === "plus") return `P[${t.add.map(serialize).join(",")}]`;
    if (t.type === "psi") return `ψ[${t.arr.map(serialize).join(",")}]`;
    throw new Error("Unknown type");
}

export function cacheKey(s: T, t: T): string {
    return `${serialize(s)}|${serialize(t)}`;
}

export const Z: ZT = { type: "zero" };
export const ONE: PT = psi([Z]);
export const OMEGA: PT = psi([ONE]);
export const LOMEGA: PT = psi([Z, ONE]);
export const IOTA: PT = psi([Z, Z, ONE]);

export function variable_length(s: T): number {
    if (s.type === "zero") {
        return 1;
    } else if (s.type === "plus") {
        const addArray = s.add.map((x) => variable_length(x));
        return Math.max(...addArray);
    } else {
        const lengthArray = [...s.arr].map((x) => variable_length(x));
        return Math.max(...lengthArray, lengthArray.length);
    }
}

function equalize_bool(s: T, n: number): boolean {
    if (s.type === "zero") {
        return true;
    } else if (s.type === "plus") {
        return s.add.every(x => equalize_bool(x, n));
    } else {
        if (s.arr.length !== n) return false;
        if (s.arr.every((x) => equal(x, Z))) return true;
        return s.arr.every(x => equalize_bool(x, n));
    }
}

export function equalize(s: T, n: number): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const a = s.add[0];
        const b = sanitize_plus_term(s.add.slice(1));
        return plus(equalize(a, n), equalize(b, n));
    } else {
        if (s.arr.length === n) {
            if (!s.arr.every((x) => equalize_bool(x, n))) {
                return psi(s.arr.map((x) => equalize(x, n)));
            } else {
                return psi(s.arr);
            }
        } else {
            if (!s.arr.every((x) => equalize_bool(x, n))) {
                const sarr = s.arr.map((x) => equalize(x, n));
                const t = Array(n - s.arr.length).fill(Z);
                return psi(sarr.concat(t));
            } else {
                const t = Array(n - s.arr.length).fill(Z);
                return psi(s.arr.concat(t));
            }
        }
    }
}

export function loose(s: T): T {
    if (s.type === "zero") {
        return Z;
    } else if (s.type === "plus") {
        const a = s.add[0];
        const b = sanitize_plus_term(s.add.slice(1));
        return plus(loose(a), loose(b));
    } else {
        let t = s.arr.map(x => loose(x));
        while (t[t.length - 1].type === "zero" && t.length > 1) t = t.slice(0, -1);
        return psi(t);
    }
}

// オブジェクトの相等判定
export function equal(s: T, t: T): boolean {
    if (s.type === "zero") {
        return t.type === "zero";
    } else if (s.type === "plus") {
        if (t.type !== "plus") return false;
        if (t.add.length !== s.add.length) return false;
        for (let i = 0; i < t.add.length; i++) {
            if (!equal(s.add[i], t.add[i])) return false;
        }
        return true;
    } else {
        if (t.type !== "psi") return false;
        let alpha = [...s.arr];
        let beta = [...t.arr];
        const fillZ = (a: T[],b: T[]) => a.concat(new Array<T>(b.length-a.length).fill(Z));
        if (alpha.length < beta.length) {
            alpha = fillZ(alpha, beta);
        } else if (alpha.length > beta.length) {
            beta = fillZ(beta, alpha);
        }
        for (let k = alpha.length-1; k > -1; k--) {
            if (!equal(alpha[k], beta[k])) return false;
        }
        return true;
    }
}

export function psi(arr: T[]): PT {
    return { type: "psi", arr: [...arr] };
}

// a+b を適切に整形して返す
export function plus(a: T, b: T): T {
    if (a.type === "zero") {
        return b;
    } else if (a.type === "plus") {
        if (b.type === "zero") {
            return a;
        } else if (b.type === "plus") {
            return { type: "plus", add: a.add.concat(b.add) };
        } else {
            return { type: "plus", add: [...a.add, b] };
        }
    } else {
        if (b.type === "zero") {
            return a;
        } else if (b.type === "plus") {
            return { type: "plus", add: [a, ...b.add] };
        } else {
            return { type: "plus", add: [a, b] };
        }
    }
}

// 要素が1個の配列は潰してから返す
export function sanitize_plus_term(add: PT[]): PT | AT {
    if (add.length === 1) {
        return add[0];
    } else {
        return { type: "plus", add: add };
    }
}

// s < t を判定
export function less_than(s: T, t: T): boolean {
    if (s.type === "zero") {
        return t.type !== "zero";
    } else if (s.type === "psi") {
        if (t.type === "zero") {
            return false;
        } else if (t.type === "psi") {
            let alpha = [...s.arr];
            let beta = [...t.arr];
            const fillZ = (a: T[],b: T[]) => a.concat(new Array<T>(b.length-a.length).fill(Z));
            if (alpha.length < beta.length) {
                alpha = fillZ(alpha, beta);
            } else if (alpha.length > beta.length) {
                beta = fillZ(beta, alpha);
            }
            for (let k = alpha.length-1; k > -1; k--) {
                if (!equal(alpha[k], beta[k])) return less_than(alpha[k], beta[k]);
            }
            return false;
        } else {
            return equal(s, t.add[0]) || less_than(s, t.add[0]);
        }
    } else {
        if (t.type === "zero") {
            return false;
        } else if (t.type === "psi") {
            return less_than(s.add[0], t)
        } else {
            const s2 = sanitize_plus_term(s.add.slice(1));
            const t2 = sanitize_plus_term(t.add.slice(1));
            return less_than(s.add[0], t.add[0]) ||
                (equal(s.add[0], t.add[0]) && less_than(s2, t2));
        }
    }
}