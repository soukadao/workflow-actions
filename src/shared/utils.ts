import dedent from "ts-dedent";

export function getGeneratedAIComment() {
  return dedent(`
    > [!NOTE]
    > AIによって生成されました。
  `);
}

type T = string | number | boolean;
type Frontmatter = Record<string, T | Array<T>>;

export function parseFrontmatter(body: string): Frontmatter {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = body.match(frontmatterRegex);

  if (!match || !match[1]) {
    throw new Error("format error");
  }

  const frontmatterText = match[1];
  const result: Frontmatter = {};
  const lines = frontmatterText.split("\n");

  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");

    if (!key || valueParts.length === 0) {
      continue;
    }

    let value = valueParts[0].trim();

    try {
      if (value.startsWith("[")) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.every(item =>
          typeof item === "string" || typeof item === "number" || typeof item === "boolean"
        )) {
          result[key] = parsed as Array<T>;
        }
      } else if (value === "true" || value === "false") {
        result[key] = value === "true";
      } else if (!isNaN(Number(value)) && value !== "") {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    } catch {
      result[key] = value;
    }
  }

  return result;
}
