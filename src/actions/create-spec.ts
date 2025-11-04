import * as core from "@actions/core";
import * as exec from "@actions/exec";

interface SpecOutput {
  title: string;
  body: string;
}

async function createSpec() {
  const finalOutput = core.getInput("final_output", { required: true });
  const repository = core.getInput("repository", { required: true });
  const requirementsIssueNumber = core.getInput("requirements_issue_number", { required: true });

  const json: SpecOutput = JSON.parse(finalOutput);

  await exec.exec("gh", [
    "issue",
    "create",
    "--title",
    json.title,
    "--body",
    json.body,
    "--label",
    "doc-type:spec,doc-state:draft",
    "--repo",
    repository,
  ]);

  await exec.exec("gh", [
    "issue",
    "edit",
    requirementsIssueNumber,
    "--add-label",
    "doc-state:completed",
    "--remove-label",
    "doc-state:draft",
    "--repo",
    repository,
  ]);
}

createSpec();
