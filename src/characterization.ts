import { equal, IOTA, LOMEGA, OMEGA, ONE, T } from "./intersection";

export type Options = {
    checkOnOffo: boolean;
    checkOnOffO: boolean;
    checkOnOffI: boolean;
    checkOnOffF: boolean;
    checkOnOffA: boolean;
    checkOnOffB: boolean;
    checkOnOffp: boolean;
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
            if (options.checkOnOffB) {
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
    if (strHead === "C" || strHead === "M") headname = "ψ";
    return abbrviate(term_to_string(t, options, headname), options, headname, lambda);
}

// オブジェクトから文字列へ
function term_to_string_katex(t: T, options: Options, strHead: string): string {
    if (options.checkOnOffp) strHead = "ψ";
    if (t.type === "zero") {
        return "0";
    } else if (t.type === "psi") {
        const tReverse = [...t.arr].reverse();
        let str = strHead;
        if (options.checkOnOffA && tReverse.length > 1) {
            str = str + "_{" + term_to_string_katex(tReverse[0], options, strHead) + "}(";
        } else if (tReverse.length === 1) {
            return str + "(" + term_to_string_katex(tReverse[0], options, strHead) + ")";
        } else {
            str = str + "(" + term_to_string_katex(tReverse[0], options, strHead) + ",";
        }
        str = str + term_to_string_katex(tReverse[1], options, strHead);
        for (let i = 2; i < tReverse.length; i++) {
            str = str + "," + term_to_string_katex(tReverse[i], options, strHead);
        }
        return str + ")";
    } else {
        return t.add.map((x) => term_to_string_katex(x, options, strHead)).join("+");
    }
}

function to_TeX(str: string, options: Options, selected: string): string {
    if (options.checkOnOffp || selected === "ψ" || selected === "C" || selected === "M") {
        str = str.replace(RegExp("ψ", "g"), "\\psi");
    }
    str = str.replace(/ω/g, "\\omega");
    str = str.replace(/Ω/g, "\\Omega");
    str = str.replace(/</g, "\\lt");
    str = str.replace(/dom/g, "\\textrm{dom}");
    return str;
}

export function termToString_katex(t: T, options: Options, strHead: string, lambda: number): string {
    let headname = strHead;
    if (strHead === "C" || strHead === "M") headname = "ψ";
    return to_TeX(abbrviate(term_to_string_katex(t, options, headname), options, headname, lambda), options, strHead);
}