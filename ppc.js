class Empty {
  constructor() {
    this.width = 0;
  }
  format(_flat, _indent, _state) {
    return "";
  }
}
class Text {
  constructor(text) {
    this.text = text;
    this.width = text.length;
  }
  format(_flat, _indent, state) {
    state.column += this.width;
    return this.text;
  }
}
class IfFlat {
  constructor(doc1, doc2) {
    this.doc1 = doc1;
    this.doc2 = doc2;
    this.width = doc1.width;
  }
  format(flat, indent, state) {
    return flat
      ? this.doc1.format(true, indent, state)
      : this.doc2.format(false, indent, state);
  }
}
class HardLine {
  constructor() {
    this.width = Infinity;
  }
  format(flat, indent, state) {
    console.assert(!flat);
    state.line = state.line + 1;
    state.column = indent;
    state.lastIndent = indent;
    return "\n" + " ".repeat(indent);
  }
}
class Blank {
  constructor(i) {
    this.width = i;
  }
  format(flat, indent, state) {
    state.column += this.width;
    return " ".repeat(this.width);
  }
}
class Append {
  constructor(doc1, doc2) {
    this.doc1 = doc1;
    this.doc2 = doc2;
    this.width = doc1.width + doc2.width;
  }
  format(flat, indent, state) {
    const s1 = this.doc1.format(flat, indent, state);
    const s2 = this.doc2.format(flat, indent, state);
    return s1 + s2;
  }
}
class Group {
  constructor(doc) {
    this.doc = doc;
    this.width = doc.width;
  }
  format(flat, indent, state) {
    return this.doc.format(
      flat || state.canFlatten(state.column + this.doc.width),
      indent,
      state
    );
  }
}
class Nest {
  constructor(indent, doc) {
    this.indent = indent;
    this.doc = doc;
    this.width = doc.width + indent;
  }
  format(flat, indent, state) {
    return this.doc.format(flat, Math.max(indent + this.indent, 0), state);
  }
}
class Align {
  constructor(doc) {
    this.doc = doc;
    this.width = doc.width;
  }
  format(flat, indent, state) {
    return this.doc.format(flat, state.column, state);
  }
}

class State {
  constructor(lineWidth, ribbonWidth, lastIndent, line, column) {
    this.lineWidth = lineWidth;
    this.ribbonWidth = ribbonWidth;
    this.lastIndent = lastIndent;
    this.line = line;
    this.column = column;
  }
  canFlatten(column) {
    return (
      column <= this.lineWidth && column <= this.ribbonWidth + this.lastIndent
    );
  }
}

export const prettyRec = (lineWidth, ribbonWidth, doc) => {
  let state = new State(lineWidth, ribbonWidth, 0, 0, 0);
  const flat = state.canFlatten(doc.width);
  return doc.format(flat, 0, state);
};

// defunctionalized version
const pretty = (pageWidth, doc) => {
  let restWidth = pageWidth;
  let flat = false;
  const kont = [];
  function apply(k, s, r) {
    if (k.type === 0) {
      doc = k.d2;
      restWidth = r;
      kont.push({ type: 1, s1: s });
      return null;
    } else {
      return [k.s1 + s, r];
    }
  }

  let ret = null;
  while (1) {
    if (ret === null) {
      ret = doc.match({
        Text: (z) => [z, restWidth - z.length],
        Line: () => (flat ? [" ", restWidth - 1] : ["\n", pageWidth]),
        Append: (d1, d2) => {
          doc = d1;
          kont.push({ type: 0, d2 });
          return null;
        },
        Group: (d) => {
          flat = flat || d.width <= restWidth;
          doc = d;
          return null;
        },
      });
    } else {
      const [s, r] = ret;
      if (kont.length === 0) return s;
      const next = kont.pop();
      ret = apply(next, s, r);
    }
  }
};

// normalizing combinators

export const empty = new Empty();
export const isEmpty = (doc) => doc instanceof Empty;
export const ifflat = (doc1, doc2) =>
  isEmpty(doc1) && isEmpty(doc2) ? empty : new IfFlat(doc1, doc2);
export const blank = (i) => (i === 0 ? empty : new Blank(i));
export const hardline = new HardLine();
export const tab = (i) => ifflat(blank(i), hardline);
export const space = ifflat(blank(1), hardline);
export const t = (text) => {
  if (text.length === 0) return empty;
  if (text.includes("\n"))
    throw new Error(
      "Text cannot contain newline characters. Use `hardline` instead."
    );
  return new Text(text);
};
const append2 = (doc1, doc2) => {
  if (isEmpty(doc1)) return doc2;
  if (isEmpty(doc2)) return doc1;
  return new Append(doc1, doc2);
};
export const append = (...docs) =>
  docs.length === 0 ? empty : docs.reduceRight((acc, doc) => append2(doc, acc));
const groupOne = (doc) => {
  if (isEmpty(doc) || doc.width === Infinity) return doc;
  if (doc instanceof Group) return doc;
  return new Group(doc);
};
export const group = (...docs) =>
  docs.length === 1 ? groupOne(docs[0]) : groupOne(append(...docs));
export const nest =
  (indent) =>
  (...docs) => {
    if (indent < 0)
      throw new Error("Indentation must be non-negative for now.");
    const doc = append(...docs);
    if (indent === 0) return doc;
    return new Nest(indent, doc);
  };
export const align = (doc) => (isEmpty(doc) ? empty : new Align(doc));

// convenience
export const flow =
  (separator) =>
  (doc, ...docs) =>
    docs.reduce((acc, d) => append2(acc, group(append2(separator, d))), doc);
