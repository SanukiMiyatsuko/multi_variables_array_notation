import { useState } from 'react';
import './App.css';
import { headNameReplace, Scanner } from "./parse";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Hyouki, less_than, Options, termToString, variable_length, equalize, T, loose } from './intersection';
import { switchFunc } from './junction';

type Operation = "fund" | "dom" | "less_than";

function App() {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [inputC, setInputC] = useState("");
  const [codeComment, setCodeComment] = useState("");
  const [selected, setSelected] = useState("亜");
  const [output, setOutput] = useState("入力：\n\n出力：");
  const [outputError, setOutputError] = useState("");
  const [showHide, setShowHide] = useState(false);
  const [options, setOptions] = useState<Options>({
    checkOnOffo: false,
    checkOnOffO: false,
    checkOnOffI: false,
    checkOnOffF: false,
    checkOnOffA: false,
    checkOnOffB: false,
    checkOnOffp: false,
    checkOnOffT: false,
  });

  const compute = (operation: Operation) => {
    setOutput("");
    setOutputError("");
    try {
      let x = inputA ? new Scanner(inputA, selected).parse_term() : null;
      if (!x) throw Error("Aの入力が必要です");
      let y = inputB ? new Scanner(inputB, selected).parse_term() : null;

      x = loose(x);
      const xLength = variable_length(x);
      let lambda = xLength;
      if (y) {
        y = loose(y);
        lambda = Math.max(xLength, variable_length(y));
        if (options.checkOnOffF) y = equalize(y, lambda);
      }

      if (options.checkOnOffF) x = equalize(x, lambda);
      const inputStrx = termToString(x, options, selected, lambda);
      let inputStry: string;
      let inputStr: string;

      if (operation === "less_than") {
        if (!y) throw Error("Bの入力が必要です");
        inputStry = termToString(y, options, selected, lambda);
        inputStr = options.checkOnOffT ? `入力：$${inputStrx} \\lt ${inputStry}$` : `入力：${inputStrx} < ${inputStry}`;
        setOutput(`${inputStr}\n\n出力：${less_than(x, y) ? "真" : "偽"}`);
        return;
      }

      const reversed = inputC.split('').reverse().join('');

      const func: Hyouki = switchFunc(selected);
      let result: T;
      result = (() => {
        switch (operation) {
          case "fund":
            if (!y) throw Error("Bの入力が必要です");
            inputStry = termToString(y, options, selected, lambda);
            inputStr = options.checkOnOffT ? `入力：$${inputStrx}[${inputStry}]$` : `入力：${inputStrx}[${inputStry}]`;
            return func.fund(x, y, reversed);
          case "dom":
            inputStr = options.checkOnOffT ? `入力：$\\textrm{dom}(${inputStrx})$` : `入力：dom(${inputStrx})`;
            return func.dom(x, reversed);
          default:
            throw new Error("不明な操作");
        }
      })();

      result = loose(result);
      lambda = variable_length(result);
      if (options.checkOnOffF) result = equalize(result, lambda);

      let strTerm = termToString(result, options, selected, lambda);
      strTerm = `\n\n出力：${options.checkOnOffT ? `$${strTerm}$` : strTerm}`;

      setOutput(`${inputStr}${strTerm}`);
    } catch (error) {
      if (error instanceof Error) setOutputError(error.message);
      else setOutputError("不明なエラー");
      console.error("Error in compute:", error);
    }
  };

  const handleCheckboxChange = (key: keyof Options) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: !prevOptions[key],
    }));
  };

  const inputcode = (inputcode: string) => {
    setInputC(inputcode);
    setCodeComment("");
    let result: boolean;
    if (selected === "C") {
      result = /^([RF]*F)$/.test(inputcode);
    } else {
      result = /^([MRF]*F)$/.test(inputcode);
      if (result) result = /^(.*[RF]F)$/.test(inputcode) || inputcode.length === 1;
    }
    if (!result) setCodeComment("ψコードではない文字列です");
    return;
  }

  return (
    <div className="app">
      <header>多変数配列表記計算機</header>
      <main>
        <p className="rdm">
        入力はψ(a_n,a_&#123;n-1&#125;,...,a_3,a_2,a_1), ψ_&#123;a_n&#125;(a_&#123;n-1&#125;,...,a_3,a_2,a_1)の形式で行ってください。<br />
          変数の個数はばらばらでも大丈夫です。<br />
          {(selected !== "ψ" && selected !== "C") && <>ψは{selected}としても大丈夫です。<br /></>}
          _, &#123;, &#125;は省略可能です。<br />
          略記として、1 := ψ(0,0,...,0,0,0), n := 1 + 1 + ...(n個の1)... + 1, ω := ψ(0,0,...,0,0,1), Ω := ψ(0,0,...,0,1,0), I := ψ(0,0,...,1,0,0)が使用可能。<br />
          また、ψは"p"で、{(selected !== "ψ" && selected !== "C") && <>または{selected}は"{headNameReplace(selected)}"で、</>}ωはwで、ΩはWで代用可能です。
        </p>
        A:
        <input
          className="input is-primary"
          value={inputA}
          onChange={e => setInputA(e.target.value)}
          type="text"
          placeholder="入力A"
        />
        B:
        <input
          className="input is-primary"
          value={inputB}
          onChange={e => setInputB(e.target.value)}
          type="text"
          placeholder="入力B"
        />
        {selected === "C" &&
          <>ψコード:
          <input
            className="input is-primary"
            value={inputC}
            onChange={e => inputcode(e.target.value)}
            type="text"
            placeholder="CODE"
          /><br />
          {codeComment}</>
        }
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
            <select value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="〇">多変数〇関数</option>
              <option value="亜">多変数亜関数</option>
              <option value="亞">多変数亞関数</option>
              <option value="ψ">くまくま(大嘘)多変数ψ</option>
              <option value="C">2ψコード</option>
            </select>
          </div>
        </div>
        <input type="button" value="オプション" onClick={() => setShowHide(!showHide)} className="button is-primary is-light is-small" />
        {showHide && (
          <ul>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffo} onChange={() => handleCheckboxChange('checkOnOffo')} />
              &nbsp;{(options.checkOnOffp || selected === "C") ? "ψ" : selected}(0,0,...,0,0,1)をωで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffO} onChange={() => handleCheckboxChange('checkOnOffO')} />
              &nbsp;{(options.checkOnOffp || selected === "C") ? "ψ" : selected}(0,0,...,0,1,0)をΩで出力
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffI} onChange={() => handleCheckboxChange('checkOnOffI')} />
              &nbsp;{(options.checkOnOffp || selected === "C") ? "ψ" : selected}(0,0,...,1,0,0)をIで出力
            </label></li>
            <li><label className="checkbox">
            <input type="checkbox" checked={options.checkOnOffF} onChange={() => handleCheckboxChange('checkOnOffF')} />
              変数の個数を最大数で固定して表示
            </label></li>
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffA} onChange={() => handleCheckboxChange('checkOnOffA')} />
              &nbsp;{(options.checkOnOffp || selected === "C") ? "ψ" : selected}(a_n,a_&#123;n-1&#125;,...,a_3,a_2,a_1)を{(options.checkOnOffp || selected === "C") ? "ψ" : selected}_&#123;a_n&#125;(a_n,a_&#123;n-1&#125;,...,a_3,a_2,a_1)で表示
            </label></li>
            {options.checkOnOffA && (
              <li><ul><li><label className="checkbox">
                <input type="checkbox" checked={options.checkOnOffB} onChange={() => handleCheckboxChange('checkOnOffB')} />
                &nbsp;全ての&#123; &#125;を表示
              </label></li></ul></li>
            )}
            {(selected !== "ψ" && selected !== "C") && (
              <li><label className="checkbox">
                <input type="checkbox" checked={options.checkOnOffp} onChange={() => handleCheckboxChange('checkOnOffp')} />
                &nbsp;{selected}をψで表示
              </label></li>
            )}
            <li><label className="checkbox">
              <input type="checkbox" checked={options.checkOnOffT} onChange={() => handleCheckboxChange('checkOnOffT')} />
              &nbsp;TeXで出力
            </label></li>
          </ul>
        )}
        <div className="box is-primary">
          {outputError !== "" ? (
            <div className="notification is-danger">{outputError}</div>
          ) : (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {output}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </main>
      <footer>
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:Naruyoko/%EF%BC%9F%E2%86%92%CF%86%E2%86%92%CF%88%E2%86%92%E4%B8%89#%E5%A4%9A%E5%A4%89%E6%95%B0%E3%80%87%E9%96%A2%E6%95%B0" target="_blank" rel="noreferrer">Definition of "Multi Variables 〇 Function"</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:Naruyoko" target="_blank" rel="noreferrer">Naruyoko</a>, Retrieved 2024/08/03 <br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:Mitsuki1729/%E8%A9%A6%E4%BD%9C:%E3%81%8F%E3%81%BE%E3%81%8F%E3%81%BE(%E5%A4%A7%E5%98%98)%E5%A4%9A%E5%A4%89%E6%95%B0%CE%A8" target="_blank" rel="noreferrer">Definition of "Kumakuma (Ohuso) Multi Variables ψ Function"</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:Mitsuki1729" target="_blank" rel="noreferrer">Mitsuki1729</a>, Retrieved 2024/08/03 <br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E3%81%BF%E3%81%9A%E3%81%A9%E3%82%89/2%E7%A8%AE%E9%A1%9E%E3%81%AE%E9%96%89%E7%82%B9%E3%81%AB%E3%82%88%E3%82%8B%E5%A4%9A%E5%A4%89%E6%95%B0%E9%85%8D%E5%88%97%E3%81%AE%E5%88%86%E9%A1%9E" target="_blank" rel="noreferrer">Definition of "ψ code"</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:%E3%81%BF%E3%81%9A%E3%81%A9%E3%82%89" target="_blank" rel="noreferrer">みずどら</a>, Retrieved 2024/08/06 <br />
        <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:%E7%AB%B9%E5%8F%96%E7%BF%81/%E3%83%96%E3%83%AD%E3%82%B0%E8%A8%98%E4%BA%8B%E3%81%BE%E3%81%A8%E3%82%81" target="_blank" rel="noreferrer">Definition of other functions</a> by <a href="https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC:%E7%AB%B9%E5%8F%96%E7%BF%81" target="_blank" rel="noreferrer">竹取翁</a>, Retrieved 2024/08/03 <br />
        The program <a href="https://github.com/SanukiMiyatsuko/multi_variables_array_notation" target="_blank" rel="noreferrer">https://github.com/SanukiMiyatsuko/multi_variables_array_notation</a> is licensed by <a href="https://creativecommons.org/licenses/by-sa/3.0/legalcode" target="_blank" rel="noreferrer">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.<br />
        Last updated: 2024/08/06
      </footer>
    </div>
  );
}

export default App;