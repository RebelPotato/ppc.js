import {
  blank,
  tab,
  t,
  flow,
  group,
  append,
  nest,
  align,
  prettyRec,
  pretty,
} from "./lib/pieces.js";

const docs = [
  {
    name: "doc1",
    doc: flow(tab(1))(t("This"), t("is"), t("pretty.")),
    widths: [15, 7, 6]
  },
  {
    name: "doc2",
    doc: group(
      t("begin"),
      nest(2)(tab(1), t("work"), tab(1), t("play")),
      tab(1), t("end")),
    widths: [19, 18]
  },
  {
    name: "doc3",
    doc: append(
      t("Please"),
      blank(1),
      align(group(t("align"), tab(1), t("here.")))
    ),
    widths: [18, 17]
  }
]

for(const test of docs) {
  console.group(test.name);
  console.log(test.doc);
  for(const pageWidth of test.widths) {
    console.log(`Page width: ${pageWidth}`);
    console.log("recursive pretty:");
    const docR = prettyRec(pageWidth, pageWidth, test.doc);
    console.log(docR);
    console.log("fast pretty:");
    const doc = pretty(pageWidth, pageWidth, test.doc);
    console.log(doc);
    console.assert(docR === doc);
    console.log({ cmp: docR, got: doc });
  }
  console.groupEnd();
}