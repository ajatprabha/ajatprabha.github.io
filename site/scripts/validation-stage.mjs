import { readFile } from "node:fs/promises";
export async function validationStage() {
  try {
    return JSON.parse(
      await readFile(
        new URL("../src/data/validation-stage.json", import.meta.url),
        "utf8",
      ),
    ).stage;
  } catch (error) {
    if (error.code === "ENOENT") return "foundation";
    throw error;
  }
}
