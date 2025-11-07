export interface Label {
  name: string;
  description: string;
  color: string;
}

const labels: Label[] = [
  {
    name: "doc-type:requirements",
    description: "Document type: Requirements specification",
    color: "#20798b"
  },
  {
    name: "doc-type:spec",
    description: "Document type: Feature specification",
    color: "#20798b"
  },
  {
    name: "doc-type:task",
    description: "Document type: Task definition",
    color: "#20798b"
  },
  {
    name: "doc-state:draft",
    description: "Document state: Draft",
    color: "#20798b"
  },
  {
    name: "doc-state:completed",
    description: "Document state: Completed",
    color: "#20798b"
  },
  {
    name: "task-state:todo",
    description: "Task state: To Do",
    color: "#20798b"
  },
  {
    name: "task-state:in-progress",
    description: "Task state: In Progress",
    color: "#20798b"
  },
  {
    name: "task-state:done",
    description: "Task state: Done",
    color: "#20798b"
  },
  {
    name: "create-branch",
    description: "Branch has been created for this issue",
    color: "#20798b"
  },
  {
    name: "no-dependency",
    description: "Task has no dependencies and can be started immediately",
    color: "#20798b"
  }
];

export default labels;
