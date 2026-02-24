// Runtime DOM translation observer
// Uses MutationObserver to watch for DOM changes and replace English text with Chinese.

const SKIP_TAGS = new Set([
  "CODE",
  "PRE",
  "TEXTAREA",
  "INPUT",
  "SCRIPT",
  "STYLE",
]);

const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label"];

function shouldSkip(node: Node): boolean {
  let cur: Node | null = node;
  while (cur && cur !== document.body) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const el = cur as Element;
      if (SKIP_TAGS.has(el.tagName) || el.hasAttribute("contenteditable")) {
        return true;
      }
    }
    cur = cur.parentNode;
  }
  return false;
}

function translateTextNode(
  node: Text,
  translations: Record<string, string>,
  sortedKeys: string[],
): void {
  const raw = node.nodeValue;
  if (!raw) return;

  const trimmed = raw.trim();
  if (!trimmed) return;

  // Exact match (preserve surrounding whitespace)
  if (trimmed in translations) {
    const leading = raw.slice(0, raw.indexOf(trimmed));
    const trailing = raw.slice(raw.indexOf(trimmed) + trimmed.length);
    node.nodeValue = leading + translations[trimmed] + trailing;
    return;
  }

  // Partial / substring replacement (longest keys first)
  let text = raw;
  for (const key of sortedKeys) {
    if (text.includes(key)) {
      text = text.split(key).join(translations[key]);
    }
  }
  if (text !== raw) {
    node.nodeValue = text;
  }
}

function translateAttributes(
  el: Element,
  translations: Record<string, string>,
  sortedKeys: string[],
): void {
  for (const attr of TRANSLATABLE_ATTRS) {
    const val = el.getAttribute(attr);
    if (!val) continue;

    const trimmed = val.trim();

    // Exact match
    if (trimmed in translations) {
      el.setAttribute(attr, translations[trimmed]);
      continue;
    }

    // Partial replacement
    let text = val;
    for (const key of sortedKeys) {
      if (text.includes(key)) {
        text = text.split(key).join(translations[key]);
      }
    }
    if (text !== val) {
      el.setAttribute(attr, text);
    }
  }
}

function walkTree(
  root: Node,
  translations: Record<string, string>,
  sortedKeys: string[],
): void {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );

  // Collect nodes first to avoid live-tree issues
  const textNodes: Text[] = [];
  const elements: Element[] = [];

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE && !shouldSkip(current)) {
      textNodes.push(current as Text);
    } else if (
      current.nodeType === Node.ELEMENT_NODE &&
      !shouldSkip(current)
    ) {
      elements.push(current as Element);
    }
    current = walker.nextNode();
  }

  for (const tn of textNodes) {
    translateTextNode(tn, translations, sortedKeys);
  }
  for (const el of elements) {
    translateAttributes(el, translations, sortedKeys);
  }
}

export function initI18n(translations: Record<string, string>): void {
  // Pre-sort keys by length descending so longer keys are replaced first
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length,
  );

  let isMutating = false;
  let pendingFrame: number | null = null;
  const pendingNodes: Set<Node> = new Set();

  function processPending(): void {
    pendingFrame = null;
    if (pendingNodes.size === 0) return;

    isMutating = true;
    for (const node of pendingNodes) {
      if (node.isConnected) {
        walkTree(node, translations, sortedKeys);
      }
    }
    pendingNodes.clear();
    isMutating = false;
  }

  function scheduleTranslation(node: Node): void {
    pendingNodes.add(node);
    if (pendingFrame === null) {
      pendingFrame = requestAnimationFrame(processPending);
    }
  }

  // Initial full translation
  isMutating = true;
  walkTree(document.body, translations, sortedKeys);
  isMutating = false;

  // Observe future changes
  const observer = new MutationObserver((mutations) => {
    if (isMutating) return;

    for (const m of mutations) {
      if (m.type === "childList") {
        for (const added of m.addedNodes) {
          scheduleTranslation(added);
        }
      } else if (m.type === "characterData" && m.target.parentNode) {
        scheduleTranslation(m.target);
      } else if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
        scheduleTranslation(m.target);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRS,
  });
}
