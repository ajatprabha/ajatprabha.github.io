/** Native Satteri transform: retain table semantics inside a named scroll region. */
export default function tableRegions() {
  let count = 0;
  return {
    name: "table-scroll-regions",
    element: {
      filter: ["table"],
      visit(node, ctx) {
        count++;
        ctx.wrapNode(node, {
          type: "element",
          tagName: "div",
          properties: {
            className: ["table-scroll"],
            role: "region",
            tabIndex: 0,
            ariaLabel: `Scrollable table ${count}`,
          },
          children: [],
        });
      },
    },
  };
}
