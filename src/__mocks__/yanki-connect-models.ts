type Model = {
  css: string;
  did: null;
  flds: ModelField[];
  id: number;
  latexPost: string;
  latexPre: string;
  latexsvg: boolean;
  mod: number;
  name: string;
  originalStockKind: number;
  req: Array<[number, string, number[]]>;
  sortf: number;
  tmpls: ModelTemplate[];
  type: number;
  usn: number;
};

// Assuming these are the related types (you might need to define them)
type ModelField = {
  collapsed: boolean;
  description: string;
  excludeFromSearch: boolean;
  font: string;
  id: number;
  name: string;
  ord: number;
  plainText: boolean;
  preventDeletion: boolean;
  rtl: boolean;
  size: number;
  sticky: boolean;
  tag: null;
};

// Specialized fields
const exampleField: ModelField = {
  collapsed: true,
  description: "Example sentences",
  excludeFromSearch: false,
  font: "Times New Roman",
  id: 1700000000006,
  name: "Example",
  ord: 3,
  plainText: false,
  preventDeletion: false,
  rtl: false,
  size: 16,
  sticky: false,
  tag: null,
};

type ModelTemplate = {
  afmt: string;
  bafmt: string;
  bfont: string;
  bqfmt: string;
  bsize: number;
  did: null;
  id: number;
  name: string;
  ord: number;
  qfmt: string;
};

// Basic card template
const basicCardTemplate: ModelTemplate = {
  afmt: `{{Front}}<hr id="answer">{{Back}}`,
  bafmt: "",
  bfont: "Arial",
  bqfmt: "",
  bsize: 18,
  did: null,
  id: 1700000000010,
  name: "Card 1",
  ord: 0,
  qfmt: `{{Front}}`,
};

// Example instance
export const exampleModel: Model = {
  css: `.card {
        font-family: Arial;
        font-size: 20px;
        text-align: center;
        color: black;
        background-color: white;
    }`,
  did: null,
  flds: [exampleField],
  id: 1700000000000,
  latexPost: "\\end{document}",
  latexPre:
    "\\documentclass[12pt]{article}\\usepackage{amsmath}\\usepackage{amssymb}\\usepackage{amsfonts}\\usepackage{graphicx}\\usepackage{color}\\begin{document}",
  latexsvg: false,
  mod: 1700000000000,
  name: "Basic",
  originalStockKind: 0,
  req: [
    [0, "all", [0, 1]], // All fields 0 and 1 required
    [1, "any", [0, 2]], // Any of fields 0 or 2 required
    [2, "none", []], // No fields required
    [3, "all", [0]], // Field 0 required
    [4, "any", [1, 2]], // Any of fields 1 or 2 required
  ],
  sortf: 0,
  tmpls: [basicCardTemplate],
  type: 0,
  usn: -1,
};
