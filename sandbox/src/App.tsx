import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { atomone } from "@uiw/codemirror-theme-atomone";
import wasm_bindgen from "dreamql_compiler_wasm";
import { dreamql_to_bigquery } from "dreamql_compiler_wasm";

export enum OutputType {
  SQL,
  Tokens,
  AST,
  Grammar,
}

const code = `table`;

function App() {
  const [dreamQLCode, setDreamQLCode] = useState(code);
  const [outputType, setOutputType] = useState(OutputType.SQL);
  const [wasmInitialized, setWasmInitialized] = useState(false);
  React.useEffect(() => {
    wasm_bindgen().then(() => {
      return setWasmInitialized(true);
    });
  }, []);
  const onChange = React.useCallback((value: any, viewUpdate: any) => {
    setDreamQLCode(value);
  }, []);
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-row bg-gray-700 p-1 pl-5 items-center">
        <div className="basis-1/2 text-xl text-gray-300">
          DreamQL playground
        </div>
        <div className="flex flex-row space-x-2">
          {[OutputType.AST, OutputType.SQL].map((tp) => {
            return (
              <button
                className={
                  "text-gray-300 hover:bg-gray-600 rounded-lg py-1 px-2" +
                  (outputType === tp ? " bg-gray-500 " : "")
                }
                onClick={(_) => setOutputType(tp)}
              >
                {OutputType[tp]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-row h-full">
        <CodeMirror
          className="basis-1/2 bg-red-300 text-xl"
          value={dreamQLCode}
          height="100%"
          theme={atomone}
          extensions={[json()]}
          onChange={onChange}
        />
        <CodeMirror
          className="basis-1/2 text-xl"
          value={
            wasmInitialized
              ? dreamql_to_bigquery(dreamQLCode)
              : "wasm not initialized..."
          }
          height="100%"
          theme={atomone}
          extensions={[sql()]}
        />
      </div>
    </div>
  );
}
export default App;
