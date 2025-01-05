import { useState } from "react";
import "./App.css";
import { Scanner } from "./parse";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { less_than, variable_length, T, loose } from "./intersection";
import { Hyouki, switchFunc } from "./junction";
import { Options, termToString, termToString_katex } from "./characterization";

type Operation = "fund" | "dom" | "less_than";

function App() {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [inputC, setInputC] = useState("");
  const [codeComment, setCodeComment] = useState("");
  const [selected, setSelected] = useState("亜");
  const [printInput_katex, setPrintInput_katex] = useState("");
  const [output_katex, setOutput_katex] = useState("");
  const [printInput, setPrintInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputError, setOutputError] = useState("");
  const [showHide, setShowHide] = useState(false);
  const [optionT, setOptionT] = useState(false);
  const [options, setOptions] = useState<Options>({
    checkOnOffo: false,
    checkOnOffO: false,
    checkOnOffI: false,
    checkOnOffF: false,
    checkOnOffA: false,
    checkOnOffB: false,
    checkOnOffp: false,
  });

  const compute = (operation: Operation) => {
    setPrintInput_katex("");
    setOutput_katex("");
    setPrintInput("");
    setOutput("");
    setOutputError("");
    try {
      const head = rp();
      let x = inputA ? new Scanner(inputA, head).parse_term() : null;
      if (x === null) throw Error("Aの入力が必要です");
      let y = inputB ? new Scanner(inputB, head).parse_term() : null;

      x = loose(x);
      const xLength = variable_length(x);
      let lambda = xLength;
      if (y !== null) {
        y = loose(y);
        lambda = Math.max(xLength, variable_length(y));
      }

      const inputStrx = termToString(x, options, head, lambda);
      const inputStrx_katex = termToString_katex(x, options, head, lambda);
      let inputStry: string;
      let inputStry_katex: string;

      if (operation === "less_than") {
        if (y === null) throw Error("Bの入力が必要です");
        inputStry = termToString(y, options, head, lambda);
        inputStry_katex = termToString_katex(y, options, head, lambda);
        setPrintInput_katex(`入力：$${inputStrx_katex} \\lt ${inputStry_katex}$`);
        setOutput_katex(`出力：$${less_than(x, y) ? "\\textrm{true}" : "\\textrm{false}"}$`);
        setPrintInput(`${inputStrx} < ${inputStry}`);
        setOutput(less_than(x, y) ? "true" : "false");
        return;
      }

      if (selected === "C" || selected === "M") {
        if (inputC === "") throw Error("ψコードの入力が必要です");
        if (!parseCode(inputC)) throw Error("ψコードではありません");
        if (inputC.length < lambda) throw Error("ψコードの長さが足りません");
      }
      const reversed = inputC.split("").reverse().join("");

      const func: Hyouki = switchFunc(selected);
      let result: T;
      result = (() => {
        switch (operation) {
          case "fund":
            if (y === null) throw Error("Bの入力が必要です");
            inputStry = termToString(y, options, head, lambda);
            inputStry_katex = termToString_katex(y, options, head, lambda);
            setPrintInput(`${inputStrx}[${inputStry}]`);
            setPrintInput_katex(`入力：$${inputStrx_katex}[${inputStry_katex}]$`);
            return func.fund(x, y, reversed);
          case "dom":
            setPrintInput(`dom(${inputStrx})`);
            setPrintInput_katex(`入力：$\\textrm{dom}(${inputStrx_katex})$`);
            return func.dom(x, reversed);
          default:
            throw new Error("不明な操作");
        }
      })();

      result = loose(result);
      lambda = Math.max(lambda, variable_length(result));

      setOutput(termToString(result, options, head, lambda));
      setOutput_katex(`出力：$${termToString_katex(result, options, head, lambda)}$`);
    } catch (error) {
      if (error instanceof Error) setOutputError(error.message);
      else setOutputError("不明なエラー");
      console.error("Error in compute:", error);
    }
    return;
  };

  const handleCheckboxChange = (key: keyof Options) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: !prevOptions[key],
    }));
  };

  const parseCode = (inputcode: string): boolean => {
    if (inputcode === "") return true;
    const str = inputcode.replace(/\s/g, "");
    if (selected === "C") {
      return /^([RF]*F)$/.test(str);
    } else {
      const arr = Array.from(inputcode).map((x) => {
        switch (x) {
          case "M": return 2;
          case "R": return 1;
          case "F": return 0;
          default: return null;
        }
      });

      const isValidCode = (arr: (number | null)[]): boolean => {
        for(let i = 0; i < arr.length-1; i++) {
          const arri = arr[i];
          if (arri === null) return false;
          const arri1 = arr[i+1];
          if (arri1 !== null && arri - arri1 >= 2) {
            return false;
          }
        }
        return arr[arr.length-1] == 0;
      }

      return isValidCode(arr);
    }
  };

  const inputcode = (inputcode: string) => {
    setCodeComment("");
    setInputC(inputcode);
    if (!parseCode(inputcode)) setCodeComment("ψコードではない文字列です");
    return;
  };

  const rp = () => {
    if (selected === "あ") return "亜";
    if (options.checkOnOffp || selected === "C" || selected === "M") return "ψ";
    return selected;
  };

  return (
    <div className="app">
      <header>多変数配列表記計算機</header>
      <main>
        <p className="rdm">
          入力は、任意の0 &lt; nに対して、ψ(a_n,a_&#123;n-1&#125;,...,a_2,a_1,a_0), ψ_&#123;a_n&#125;(a_a_&#123;n-1&#125;,...,a_2,a_1,a_0)の形式で行ってください。<br />
          変数の個数はばらばらでも大丈夫です。<br />
          _, &#123;, &#125;は省略可能です。<br />
          略記として、1 := ψ(0), n := 1 + 1 + ...(n個の1)... + 1, ω:= ψ(1), Ω := ψ(1,0), I :=ψ(1,0,0)が使用可能。<br />
          また、ψは他の一文字で、ωはwで、ΩはWで代用可能です。
        </p>
        A:
        <input
          className="input is-primary"
          value={inputA}
          onChange={(e) => setInputA(e.target.value)}
          type="text"
          placeholder="入力A"
        />
        B:
        <input
          className="input is-primary"
          value={inputB}
          onChange={(e) => setInputB(e.target.value)}
          type="text"
          placeholder="入力B"
        />
        {(selected === "C" || selected === "M") && (
          <>
            ψコード:
            <input
              className="input is-primary"
              value={inputC}
              onChange={(e) => inputcode(e.target.value)}
              type="text"
              placeholder="CODE"
            />
            <br />
            {codeComment}
          </>
        )}
        <div className="block">
          <button className="button is-primary" onClick={() => compute("fund")}>
            A[B]を計算
          </button>
          <button className="button is-primary" onClick={() => compute("dom")}>
            dom(A)を計算
          </button>
          <button className="button is-primary" onClick={() => compute("less_than")}>
            A &lt; Bか判定
          </button>
          <div className="select is-rounded">
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="〇">多変数〇関数</option>
              <option value="あ">多変数亜関数 by みずどら</option>
              <option value="亜">多変数亜関数</option>
              <option value="亞">多変数亞関数</option>
              <option value="ψ">くまくま(大嘘)多変数ψ</option>
              <option value="C">2ψコード</option>
              <option value="M">3ψコード</option>
            </select>
          </div>
        </div>
        <input type="button" value="オプション" onClick={() => setShowHide(!showHide)} className="button is-primary is-light is-small"/>
        {showHide && (
          <ul>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffo} onChange={() => handleCheckboxChange("checkOnOffo")}/>
              &nbsp;{rp()}(1)をωで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffO} onChange={() => handleCheckboxChange("checkOnOffO")}/>
              &nbsp;{rp()}(1,0)をΩで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffI} onChange={() => handleCheckboxChange("checkOnOffI")}/>
              &nbsp;{rp()}(1,0,0)をIで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffF} onChange={() => handleCheckboxChange("checkOnOffF")}/>
              変数の個数を最大数で固定して表示
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffA} onChange={() => handleCheckboxChange("checkOnOffA")}/>
              &nbsp;{rp()}(a_n,a_&#123;n-1&#125;,...,a_3,a_2,a_1)を{rp()}_&#123;a_n&#125;(a_n,a_&#123;n-1&#125;,...,a_3,a_2,a_1)で表示
            </label></li>
            {options.checkOnOffA && (
              <li><ul><li><label className="checkbox">
                <input type="checkbox" checked={options.checkOnOffB} onChange={() => handleCheckboxChange("checkOnOffB")}/>
                &nbsp;全ての&#123; &#125;を表示
              </label></li></ul></li>
            )}
            {selected !== "ψ" && selected !== "C" && selected !== "M" && (
              <li><label className="checkbox">
                <input type="checkbox" checked={options.checkOnOffp} onChange={() => handleCheckboxChange("checkOnOffp")}/>
                &nbsp;{rp()}をψで表示
              </label></li>
            )}
            <li><label className="checkbox">
              <input type="checkbox" checked={optionT} onChange={() => setOptionT(!optionT)}/>
              &nbsp;TeXで出力
            </label></li>
          </ul>
        )}
        <div className="box is-primary">
          {outputError !== "" ? (
            <div className="notification is-danger">{outputError}</div>
          ) : (
            <>
              {optionT ? (
                <span>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{printInput_katex}</ReactMarkdown>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{output_katex}</ReactMarkdown>
                </span>
              ) : (
                <span>
                  入力：{printInput}<br />
                  出力：{output}
                </span>
              )}
            </>
          )}
        </div>
      </main>
      <footer>
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:Naruyoko/%EF%BC%9F%E2%86%92%CF%86%E2%86%92%CF%88%E2%86%92%E4%B8%89#%E5%A4%9A%E5%A4%89%E6%95%B0%E3%80%87%E9%96%A2%E6%95%B0" target="_blank" rel="noreferrer">ユーザーブログ:Naruyoko/？→φ→ψ→三 | 巨大数研究 Wiki | Fandom</a>(2024/11/24 閲覧)<br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:Mitsuki1729/%E8%A9%A6%E4%BD%9C:%E3%81%8F%E3%81%BE%E3%81%8F%E3%81%BE(%E5%A4%A7%E5%98%98)%E5%A4%9A%E5%A4%89%E6%95%B0%CE%A8" target="_blank" rel="noreferrer">ユーザーブログ:Mitsuki1729/試作:くまくま(大嘘)多変数Ψ | 巨大数研究 Wiki | Fandom</a>(2024/11/24 閲覧)<br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E3%81%BF%E3%81%9A%E3%81%A9%E3%82%89/2%E7%A8%AE%E9%A1%9E%E3%81%AE%E9%96%89%E7%82%B9%E3%81%AB%E3%82%88%E3%82%8B%E5%A4%9A%E5%A4%89%E6%95%B0%E9%85%8D%E5%88%97%E3%81%AE%E5%88%86%E9%A1%9E" target="_blank" rel="noreferrer">ユーザーブログ:みずどら/2種類の閉点による多変数配列の分類 | 巨大数研究 Wiki | Fandom</a>(2024/11/24 閲覧)<br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E3%81%BF%E3%81%9A%E3%81%A9%E3%82%89/3%E7%A8%AE%E9%A1%9E%E3%81%AE%E9%96%89%E7%82%B9%E3%81%AB%E3%82%88%E3%82%8B%E5%A4%9A%E5%A4%89%E6%95%B0%E9%85%8D%E5%88%97%E3%81%AE%E5%88%86%E9%A1%9E" target="_blank" rel="noreferrer">ユーザーブログ:みずどら/3種類の閉点による多変数配列の分類 | 巨大数研究 Wiki | Fandom</a>(2024/11/24 閲覧)<br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E7%AB%B9%E5%8F%96%E7%BF%81/%E5%A4%9A%E5%A4%89%E6%95%B0%E6%8B%A1%E5%BC%B5%E4%BA%9C%E9%96%A2%E6%95%B0" target="_blank" rel="noreferrer">ユーザーブログ:竹取翁/多変数拡張亜関数 | 巨大数研究 Wiki | Fandom</a>(2024/11/24 閲覧)<br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E7%AB%B9%E5%8F%96%E7%BF%81/%E5%A4%9A%E5%A4%89%E6%95%B0%E4%BA%9E%E9%96%A2%E6%95%B0" target="_blank" rel="noreferrer">ユーザーブログ:竹取翁/多変数亞関数 | 巨大数研究 Wiki | Fandom</a>(2024/11/24 閲覧)<br />
        このページは<a href="https://creativecommons.org/licenses/by-sa/3.0/legalcode" target="_blank" rel="noreferrer">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>の下に公開されます。<br />
      </footer>
    </div>
  );
}

export default App;