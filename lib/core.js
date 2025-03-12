class Empty {
  constructor() {
    this.width = 0;
  }
  format(_flat, _indent, _state) {
    return "";
  }
  fstep(_instr, _state, _kont) {
    return "";
  }
  toString() {
    return "Empty";
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
  fstep(_instr, state, _kont) {
    state.column += this.width;
    return this.text;
  }
  toString() {
    return JSON.stringify(this.text);
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
  fstep(instr, _state, _kont) {
    instr.doc = instr.flat ? this.doc1 : this.doc2;
    return null;
  }
  toString() {
    return `(IfFlat ${this.doc1} ${this.doc2})`;
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
  fstep(instr, state, _kont) {
    state.line = state.line + 1;
    state.column = instr.indent;
    state.lastIndent = instr.indent;
    return "\n" + " ".repeat(instr.indent);
  }
  toString() {
    return "HardLine";
  }
}
class Blank {
  constructor(i) {
    this.width = i;
  }
  format(_flat, _indent, state) {
    state.column += this.width;
    return " ".repeat(this.width);
  }
  fstep(_instr, state, _kont) {
    state.column += this.width;
    return " ".repeat(this.width);
  }
  toString() {
    return `(Blank ${this.width})`;
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
  fstep(instr, _state, kont) {
    instr.doc = this.doc1;
    kont.push({
      type: KontType.Append1,
      doc2: this.doc2,
      flat: instr.flat,
      indent: instr.indent,
    });
    return null;
  }
  toString() {
    return `(Append ${this.doc1} ${this.doc2})`;
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
  fstep(instr, state, _kont) {
    instr.doc = this.doc;
    instr.flat = instr.flat || state.canFlatten(state.column + this.doc.width);
    return null;
  }
  toString() {
    return `(Group ${this.doc})`;
  }
}
class Nest {
  constructor(indent, doc) {
    this.indent = indent;
    this.doc = doc;
    this.width = doc.width;
  }
  format(flat, indent, state) {
    return this.doc.format(flat, Math.max(indent + this.indent, 0), state);
  }
  fstep(instr, _state, _kont) {
    instr.doc = this.doc;
    instr.indent = Math.max(instr.indent + this.indent, 0);
    return null;
  }
  toString() {
    return `(Nest ${this.indent} ${this.doc})`;
  }
}
class Align {
  constructor(doc) {
    this.doc = doc;
    this.width = doc.width;
  }
  format(flat, _indent, state) {
    return this.doc.format(flat, state.column, state);
  }
  fstep(instr, state, _kont) {
    instr.doc = this.doc;
    instr.indent = state.column;
    return null;
  }
  toString() {
    return `(Align ${this.doc})`;
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

const KontType = {
  Append1: 0,
  Append2: 1,
};

// defunctionalized version
function applyKontTop(kont, result, instr) {
  const next = kont.pop();
  if (next.type === KontType.Append1) {
    instr.doc = next.doc2;
    instr.flat = next.flat;
    instr.indent = next.indent;
    kont.push({ type: KontType.Append2, s1: result });
    return null;
  } else if (next.type === KontType.Append2) {
    return next.s1 + result;
  }
}
export const pretty = (lineWidth, ribbonWidth, doc) => {
  let state = new State(lineWidth, ribbonWidth, 0, 0, 0);
  let instr = { doc, indent: 0, flat: state.canFlatten(doc.width) };
  const kont = [];
  let ret = null;
  for (let i = 0; i < 500000; i++) {
    if (ret === null) {
      ret = instr.doc.fstep(instr, state, kont);
    } else {
      if (kont.length === 0) return ret;
      ret = applyKontTop(kont, ret, instr);
    }
  }
  throw new Error(
    "Exceeded maximum number of steps. Do you really need to pretty print that?"
  );
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
      "Text cannot contain newline characters. Use `tabbedString` instead, which convert them to tabs."
    );
  return new Text(text);
};
export const text = t;
export const append2 = (doc1, doc2) => {
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
    const doc = append(...docs);
    if (indent === 0 || isEmpty(doc)) return doc;
    return new Nest(indent, doc);
  };
export const align = (...docs) => {
  const doc = append(...docs);
  return isEmpty(doc) ? empty : new Align(doc);
}
