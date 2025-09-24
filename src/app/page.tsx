"use client";
import { STATUS } from "@/types/pyodide";
import { usePyodide } from "@/utils/hooks/usePyodide";
import { useRef } from "react";

export default function Page() {
  const { status } = usePyodide();
  return status !== STATUS.LOADING ? (
    <div>
      <PyodideTest />
      <PyodideTest numbers={[4, 10, 6, 0]} />
    </div>
  ) : (
    <div>Loading pyodide library...</div>
  );
}

export function PyodideTest({ numbers = [1, 2, 3] }) {
  const { runner, output, status } = usePyodide();
  const figureRef = useRef<HTMLDivElement>(null);
  const runCode = () =>
    runner(
      `
import matplotlib.pyplot as plt
print("hi before")
plt.plot([${numbers}])
plt.show()
x = input("get something: ")
print("hi after", x)

`,
      figureRef,
    );

  return (
    <div>
      ---------------------{STATUS[status]}--------------------------
      <button onClick={runCode}>Run Python</button>
      <pre>{output}</pre>
      <div ref={figureRef}></div>
    </div>
  );
}
