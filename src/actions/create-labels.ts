import * as exec from "@actions/exec";
import labels from "./labels";

async function createLabels() {
  await Promise.all(
    labels.map(async (label) => {
      await exec.exec("gh", [
        "label",
        "create",
        label.name,
        "-d",
        label.description,
        "-c",
        label.color,
        "-f"
      ]);
    })
  );
}

createLabels();
