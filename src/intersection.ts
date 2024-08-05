export type ZT = { readonly type: "zero" };
export type AT = { readonly type: "plus", readonly add: PT[] };
export type PT = { readonly type: "psi", readonly arr: T[] };
export type T = ZT | AT | PT;

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
        const lengthArray = [...s.arr].reverse().map((x) => variable_length(x));
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
        if (s.arr.every((x) => (equal(x, Z)))) return true;
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
        if (t.add.length < s.add.length) return false;
        for (let i = 0; i < t.add.length; i++) {
            if (!equal(s.add[i], t.add[i])) return false;
        }
        return true;
    } else {
        if (t.type !== "psi") return false;
        const sLength = s.arr.length;
        const tLength = t.arr.length;
        for (let k = 0; k < Math.min(sLength, tLength); k++) {
            if (!equal(s.arr[k], t.arr[k])) return false;
        }
        if (sLength < tLength) {
            return t.arr.slice(sLength).every(x => x.type === "zero");
        }
        if (sLength > tLength) {
            return s.arr.slice(tLength).every(x => x.type === "zero");
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
            const sLength = s.arr.length;
            const tLength = t.arr.length;
            const sReverse = [...s.arr].reverse();
            const tReverse = [...t.arr].reverse();
            if (sLength === tLength) {
                for (let k = 0; k < tLength; k++) {
                    if (!equal(sReverse[k], tReverse[k])) return less_than(sReverse[k], tReverse[k]);
                }
                return false;
            } else if (sLength < tLength) {
                let k = 0;
                while (k < tLength - sLength) {
                    if (!equal(tReverse[k], Z)) return true;
                    k++;
                }
                while (k < tLength) {
                    if (!equal(sReverse[k - tLength + sLength], tReverse[k]))
                        return less_than(sReverse[k - tLength + sLength], tReverse[k]);
                    k++;
                }
                return false;
            } else {
                let k = 0;
                while (k < sLength - tLength) {
                    if (!equal(sReverse[k], Z)) return false;
                    k++;
                }
                while (k < sLength) {
                    if (!equal(sReverse[k], tReverse[k - sLength + tLength]))
                        return less_than(sReverse[k], tReverse[k - sLength + tLength]);
                    k++;
                }
                return false;
            }
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

// ===========================================
export interface Hyouki {
    fund(a: T, b: T, code: string): T;
    dom(a: T, code: string): T;
}

export type Options = {
    checkOnOffo: boolean;
    checkOnOffO: boolean;
    checkOnOffI: boolean;
    checkOnOffF: boolean;
    checkOnOffA: boolean;
    checkOnOffB: boolean;
    checkOnOffp: boolean;
    checkOnOffT: boolean;
};

// オブジェクトから文字列へ
function term_to_string(t: T, options: Options, strHead: string): string {
    if (options.checkOnOffp) strHead = "ψ";
    if (t.type === "zero") {
        return "0";
    } else if (t.type === "psi") {
        const tReverse = [...t.arr].reverse();
        let str = strHead;
        if (options.checkOnOffA && tReverse.length > 1) {
            if (options.checkOnOffB || options.checkOnOffT) {
                str = str + "_{" + term_to_string(tReverse[0], options, strHead) + "}(";
            } else {
                if (tReverse[0].type === "zero") {
                    str = str + "_0(";
                } else if (tReverse[0].type === "plus") {
                    if (tReverse[0].add.every((x) => equal(x, ONE))) {
                        str = str + "_" + term_to_string(tReverse[0], options, strHead) + "(";
                    } else {
                        str = str + "_{" + term_to_string(tReverse[0], options, strHead) + "}(";
                    }
                } else {
                    if (equal(tReverse[0], ONE) || (options.checkOnOffo && equal(tReverse[0], OMEGA)) || (options.checkOnOffO && equal(tReverse[0], LOMEGA)) || (options.checkOnOffI && equal(tReverse[0], IOTA))) {
                        str = str + "_" + term_to_string(tReverse[0], options, strHead) + "(";
                    } else {
                        str = str + "_{" + term_to_string(tReverse[0], options, strHead) + "}(";
                    }
                }
            }
        } else if (tReverse.length === 1) {
            return str + "(" + term_to_string(tReverse[0], options, strHead) + ")";
        } else {
            str = str + "(" + term_to_string(tReverse[0], options, strHead) + ",";
        }
        str = str + term_to_string(tReverse[1], options, strHead);
        for (let i = 2; i < tReverse.length; i++) {
            str = str + "," + term_to_string(tReverse[i], options, strHead);
        }
        return str + ")";
    } else {
        return t.add.map((x) => term_to_string(x, options, strHead)).join("+");
    }
}

function to_TeX(str: string, options: Options, strHead: string): string {
    if (options.checkOnOffp || strHead === "ψ") {
        str = str.replace(RegExp("ψ", "g"), "\\psi");
    } else {
        str = str.replace(RegExp(strHead, "g"), "\\textrm{" + strHead + "}");
    }
    str = str.replace(/ω/g, "\\omega");
    str = str.replace(/Ω/g, "\\Omega");
    return str;
}

function abbrviate(str: string, options: Options, strHead: string, lambda: number): string {
    if (options.checkOnOffp) strHead = "ψ";
    str = str.replace(RegExp(strHead + "\\(0\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "_\\{0\\}\\(0\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "_0\\(0\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "\\(0,0\\)", "g"), "1");
    let zerostr = "";
    for (let i = 2; i < lambda; i++) {
        zerostr = zerostr + ",0";
    }
    str = str.replace(RegExp(strHead + "_\\{0\\}\\(0" + zerostr + "\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "_0\\(0" + zerostr + "\\)", "g"), "1");
    str = str.replace(RegExp(strHead + "\\(0,0" + zerostr + "\\)", "g"), "1");
    if (options.checkOnOffo) {
        str = str.replace(RegExp(strHead + "\\(1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "_0\\(1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "\\(0,1\\)", "g"), "ω");
        let zerostr = "";
        for (let i = 2; i < lambda - 1; i++) {
            zerostr = zerostr + ",0";
        }
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(0" + zerostr + ",1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "_0\\(0" + zerostr + ",1\\)", "g"), "ω");
        str = str.replace(RegExp(strHead + "\\(0,0" + zerostr + ",1\\)", "g"), "ω");
    }
    if (options.checkOnOffO) {
        str = str.replace(RegExp(strHead + "_\\{1\\}\\(0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "_1\\(0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "\\(1,0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(1,0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "_0\\(1,0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "\\(0,1,0\\)", "g"), "Ω");
        let zerostr = "";
        for (let i = 2; i < lambda - 2; i++) {
            zerostr = zerostr + ",0";
        }
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(0" + zerostr + ",1,0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "_0\\(0" + zerostr + ",1,0\\)", "g"), "Ω");
        str = str.replace(RegExp(strHead + "\\(0,0" + zerostr + ",1,0\\)", "g"), "Ω");
    }
    if (options.checkOnOffI) {
        str = str.replace(RegExp(strHead + "_\\{1\\}\\(0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "_1\\(0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "\\(1,0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(1,0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "_0\\(1,0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "\\(0,1,0,0\\)", "g"), "I");
        let zerostr = "";
        for (let i = 2; i < lambda - 3; i++) {
            zerostr = zerostr + ",0";
        }
        str = str.replace(RegExp(strHead + "_\\{0\\}\\(0" + zerostr + ",1,0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "_0\\(0" + zerostr + ",1,0,0\\)", "g"), "I");
        str = str.replace(RegExp(strHead + "\\(0,0" + zerostr + ",1,0,0\\)", "g"), "I");
    }
    if (options.checkOnOffT) str = to_TeX(str, options, strHead);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const numterm = str.match(/1(\+1)+/);
        if (!numterm) break;
        const matches = numterm[0].match(/1/g);
        if (!matches) throw Error("そんなことある？");
        const count = matches.length;
        str = str.replace(numterm[0], count.toString());
    }
    return str;
}

export function termToString(t: T, options: Options, strHead: string, lambda: number): string {
    let headname = strHead;
    if (strHead === "C") headname = "ψ";
    return abbrviate(term_to_string(t, options, headname), options, headname, lambda);
}