import * as exec from "@actions/exec";
import labels from "../shared/labels";

async function createLabels() {
  await Promise.all(
    labels.map(async (label) => {
      await exec.exec("gh", [
        "label",
        "create",
        label.name,
        "--description",
        label.description,
        "--color",
        label.color,
        "--force"
      ]);
    })
  );
}

createLabels();
