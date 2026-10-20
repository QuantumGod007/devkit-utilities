import { useRef, useState } from "react";
import { copyText } from "../clipboard";
import { useToast } from "../components/toast";
import {
  MAX_INPUT_LENGTH,
  MAX_MARKDOWN_LENGTH,
  type Tool,
  type ToolAction,
} from "../types";
export function useWorkspace(tool: Tool) {
  const [input, setInput] = useState(tool.sample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  const revision = useRef(0);
  const notify = useToast();
  const limit =
    tool.kind === "markdown" ? MAX_MARKDOWN_LENGTH : MAX_INPUT_LENGTH;
  function updateInput(value: string) {
    if (value.length > limit) {
      setError(`Keep your input under ${limit.toLocaleString()} characters.`);
      return;
    }
    revision.current++;
    setInput(value);
    setOutput("");
    setError("");
    setStatus("");
    setCopying(false);
  }
  function run(action: ToolAction) {
    revision.current++;
    setCopying(false);
    setStatus("");
    try {
      setOutput(action.run(input));
      setError("");
      setStatus(`${action.label} complete. Output is ready.`);
      notify(
        tool.id === "password"
          ? "A fresh password, ready to use."
          : tool.id === "uuid"
            ? "Your identifiers are ready."
            : `${action.label} complete.`,
      );
    } catch (failure) {
      setOutput("");
      const message =
        failure instanceof Error
          ? failure.message
          : "Check your input and try again.";
      setError(message);
      notify("Check your input. Details are shown below the editor.", true);
    }
  }
  async function copy(value = output) {
    const version = revision.current;
    setCopying(true);
    setStatus("");
    try {
      await copyText(value);
      if (version === revision.current) {
        setStatus("Copied to clipboard.");
        notify("Copied. One less thing to do.");
      }
    } catch (failure) {
      if (version === revision.current) {
        const message =
          failure instanceof Error
            ? failure.message
            : "Select the output and copy it manually.";
        setStatus(message);
        notify(message, true);
      }
    } finally {
      if (version === revision.current) setCopying(false);
    }
  }
  return {
    input,
    output,
    error,
    status,
    copying,
    limit,
    updateInput,
    run,
    copy,
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
