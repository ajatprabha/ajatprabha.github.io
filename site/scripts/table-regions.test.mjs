import test from "node:test";
import assert from "node:assert/strict";
import tableRegions from "./rehype-table-regions.mjs";
test("table transform retains the semantic table while requesting a named keyboard scroll region", () => {
  const table = {
    type: "element",
    tagName: "table",
    properties: {},
    children: [
      {
        type: "element",
        tagName: "thead",
        children: [{ type: "text", value: "Source heading" }],
      },
    ],
  };
  let wrapped;
  tableRegions().element.visit(table, {
    wrapNode(node, parent) {
      wrapped = { node, parent };
    },
  });
  assert.equal(wrapped.parent.properties.role, "region");
  assert.equal(wrapped.parent.properties.tabIndex, 0);
  assert.equal(wrapped.parent.properties.ariaLabel, "Scrollable table 1");
  assert.equal(wrapped.node, table);
});
