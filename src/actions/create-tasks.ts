import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import { getGeneratedAIComment, parseFrontmatter } from "../shared/utils";
import dedent from "ts-dedent";

interface RequirementDocument {
  requirements_id: number;
  base_branch_name: string;
}

interface TaskOutput {
  tasks: Task[];
}

interface Task {
  id: number;
  overview: string;
  criteria: string[];
  plan: string;
  dependencies: number[];
}

interface IssueResponse {
  id: number;
  number: number;
}

interface RelatedIssues {
  [taskId: number]: IssueResponse
}

async function createTasks() {
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN
  });

  const finalOutput = core.getInput("final_output", { required: true });
  const json: TaskOutput = JSON.parse(finalOutput);
  const frontmatter = parseFrontmatter(core.getInput("body", { required: true })) as unknown as RequirementDocument;
  let issues: RelatedIssues = {};

  for (const task of json.tasks) {
    const branchName = `${frontmatter.base_branch_name}/${task.id}`;
    const document = dedent(`
      ---
      requirements_id: ${frontmatter.requirements_id}
      spec_id: ${github.context.issue.number}
      branch_name: ${branchName}
      ---

      ${getGeneratedAIComment()}

      # タスクドキュメント
      - 要求定義ドキュメント: #${frontmatter.requirements_id}
      - 機能仕様ドキュメント: #${github.context.issue.number}

      ## 概要
      ${task.overview}

      ## To-Be(完了条件のチェックリスト)
      ${task.criteria.map(criterion => `- [ ] ${criterion}`).join('\n')}

      ## 実行計画
      ${task.plan}
    `);

    let labels = ["doc-type:task"];

    if (task.dependencies.length === 0) {
      labels.push("no-dependency");
    }

    const { data: issue } = await octokit.rest.issues.create({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      title: `タスク${task.id}`,
      body: dedent(document),
      labels: labels
    });

    issues[task.id] = issue as IssueResponse;
  }

  for (const task of json.tasks) {
    if (task.dependencies.length > 0) {
      for (const dependencyTaskId of task.dependencies) {
        await octokit.rest.issues.addBlockedByDependency({
          owner: github.context.issue.owner,
          repo: github.context.issue.repo,
          issue_number: issues[task.id].number, // ブロック対象
          issue_id: issues[dependencyTaskId].id, // 依存 Issue
        });
      }
    }
  }
}

createTasks();
