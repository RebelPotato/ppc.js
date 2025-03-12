class p {
  constructor() {
    this.width = 0;
  }
  format(t, n, r) {
    return "";
  }
  fstep(t, n, r) {
    return "";
  }
  toString() {
    return "Empty";
  }
}
class k {
  constructor(t) {
    this.text = t, this.width = t.length;
  }
  format(t, n, r) {
    return r.column += this.width, this.text;
  }
  fstep(t, n, r) {
    return n.column += this.width, this.text;
  }
  toString() {
    return JSON.stringify(this.text);
  }
}
class S {
  constructor(t, n) {
    this.doc1 = t, this.doc2 = n, this.width = t.width;
  }
  format(t, n, r) {
    return t ? this.doc1.format(!0, n, r) : this.doc2.format(!1, n, r);
  }
  fstep(t, n, r) {
    return t.doc = t.flat ? this.doc1 : this.doc2, null;
  }
  toString() {
    return `(IfFlat ${this.doc1} ${this.doc2})`;
  }
}
class A {
  constructor() {
    this.width = 1 / 0;
  }
  format(t, n, r) {
    return console.assert(!t), r.line = r.line + 1, r.column = n, r.lastIndent = n, `
` + " ".repeat(n);
  }
  fstep(t, n, r) {
    return n.line = n.line + 1, n.column = t.indent, n.lastIndent = t.indent, `
` + " ".repeat(t.indent);
  }
  toString() {
    return "HardLine";
  }
}
class x {
  constructor(t) {
    this.width = t;
  }
  format(t, n, r) {
    return r.column += this.width, " ".repeat(this.width);
  }
  fstep(t, n, r) {
    return n.column += this.width, " ".repeat(this.width);
  }
  toString() {
    return `(Blank ${this.width})`;
  }
}
class $ {
  constructor(t, n) {
    this.doc1 = t, this.doc2 = n, this.width = t.width + n.width;
  }
  format(t, n, r) {
    const i = this.doc1.format(t, n, r), s = this.doc2.format(t, n, r);
    return i + s;
  }
  fstep(t, n, r) {
    return t.doc = this.doc1, r.push({
      type: l.Append1,
      doc2: this.doc2,
      flat: t.flat,
      indent: t.indent
    }), null;
  }
  toString() {
    return `(Append ${this.doc1} ${this.doc2})`;
  }
}
class u {
  constructor(t) {
    this.doc = t, this.width = t.width;
  }
  format(t, n, r) {
    return this.doc.format(
      t || r.canFlatten(r.column + this.doc.width),
      n,
      r
    );
  }
  fstep(t, n, r) {
    return t.doc = this.doc, t.flat = t.flat || n.canFlatten(n.column + this.doc.width), null;
  }
  toString() {
    return `(Group ${this.doc})`;
  }
}
class I {
  constructor(t, n) {
    this.indent = t, this.doc = n, this.width = n.width;
  }
  format(t, n, r) {
    return this.doc.format(t, Math.max(n + this.indent, 0), r);
  }
  fstep(t, n, r) {
    return t.doc = this.doc, t.indent = Math.max(t.indent + this.indent, 0), null;
  }
  toString() {
    return `(Nest ${this.indent} ${this.doc})`;
  }
}
class b {
  constructor(t) {
    this.doc = t, this.width = t.width;
  }
  format(t, n, r) {
    return this.doc.format(t, r.column, r);
  }
  fstep(t, n, r) {
    return t.doc = this.doc, t.indent = n.column, null;
  }
  toString() {
    return `(Align ${this.doc})`;
  }
}
class w {
  constructor(t, n, r, i, s) {
    this.lineWidth = t, this.ribbonWidth = n, this.lastIndent = r, this.line = i, this.column = s;
  }
  canFlatten(t) {
    return t <= this.lineWidth && t <= this.ribbonWidth + this.lastIndent;
  }
}
const T = (e, t, n) => {
  let r = new w(e, t, 0, 0, 0);
  const i = r.canFlatten(n.width);
  return n.format(i, 0, r);
}, l = {
  Append1: 0,
  Append2: 1
};
function F(e, t, n) {
  const r = e.pop();
  if (r.type === l.Append1)
    return n.doc = r.doc2, n.flat = r.flat, n.indent = r.indent, e.push({ type: l.Append2, s1: t }), null;
  if (r.type === l.Append2)
    return r.s1 + t;
}
const W = (e, t, n) => {
  let r = new w(e, t, 0, 0, 0), i = { doc: n, indent: 0, flat: r.canFlatten(n.width) };
  const s = [];
  let h = null;
  for (let a = 0; a < 5e5; a++)
    if (h === null)
      h = i.doc.fstep(i, r, s);
    else {
      if (s.length === 0) return h;
      h = F(s, h, i);
    }
  throw new Error(
    "Exceeded maximum number of steps. Do you really need to pretty print that?"
  );
}, c = new p(), o = (e) => e instanceof p, m = (e, t) => o(e) && o(t) ? c : new S(e, t), _ = (e) => e === 0 ? c : new x(e), g = new A(), N = (e) => m(_(e), g), B = m(_(1), g), G = (e) => {
  if (e.length === 0) return c;
  if (e.includes(`
`))
    throw new Error(
      "Text cannot contain newline characters. Use `hardline` instead."
    );
  return new k(e);
}, d = (e, t) => o(e) ? t : o(t) ? e : new $(e, t), y = (...e) => e.length === 0 ? c : e.reduceRight((t, n) => d(n, t)), f = (e) => o(e) || e.width === 1 / 0 || e instanceof u ? e : new u(e), E = (...e) => e.length === 1 ? f(e[0]) : f(y(...e)), H = (e) => (...t) => {
  const n = y(...t);
  return e === 0 ? n : new I(e, n);
}, K = (e) => o(e) ? c : new b(e), L = (e) => (t, ...n) => n.reduce((r, i) => d(r, E(d(e, i))), t);
export {
  K as align,
  y as append,
  _ as blank,
  c as empty,
  L as flow,
  E as group,
  g as hardline,
  m as ifflat,
  o as isEmpty,
  H as nest,
  W as pretty,
  T as prettyRec,
  B as space,
  G as t,
  N as tab
};
