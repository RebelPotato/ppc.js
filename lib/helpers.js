import { empty, t, append2, append, tab, align, group, nest } from "./core.js";

export const repeat =
  (n) =>
  (...docs) => {
    if (n === 0) return empty;
    const doc = append(...docs);
    let result = doc;
    for (let i = 1; i < n; i++) result = append2(result, doc);
    return result;
  };

export const separate =
  (separator) =>
  (...docs) => {
    if (docs.length === 0) return empty;
    let result = docs[0];
    for (let i = 1; i < docs.length; i++)
      result = append2(result, append2(separator, docs[i]));
    return result;
  };
export const lines = (str) => str.split("\n").map(t);
export const tabbedString = (str) => separate(tab(1))(...lines(str));
export const words = (str) => str.split(/\s+/).map(t);
export const flow =
  (separator) =>
  (...docs) =>
    docs.reduce((acc, d) => append2(acc, group(append2(separator, d))));

export const hang =
  (indent) =>
  (...docs) =>
    align(nest(indent)(...docs));
export const prefix =
  (indent, space, left) =>
  (...rights) =>
    group(left, nest(indent)(tab(space), ...rights));
export const jump =
  (indent, space) =>
  (...rights) =>
    group(nest(indent)(tab(space), ...rights));
export const infix = (indent, space, op, left, right) =>
  prefix(indent, space, append(left, tab(space), op))(right);
export const surround =
  (indent, space, opening, closing) =>
  (...contents) =>
    group(opening, nest(indent)(tab(space), ...contents), tab(space), closing);
export const softSurround =
  (indent, space, opening, closing) =>
  (...contents) =>
    group(opening, nest(indent)(group(tab(space)), ...contents), group(tab(space), closing));
