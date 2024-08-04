type ZT = { readonly type: "zero" };
type AT = { readonly type: "plus", readonly add: PT[] };
type PT = { readonly type: "psi", readonly arr: ST };
type ST = { readonly type: "mat", readonly ele: ET[] };
type ET = { readonly type: "elem", readonly sub: T | ST, readonly arg: ST };
type T = ZT | AT | PT;

function equalt(s: T, t: T): boolean {
    if (s.type === "zero") {
        return t.type === "zero"
    } else if (s.type === "plus") {
        if (t.type !== "plus") return false;
        for (let i = 0; i < t.add.length; i++) {
            if (!equalt(s.add[i], t.add[i])) return false;
        }
        return true;
    } else {
        if (t.type !== "psi") return false;
        const tLength = t.arr.ele.length;
        for (let k = 0; k < tLength; k++) {
            if (!equalet(s.arr.ele[k], t.arr.ele[k])) return false;
        }
        return true;
    }
}

function equalet(s: ET, t: ET): boolean {
    if (s.sub.type === "mat") {
        if (t.sub.type !== "mat") return false;
        const tsub = t.sub;
        return ((s.sub.ele.length === tsub.ele.length) && s.sub.ele.every((x, i) => equalet(x, tsub.ele[i])) 
            && (s.arg.ele.length === t.arg.ele.length) && s.arg.ele.every((x, i) => equalet(x, t.arg.ele[i])));
    } else {
        if (t.sub.type === "mat") return false;
        return (equalt(s.sub, t.sub) && (s.arg.ele.length === t.arg.ele.length) && s.arg.ele.every((x, i) => equalet(x, t.arg.ele[i])));
    }
}