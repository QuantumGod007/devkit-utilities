export async function copyText(text: string) {
  if (!text) throw new Error("Generate a result before copying.");
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText)
    throw new Error(
      "Clipboard requires HTTPS or localhost. Select the output and copy it manually.",
    );
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new Error(
      "Clipboard permission denied. Select the output and copy it manually.",
    );
  }
}
