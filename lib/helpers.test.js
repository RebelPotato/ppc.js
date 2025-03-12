import { expect, test } from "vitest";
import { t, prettyRec, pretty } from "./core.js";
import { infix, surround } from "./helpers.js";

test("surrond", () => {
  const doc = surround(
    2,
    1,
    t("{"),
    t("}")
  )(infix(0, 1, t("+"), t("1"), t("2")));
  const expected = [
    [9, "{ 1 + 2 }"],
    [8, "{\n  1 + 2\n}"],
  ];
  for (const [width, str] of expected) {
    expect(prettyRec(width, width, doc)).toBe(str);
    expect(pretty(width, width, doc)).toBe(str);
  }
});
