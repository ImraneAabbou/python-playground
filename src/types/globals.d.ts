import { PyodideAPI } from "pyodide";

declare global {
  interface Document {
    pyodideMplTarget?: HTMLElement | null;
  }
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideAPI>;
  }
}
