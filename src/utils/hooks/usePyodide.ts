import { RefObject, useEffect, useState } from "react";
import type { PyodideAPI } from "pyodide";
import { STATUS } from "@/types/pyodide";

export function usePyodide() {
  const [pyodide, setPyodide] = useState<PyodideAPI | null>(null);
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<STATUS>(STATUS.DEFAULT);
  useEffect(() => {
    const init = async () => {
      setStatus(STATUS.LOADING);

      if (!window?.loadPyodide) return;

      const py = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });

      // load & install needed python libraries
      await py.loadPackage(["micropip", "matplotlib", "numpy"]);
      const micropip = py.pyimport("micropip");
      await micropip.install("matplotlib-pyodide");
      await micropip.install("numpy");

      py.globals.set("send_output", (msg: string, newLine = true) =>
        setOutput((prev) => prev + msg + (newLine ? "\n" : "")),
      );
      py.globals.set(
        "get_input",
        (prompt_text: string) => prompt(prompt_text) + "\n",
      );

      py.runPython(PYODIDE_OVERWRITER_CODE);

      setPyodide(py);

      setStatus(STATUS.DEFAULT); // library is loaded
    };
    init();
  }, []);

  const runner = (
    code: string,
    renderPoint?: RefObject<HTMLElement | null>,
  ) => {
    setStatus(STATUS.EXECUTING);
    setOutput(""); // clear output result first

    document.pyodideMplTarget = renderPoint?.current;

    if (!pyodide) return;

    pyodide.runPythonAsync(code).then(() => setStatus(STATUS.EXECUTED));

    document.pyodideMplTarget = renderPoint?.current;
  };

  return { runner, output, status };
}

const PYODIDE_OVERWRITER_CODE = `
import sys

class JsConsole:
    def write(self, s):
        if s.strip():
            send_output(s)
    def flush(self):
        pass

sys.stdout = JsConsole()
sys.stderr = JsConsole()

def input(prompt_text=""):
    if prompt_text:
        send_output(prompt_text, False)
    return get_input(prompt_text)
`;
