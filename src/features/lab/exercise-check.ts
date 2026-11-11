export type LabMode = "html" | "css" | "javascript" | "htmlcss";

export interface CodeBuffers {
  html: string;
  css: string;
  js: string;
}

const KNOWN_HTML_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "blockquote", "code", "pre",
  "strong", "em", "small", "span", "div",
  "ul", "ol", "li", "dl", "dt", "dd",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "form", "label", "input", "select", "option", "textarea", "button", "fieldset", "legend",
  "a", "img",
  "header", "footer", "nav", "main", "section", "article", "aside", "figure", "figcaption",
  "audio", "video", "iframe", "source", "track",
  "meta", "title", "link", "html", "head", "body",
]);

const CSS_REQUIREMENTS: Record<string, { all?: string[]; any?: string[]; mediaLayout?: boolean }> = {
  "css-fundamentals-what-is-css": { all: ["color", "border"] },
  "css-fundamentals-selectors": { all: ["background", "font-size"] },
  "css-fundamentals-color-background-text": { all: ["background-color", "color"] },
  "css-fundamentals-box-model": { all: ["margin", "padding", "border"] },
  "css-fundamentals-flexbox-layout": { all: ["display:flex"], any: ["gap", "justify-content"] },
  "css-fundamentals-grid-layout": { all: ["display:grid", "grid-template-columns"] },
  "css-fundamentals-responsive-media-queries": { mediaLayout: true },
  "css-fundamentals-transitions-and-basic-animation": { all: ["transition", "transform"] },
};

function stripJavaScript(code: string, removeStrings = false): string {
  const output = code.split("");
  let state: "code" | "line-comment" | "block-comment" | "single" | "double" | "template" = "code";

  const blank = (index: number) => {
    if (output[index] !== "\n" && output[index] !== "\r") output[index] = " ";
  };

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];
    const next = code[index + 1];

    if (state === "code") {
      if (char === "/" && next === "/") {
        blank(index);
        blank(index + 1);
        index += 1;
        state = "line-comment";
      } else if (char === "/" && next === "*") {
        blank(index);
        blank(index + 1);
        index += 1;
        state = "block-comment";
      } else if (char === "'" || char === '"' || char === "`") {
        if (removeStrings) blank(index);
        state = char === "'" ? "single" : char === '"' ? "double" : "template";
      }
      continue;
    }

    if (state === "line-comment") {
      if (char === "\n" || char === "\r") state = "code";
      else blank(index);
      continue;
    }

    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        blank(index);
        blank(index + 1);
        index += 1;
        state = "code";
      } else {
        blank(index);
      }
      continue;
    }

    const delimiter = state === "single" ? "'" : state === "double" ? '"' : "`";
    if (char === "\\") {
      // An escaped quote or backtick is not the end of this literal.
      if (removeStrings) blank(index);
      if (index + 1 < code.length) {
        if (removeStrings) blank(index + 1);
        index += 1;
      }
    } else if (char === delimiter) {
      if (removeStrings) blank(index);
      state = "code";
    } else if (removeStrings) {
      blank(index);
    }
  }

  return output.join("");
}

function codeWithoutComments(mode: LabMode, code: string): string {
  if (mode === "html" || mode === "htmlcss") return code.replace(/<!--[\s\S]*?-->/g, " ");
  if (mode === "css") return code.replace(/\/\*[\s\S]*?\*\//g, " ");
  return stripJavaScript(code);
}

function cssDeclarations(code: string): Array<{ property: string; value: string }> {
  const declarations: Array<{ property: string; value: string }> = [];
  const pattern = /(?:^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]+)\s*(?=[;}])/gim;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    const value = match[2].trim();
    if (value) declarations.push({ property: match[1].toLowerCase(), value });
  }
  return declarations;
}

function passesCssCheck(code: string, exerciseSlug?: string): boolean {
  const clean = codeWithoutComments("css", code);
  const declarations = cssDeclarations(clean);
  if (declarations.length === 0) return false;

  const has = (property: string) =>
    property === "background"
      ? declarations.some((item) => item.property === "background" || item.property === "background-color")
      : declarations.some((item) => item.property === property);
  const hasDisplay = (value: "flex" | "grid") =>
    declarations.some((item) => item.property === "display" && item.value.toLowerCase() === value);
  const requirement = exerciseSlug ? CSS_REQUIREMENTS[exerciseSlug] : undefined;

  if (!requirement) {
    return declarations.some((item) =>
      ["color", "background", "background-color", "display", "grid-template-columns", "flex-direction", "padding", "margin", "border", "font-size", "gap", "transition", "transform"].includes(item.property),
    );
  }

  if (requirement.mediaLayout) {
    const mediaBlock = clean.match(/@media\s*\([^)]*\)\s*\{([\s\S]*?)\}/i)?.[1] ?? "";
    const mediaDeclarations = cssDeclarations(mediaBlock);
    return mediaDeclarations.some((item) => item.property === "display" && /^(grid|flex)$/i.test(item.value));
  }

  const allPassed = (requirement.all ?? []).every((required) => {
    if (required === "display:flex") return hasDisplay("flex");
    if (required === "display:grid") return hasDisplay("grid");
    return has(required);
  });
  const anyPassed = !requirement.any || requirement.any.some(has);
  return allPassed && anyPassed;
}

/**
 * A lightweight, local structural check—not an automatic judge. It rejects
 * untouched starters and requires actual content/declarations/code tokens;
 * the preview's sandbox and this check are not security boundaries.
 */
export function simpleCheck(mode: LabMode, buffers: CodeBuffers, starterCode: string, exerciseSlug?: string): boolean {
  const activeCode = mode === "javascript" ? buffers.js : mode === "css" ? buffers.css : buffers.html;
  const normalize = (code: string) => codeWithoutComments(mode, code).replace(/\s+/g, " ").trim();

  // Comments and formatting alone do not count as a solution.
  if (normalize(activeCode) === normalize(starterCode)) return false;

  if (mode === "html" || mode === "htmlcss") {
    const code = codeWithoutComments("html", buffers.html);
    const found = new Set<string>();
    const pattern = /<([a-z][a-z0-9]*)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      const tag = match[1].toLowerCase();
      if (KNOWN_HTML_TAGS.has(tag)) found.add(tag);
    }
    const visibleText = code
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .trim();
    return found.size >= 2 && visibleText.length > 0;
  }

  if (mode === "css") return passesCssCheck(buffers.css, exerciseSlug);

  const code = stripJavaScript(buffers.js, true);
  const hasMeaningfulConstruct =
    /\bconsole\s*\.\s*log\b|\breturn\b|\bif\b|\bfor\b|\bwhile\b|\bfunction\b|=>/.test(code);
  return code.trim().length > 10 && hasMeaningfulConstruct;
}
