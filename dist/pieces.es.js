class y {
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
class A {
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
class $ {
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
class I {
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
class F {
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
class E {
  constructor(t, n) {
    this.doc1 = t, this.doc2 = n, this.width = t.width + n.width;
  }
  format(t, n, r) {
    const i = this.doc1.format(t, n, r), o = this.doc2.format(t, n, r);
    return i + o;
  }
  fstep(t, n, r) {
    return t.doc = this.doc1, r.push({
      type: p.Append1,
      doc2: this.doc2,
      flat: t.flat,
      indent: t.indent
    }), null;
  }
  toString() {
    return `(Append ${this.doc1} ${this.doc2})`;
  }
}
class g {
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
class T {
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
class W {
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
class S {
  constructor(t, n, r, i, o) {
    this.lineWidth = t, this.ribbonWidth = n, this.lastIndent = r, this.line = i, this.column = o;
  }
  canFlatten(t) {
    return t <= this.lineWidth && t <= this.ribbonWidth + this.lastIndent;
  }
}
const L = (e, t, n) => {
  let r = new S(e, t, 0, 0, 0);
  const i = r.canFlatten(n.width);
  return n.format(i, 0, r);
}, p = {
  Append1: 0,
  Append2: 1
};
function N(e, t, n) {
  const r = e.pop();
  if (r.type === p.Append1)
    return n.doc = r.doc2, n.flat = r.flat, n.indent = r.indent, e.push({ type: p.Append2, s1: t }), null;
  if (r.type === p.Append2)
    return r.s1 + t;
}
const M = (e, t, n) => {
  let r = new S(e, t, 0, 0, 0), i = { doc: n, indent: 0, flat: r.canFlatten(n.width) };
  const o = [];
  let d = null;
  for (let m = 0; m < 5e5; m++)
    if (d === null)
      d = i.doc.fstep(i, r, o);
    else {
      if (o.length === 0) return d;
      d = N(o, d, i);
    }
  throw new Error(
    "Exceeded maximum number of steps. Do you really need to pretty print that?"
  );
}, l = new y(), c = (e) => e instanceof y, b = (e, t) => c(e) && c(t) ? l : new $(e, t), x = (e) => e === 0 ? l : new F(e), k = new I(), s = (e) => b(x(e), k), O = b(x(1), k), w = (e) => {
  if (e.length === 0) return l;
  if (e.includes(`
`))
    throw new Error(
      "Text cannot contain newline characters. Use `tabbedString` instead, which convert them to tabs."
    );
  return new A(e);
}, R = w, u = (e, t) => c(e) ? t : c(t) ? e : new E(e, t), a = (...e) => e.length === 0 ? l : e.reduceRight((t, n) => u(n, t)), _ = (e) => c(e) || e.width === 1 / 0 || e instanceof g ? e : new g(e), h = (...e) => e.length === 1 ? _(e[0]) : _(a(...e)), f = (e) => (...t) => {
  const n = a(...t);
  return e === 0 || c(n) ? n : new T(e, n);
}, B = (...e) => {
  const t = a(...e);
  return c(t) ? l : new W(t);
}, j = (e) => (...t) => {
  if (e === 0) return l;
  const n = a(...t);
  let r = n;
  for (let i = 1; i < e; i++) r = u(r, n);
  return r;
}, G = (e) => (...t) => {
  if (t.length === 0) return l;
  let n = t[0];
  for (let r = 1; r < t.length; r++)
    n = u(n, u(e, t[r]));
  return n;
}, H = (e) => e.split(`
`).map(w), v = (e) => G(s(1))(...H(e)), D = (e) => e.split(/\s+/).map(w), J = (e) => (...t) => t.reduce((n, r) => u(n, h(u(e, r)))), U = (e) => (...t) => B(f(e)(...t)), K = (e, t, n) => (...r) => h(n, f(e)(s(t), ...r)), q = (e, t) => (...n) => h(f(e)(s(t), ...n)), z = (e, t, n, r, i) => K(e, t, a(r, s(t), n))(i), C = (e, t, n, r) => (...i) => h(n, f(e)(s(t), ...i), s(t), r), P = (e, t, n, r) => (...i) => h(n, f(e)(h(s(t)), ...i), h(s(t), r));
export {
  B as align,
  a as append,
  u as append2,
  x as blank,
  l as empty,
  J as flow,
  h as group,
  U as hang,
  k as hardline,
  b as ifflat,
  z as infix,
  c as isEmpty,
  q as jump,
  H as lines,
  f as nest,
  K as prefix,
  M as pretty,
  L as prettyRec,
  j as repeat,
  G as separate,
  P as softSurround,
  O as space,
  C as surround,
  w as t,
  s as tab,
  v as tabbedString,
  R as text,
  D as words
};
