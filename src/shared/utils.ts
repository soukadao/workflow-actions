import dedent from "ts-dedent";

export function getGeneratedAIComment() {
  return dedent(`
    > [!NOTE]
    > AIによって生成されました。
  `);
}
