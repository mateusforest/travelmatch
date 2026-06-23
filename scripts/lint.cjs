const fs = require("fs")
const path = require("path")

const roots = ["app", "components", "lib"]
const extensions = new Set([".js", ".jsx", ".ts", ".tsx"])
const findings = []

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) {
        return []
      }

      return walk(fullPath)
    }

    return extensions.has(path.extname(entry.name)) ? [fullPath] : []
  })
}

for (const root of roots) {
  for (const filePath of walk(root)) {
    const source = fs.readFileSync(filePath, "utf8")
    const lines = source.split(/\r?\n/)

    lines.forEach((line, index) => {
      const jsxWindow = lines.slice(index, index + 5).join(" ")

      if (/target=["']_blank["']/.test(line) && !/rel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b/.test(jsxWindow)) {
        findings.push(`${filePath}:${index + 1} target="_blank" must include rel="noopener noreferrer"`)
      }

      if (/NEXT_PUBLIC_OPENAI/.test(line)) {
        findings.push(`${filePath}:${index + 1} OpenAI keys must stay server-side`)
      }

      if (/gen_random_bytes/.test(line)) {
        findings.push(`${filePath}:${index + 1} gen_random_bytes should not be used`)
      }
    })
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"))
  process.exit(1)
}

console.log("Static lint passed.")
