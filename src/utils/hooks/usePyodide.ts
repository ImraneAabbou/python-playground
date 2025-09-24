import { useEffect, useState } from "react";
import type { PyodideAPI } from "pyodide";

export function usePyodide() {
  const [pyodide, setPyodide] = useState<PyodideAPI | null>(null);
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const py = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });

      // load micropip and matplotlib-pyodide
      await py.loadPackage(["micropip", "matplotlib", "numpy"]);
      const micropip = py.pyimport("micropip");
      await micropip.install("matplotlib-pyodide");
      await micropip.install("numpy");

      // JS functions
      (window as any).send_output = (msg: string, newLine = true) =>
        setOutput((prev) => prev + msg + (newLine ? "\n" : ""));
      (window as any).get_input = () => window.prompt("Python input:") + "\n";

      // Python code to override print/input
      py.runPython(PYODIDE_OVERWRITER_CODE);

      setPyodide(py);
    };
    init();
  }, []);

  const runner = async (code: string) => {
    if (!pyodide) return;
    await pyodide.runPythonAsync(code);
  };

  return { runner, output };
}

const PYODIDE_OVERWRITER_CODE = `
import sys

class JsConsole:
    def write(self, s):
        if s.strip():
            from js import send_output
            send_output(s)
    def flush(self):
        pass

sys.stdout = JsConsole()
sys.stderr = JsConsole()

def input(prompt_text=""):
    from js import send_output, get_input
    if prompt_text:
        send_output(prompt_text, False)
    return get_input()
`;
