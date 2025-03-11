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
} from "./ppc.js";

const doc1 = flow(tab(1))(t("This"), t("is"), t("pretty."));
console.group("doc1");
console.log(doc1);
for (const pageWidth of [15, 7, 6]) {
  console.log(`Page width: ${pageWidth}`);
  const doc = prettyRec(pageWidth, pageWidth, doc1);
  console.log(doc);
  console.log({ raw: doc });
}
console.groupEnd();

const doc2 = group(
  t("begin"),
  nest(2)(tab(1), t("work"), tab(1), t("play")),
  tab(1),
  t("end")
);
console.group("doc2");
console.log(doc2);
for (const pageWidth of [21, 20]) {
  console.log(`Page width: ${pageWidth}`);
  const doc = prettyRec(pageWidth, pageWidth, doc2);
  console.log(doc);
  console.log({ raw: doc });
}
console.groupEnd();

const doc3 = append(
  t("Please"),
  blank(1),
  align(group(t("align"), tab(1), t("here.")))
);
console.group("doc3");
console.log(doc3);
for (const pageWidth of [18, 17]) {
  console.log(`Page width: ${pageWidth}`);
  const doc = prettyRec(pageWidth, pageWidth, doc3);
  console.log(doc);
  console.log({ raw: doc });
}
console.groupEnd();

// for (const pageWidth of [15, 10, 7]) {
//   console.log(`Page width: ${pageWidth}`);
//   console.log(pretty(pageWidth, doc1));
// }
