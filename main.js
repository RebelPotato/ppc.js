class Text {
  constructor(text) {
    this.text = text;
    this.width = text.length;
  }
  match(obj) {
    return obj.Text(this.text);
  }
}
class Line {
  constructor() {
    this.width = 1;
  }
  match(obj) {
    return obj.Line();
  }
}
class Append {
  constructor(doc1, doc2) {
    this.doc1 = doc1;
    this.doc2 = doc2;
    this.width = doc1.width + doc2.width;
  }
  match(obj) {
    return obj.Append(this.doc1, this.doc2);
  }
}
class Group {
  constructor(doc) {
    this.doc = doc;
    this.width = doc.width;
  }
  match(obj) {
    return obj.Group(this.doc);
  }
}

const text = (text) => new Text(text);
const line = new Line();
const append2 = (doc1, doc2) => {
  if (doc1 instanceof Text && doc1.text === "") return doc2;
  if (doc2 instanceof Text && doc2.text === "") return doc1;
  return new Append(doc1, doc2);
};
const append = (doc, ...docs) =>
  docs.length === 0 ? doc : append2(doc, append(...docs));
const groupOne = (doc) => {
  if (doc instanceof Text && doc.text === "") return doc;
  if (doc instanceof Group) return doc.doc;
  return new Group(doc);
};
const group = (...docs) =>
  docs.length === 1 ? groupOne(docs[0]) : groupOne(append(...docs));

const doc1 = group(text("A"), line, group(text("B"), line, text("C")));

const prettySlow = (pageWidth, doc) => {
  const format = (canFit, restWidth, doc) =>
    doc.match({
      Text: (z) => [z, restWidth - z.length],
      Line: () => (canFit ? [" ", restWidth - 1] : ["\n", pageWidth]),
      Append: (d1, d2) => {
        const [s1, r1] = format(canFit, restWidth, d1);
        const [s2, r2] = format(canFit, r1, d2);
        return [s1 + s2, r2];
      },
      Group: (d) => format(canFit || d.width <= restWidth, restWidth, d),
    });
  return format(false, pageWidth, doc)[0];
};

// defunctionalized version
const pretty = (pageWidth, doc) => {
  let restWidth = pageWidth;
  let canFit = false;
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
        Line: () => (canFit ? [" ", restWidth - 1] : ["\n", pageWidth]),
        Append: (d1, d2) => {
          doc = d1;
          kont.push({ type: 0, d2 });
          return null;
        },
        Group: (d) => {
          canFit = canFit || d.width <= restWidth;
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

for (const pageWidth of [6, 4, 2]) {
  console.log(`Page width: ${pageWidth}`);
  console.log(prettySlow(pageWidth, doc1));
}

for (const pageWidth of [6, 4, 2]) {
  console.log(`Page width: ${pageWidth}`);
  console.log(pretty(pageWidth, doc1));
}
