"use client";
import { usePyodide } from "@/utils/hooks/usePyodide";

export default function PyodideTest() {
  const { runner, output } = usePyodide();

  console.log(output)

  const runCode = async () => {
    const result = await runner(`
import matplotlib.pyplot as plt
print("hi before")
plt.plot([1,2,3])
plt.show()
plt.plot([4,5,6])
plt.show()
x = input("get something: ")
print("hi after", x)

`);
    console.log(result, output);
  };
  
  return (
    <div>
      <button onClick={runCode}>Run Python</button>
      <pre>{output}</pre>
    </div>
  );
}
