import github from "@actions/github";
import { Context } from "@actions/github/lib/context";

export function getContext(): Context {
  return github.context;
}
