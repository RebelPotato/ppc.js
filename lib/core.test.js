import { expect, test } from "vitest";
import {
  blank,
  tab,
  t,
  group,
  append,
  nest,
  align,
  prettyRec,
  pretty,
} from "./lib/core.js";

const flow =
  (separator) =>
  (...docs) =>
    docs.reduce((acc, d) => append(acc, group(append(separator, d))));

test("simple document", () => {
  const doc = flow(tab(1))(t("This"), t("is"), t("pretty."));
  const expected = [
    [15, "This is pretty."],
    [7, "This is\npretty."],
    [6, "This\nis\npretty."],
  ];
  for (const [width, str] of expected) {
    expect(prettyRec(width, width, doc)).toBe(str);
    expect(pretty(width, width, doc)).toBe(str);
  }
});

test("nest", () => {
  const doc = group(
    t("begin"),
    nest(2)(tab(1), t("work"), tab(1), t("play")),
    tab(1),
    t("end")
  );
  const expected = [
    [19, "begin work play end"],
    [18, "begin\n  work\n  play\nend"],
  ]
  for (const [width, str] of expected) {
    expect(prettyRec(width, width, doc)).toBe(str);
    expect(pretty(width, width, doc)).toBe(str);
  }
});

test("align", () => {
  const doc = append(
    t("Please"),
    blank(1),
    align(group(t("align"), tab(1), t("here."))
    )
  );
  const expected = [
    [18, "Please align here."],
    [17, "Please align\n       here."],
  ];
  for (const [width, str] of expected) {
    expect(prettyRec(width, width, doc)).toBe(str);
    expect(pretty(width, width, doc)).toBe(str);
  }
});