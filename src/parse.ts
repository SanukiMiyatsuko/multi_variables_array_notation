import { PT, T, Z, sanitize_plus_term, psi, ONE, OMEGA, LOMEGA, IOTA } from "./intersection";

export class Scanner {
    str: string;
    pos: number;
    constructor(str: string) {
        this.str = str.replace(/\s/g, ""); // 空白は無視
        this.pos = 0;
    }

    // 次の文字が期待した文字なら1文字進め、trueを返す。
    // 次の文字が期待した文字でないなら何もせず、falseを返す。
    consume(op: string): boolean {
        if (this.str[this.pos] !== op) return false;
        this.pos += 1;
        return true;
    }

    consumeStrHead(): boolean {
        const ch = this.str[this.pos];
        if (/^[<>[\]1234567890ωΩIwW{}_()]$/.test(ch)) return false;
        this.pos += 1;
        return true;
    }

    // 次の文字が期待した文字なら1文字進める。
    // 次の文字が期待した文字でないなら例外を投げる。
    expect(op: string): void {
        const ch = this.str[this.pos];
        if (ch === undefined)
            throw Error(
                `${this.pos + 1}文字目に${op}が期待されていましたが、これ以上文字がありません`,
            );
        if (ch !== op)
            throw Error(`${this.pos + 1}文字目に${op}が期待されていましたが、${ch}が見つかりました`);
        this.pos += 1;
    }

    parse_number(): T {
        let num = parseInt(this.str[this.pos]);
        this.pos += 1;
        while (/^\d$/.test(this.str[this.pos])) {
            num = num * 10 + parseInt(this.str[this.pos]);
            this.pos += 1;
        }
        if (num === 0) return Z;
        const numterm: PT[] = [];
        while (num > 0) {
            numterm.push(ONE);
            num--;
        }
        return sanitize_plus_term(numterm);
    }

    // 式をパース
    parse_term(): T {
        if (this.str === "") throw Error(`Empty string`);
        if (this.consume("0")) {
            return Z;
        } else {
            let list: PT[] = [];
            do {
                let term: T;
                if (/^\d$/.test(this.str[this.pos])) term = this.parse_number();
                else term = this.parse_principal();
                if (term.type === "zero") throw Error(`0は+で接続できません`);
                else if (term.type === "plus") list = list.concat(term.add);
                else list.push(term);
            } while (this.consume("+"));
            return sanitize_plus_term(list);
        }
    }

    // principal psi termのパース
    parse_principal(): PT {
        if (this.consume("1")) {
            return ONE;
        } else if (this.consume("w") || this.consume("ω")) {
            return OMEGA;
        } else if (this.consume("W") || this.consume("Ω")) {
            return LOMEGA;
        } else if (this.consume("I")) {
            return IOTA;
        } else {
            const argarr: T[] = [];
            let sub: T;
            if (this.consumeStrHead()) {
                if (this.consume("(")) {
                    sub = this.parse_term();
                    if (this.consume(")")) return psi([sub]);
                    this.expect(",");
                } else {
                    this.consume("_");
                    if (this.consume("{")) {
                        sub = this.parse_term();
                        this.expect("}");
                        this.expect("(");
                    } else {
                        sub = this.parse_term();
                        this.expect("(");
                    }
                }
            } else {
                if (this.consume("(")) {
                    sub = this.parse_term();
                    if (this.consume(")")) return psi([sub]);
                    this.expect(",");
                } else {
                    this.expect("{");
                    sub = this.parse_term();
                    this.expect("}");
                    this.expect("(");
                }
            }
            argarr.push(sub);
            do {
                const term = this.parse_term();
                argarr.push(term);
            } while (this.consume(","));
            this.expect(")");
            return psi(argarr.reverse());
        }
    }
}