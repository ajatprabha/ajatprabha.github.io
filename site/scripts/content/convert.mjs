/** Pure legacy migration. Network and filesystem effects belong to the import adapter. */
export function readLegacy(source, filename) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing front matter: ${filename}`);
  const fields = Object.fromEntries(match[1].split('\n').map((line) => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator), line.slice(separator + 1).trim()];
  }));
  const unquote = (value) => value.replace(/^(['"])([\s\S]*)\1$/, '$2');
  const date = fields.date.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (!date) throw new Error(`Unexpected legacy date: ${filename}`);
  const id = filename.replace(/\.md$/, '');
  const slug = id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return {
    id, title: unquote(fields.title), publishedAt: `${date[1]}-${date[2]}-${date[3]}T${date[4]}+00:00`,
    route: `/${date[1]}/${date[2]}/${date[3]}/${slug}`,
    tags: fields.tags.slice(1, -1).split(',').map((tag) => tag.trim()),
    cover: { src: `/${fields.cover}`, alt: '' }, body: match[2],
  };
}

function transformProse(source, routes, gistSources, images) {
  let text = source.replace(/\{%\s*post_url\s+([^\s]+)\s*%\}/g, (_, id) => {
    if (!routes[id]) throw new Error(`Unknown post link: ${id}`);
    return routes[id];
  }).replace(/\{:target="blank"\}/g, '');
  // Gist wrappers would otherwise cause Markdown fences to render as raw HTML text.
  text = text.replace(/<div[^>]*>\s*(<script[^>]*>[\s\S]*?<\/script>)\s*<\/div>/g, '$1');
  text = text.replace(/<script src="(https:\/\/gist.github.com\/[^\"]+)"[^>]*>[\s\S]*?<\/script>/g, (_, url) => {
    const gist = gistSources[url];
    if (!gist) throw new Error(`Uncaptured Gist: ${url}`);
    const language = { Python: 'python', Go: 'go' }[gist.language] ?? 'text';
    const fence = '`'.repeat(Math.max(3, ...[...gist.content.matchAll(/`+/g)].map((m) => m[0].length + 1)));
    return `\n\n${fence}${language}\n${gist.content}${gist.content.endsWith('\n') ? '' : '\n'}${fence}\n\n[${gist.filename} by ${gist.owner}](${gist.sourceUrl})\n\n`;
  });
  let depth = 0;
  text = text.replace(/<\/?div\b[^>]*>/g, (tag) => {
    if (tag.startsWith('</')) { depth--; return '</div>'; }
    const outer = depth++ === 0;
    return outer ? '<div class="gallery">' : '<div>';
  });
  if (depth !== 0) throw new Error('Unbalanced legacy gallery');
  text = text.replace(/\sstyle="[^"]*"/g, '');
  text = text.replace(/<p>(Original|Resized image|Cropped image)<\/p>/g, '<p><em>$1</em></p>');
  text = text.replace(/<video\b(?![^>]*preload)([^>]*)>/g, '<video$1 preload="metadata">');
  text = text.replace(/!\[([^\]]*)\]\((\/assets\/[^)]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${alt.replace(/\s+/g, ' ').replace(/"/g, '&quot;')}">`);
  text = text.replace(/<img\b([^>]*)>/g, (_, attrs) => {
    const tail = attrs.replace(/\s*\/$/, '');
    const src = tail.match(/src="([^"]+)"/)?.[1];
    const dimensions = images[src];
    if (!dimensions) throw new Error(`Missing image dimensions: ${src}`);
    return `<img${tail}${/\balt=/.test(tail) ? '' : ' alt=""'} width="${dimensions.width}" height="${dimensions.height}" loading="lazy" decoding="async">`;
  });
  return text;
}

/** Preserve fenced code byte-for-byte while normalizing the surrounding prose and media. */
export function convertBody(body, { routes, gistSources, headings, images }) {
  const chunks = body.split(/(^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\2\s*$)/m);
  // Capturing delimiters introduce fence-marker captures; ignore them explicitly.
  let headingIndex = 0;
  const hierarchy = [];
  const output = chunks.filter((chunk) => chunk && !/^(`{3,}|~{3,})$/.test(chunk)).map((chunk) => {
    if (/^\s*(`{3,}|~{3,})/.test(chunk)) return chunk;
    let text = transformProse(chunk, routes, gistSources, images);
    text = text.replace(/^(#{1,6})\s+(.+?)\s*$/gm, (_, marks, title) => {
      const heading = headings[headingIndex++];
      if (!heading) throw new Error(`Missing baseline heading: ${title}`);
      while (hierarchy.length && hierarchy.at(-1).source > marks.length) hierarchy.pop();
      let level;
      if (hierarchy.at(-1)?.source === marks.length) level = hierarchy.at(-1).level;
      else {
        level = hierarchy.length ? Math.min(6, hierarchy.at(-1).level + 1) : 2;
        hierarchy.push({ source: marks.length, level });
      }
      // Only inline emphasis, escaped punctuation, and code occur in legacy headings.
      const html = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\\([.])/g, '$1').replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return `\n<h${level} id="${heading.id}">${html}</h${level}>\n\n`;
    });
    return text;
  }).join('');
  if (headingIndex !== headings.length) throw new Error(`Heading count changed: ${headingIndex}/${headings.length}`);
  return output;
}
