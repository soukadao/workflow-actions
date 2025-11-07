import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import dedent from "ts-dedent";

async function getExistingPhaseBranches(): Promise<string> {
  let branches = "";

  await exec.exec(
    "sh",
    ["-c", "git branch -r | grep -E \"origin/develop/phase-[0-9]+$\" || echo \"\""],
    {
      listeners: {
        stdout: (data: Buffer) => {
          branches += data.toString();
        },
      },
      ignoreReturnCode: true,
    }
  );

  return branches.trim();
}

function extractPhaseNumbers(branches: string): number[] {
  return branches
    .split("\n")
    .map((branch) => {
      const match = branch.match(/origin\/develop\/phase-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => num > 0);
}

async function getNextPhaseNumber(): Promise<number> {
  const branches = await getExistingPhaseBranches();

  if (!branches) {
    return 1;
  }

  const phaseNumbers = extractPhaseNumbers(branches);

  if (phaseNumbers.length === 0) {
    return 1;
  }

  const maxPhase = Math.max(...phaseNumbers);
  return maxPhase + 1;
}

async function getBaseBranch(): Promise<string> {
  const mainCheckExitCode = await exec.exec(
    "git",
    ["show-ref", "--verify", "--quiet", "refs/remotes/origin/main"],
    { ignoreReturnCode: true }
  );

  if (mainCheckExitCode === 0) {
    return "origin/main";
  }

  let defaultBranch = "";
  await exec.exec(
    "sh",
    ["-c", "git remote show origin | grep \"HEAD branch\" | cut -d\" \" -f5"],
    {
      listeners: {
        stdout: (data: Buffer) => {
          defaultBranch += data.toString();
        },
      },
    }
  );

  return `origin/${defaultBranch.trim()}`;
}

async function createAndPushBranch(branchName: string, baseBranch: string): Promise<void> {
  await exec.exec("git", ["checkout", "-b", branchName, baseBranch]);
  await exec.exec("git", ["push", "origin", branchName]);
}

async function updateIssueWithBranch(branchName: string): Promise<void> {
  const repository = core.getInput("repository", { required: true });
  const issueNumber = github.context.issue.number.toString();
  const currentBody = core.getInput("issue_body", { required: true });

  const updatedBody = dedent`
    ${currentBody}

    ## 作成されたブランチ
    \`${branchName}\`
  `;

  await exec.exec("gh", [
    "issue",
    "edit",
    issueNumber,
    "--body",
    updatedBody,
    "--add-label",
    "create-branch",
    "--repo",
    repository,
  ]);
}

async function createPhaseBranch() {
  const nextPhase = await getNextPhaseNumber();

  const branchName = `develop/phase-${nextPhase}`;
  const baseBranch = await getBaseBranch();

  await createAndPushBranch(branchName, baseBranch);
  await updateIssueWithBranch(branchName);

  core.setOutput("branch_name", branchName);
}

createPhaseBranch();
