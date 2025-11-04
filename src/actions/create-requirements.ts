import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import { getGeneratedAIComment } from "../shared/utils";
import dedent from "ts-dedent";

interface RequirementsOutput {
  purpose: string;
  requirements: string[];
}

function generateBaseDocument(purpose: string, requirements: string[]): string {
  const rows = requirements.map((requirement, index) => {
    const id = `R${String(index + 1).padStart(3, '0')}`;
    const cleanedRequirement = requirement.replace(/^-\s*/, '');
    return `| ${id.padEnd(14)} | ${cleanedRequirement.padEnd(18)} |`;
  }).join('\n');

  return dedent`
    ${getGeneratedAIComment()}

    # 要求定義ドキュメント

    ## 目的
    ${purpose}

    ## 要求事項 (To-Be)

    |       ID       |     要求内容    |
    | -------------- | ------------------ |
    ${rows}
  `;
}

async function createRequirements() {
  const finalOutput = core.getInput("final_output", { required: true });
  const json: RequirementsOutput = JSON.parse(finalOutput);

  const document = generateBaseDocument(json.purpose, json.requirements);

  await exec.exec("gh", [
    "issue",
    "edit",
    github.context.issue.number.toString(),
    "--body",
    document,
    "--add-label",
    "doc-type:requirements,doc-state:draft",
    "--repo",
    core.getInput("repository", { required: true })
  ])
}

createRequirements();
