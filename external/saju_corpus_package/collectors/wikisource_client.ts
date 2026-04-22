/**
 * wikisource_client.ts
 *
 * 목적:
 * - zh.wikisource.org MediaWiki Action API를 통해
 *   페이지 HTML, 섹션, 링크, wikitext를 수집한다.
 *
 * 주의:
 * - 실제 대량 배치 수집 전에는 source_configs.json 기준으로 page title을 확정할 것
 * - 원전과 주석본을 동일 work_version으로 합치지 말 것
 */

export type WikiSection = {
  toclevel?: number;
  level?: string;
  line?: string;
  number?: string;
  index?: string;
  fromtitle?: string;
  byteoffset?: number;
  anchor?: string;
};

export type WikiLink = {
  ns: number;
  title: string;
  exists?: string;
};

export type WikiParseResponse = {
  parse?: {
    title: string;
    pageid?: number;
    revid?: number;
    displaytitle?: string;
    text?: { "*": string };
    sections?: WikiSection[];
    links?: WikiLink[];
  };
};

export type WikiRevisionResponse = {
  query?: {
    pages?: Array<{
      pageid?: number;
      ns?: number;
      title: string;
      missing?: boolean;
      revisions?: Array<{
        slots?: {
          main?: {
            contentmodel?: string;
            contentformat?: string;
            content?: string;
          };
        };
      }>;
    }>;
  };
};

const WIKISOURCE_API = "https://zh.wikisource.org/w/api.php";

function buildUrl(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    sp.set(key, String(value));
  }
  return `${WIKISOURCE_API}?${sp.toString()}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "user-agent": "dalbit-sunsaeng-corpus-bot/1.0 (+https://saju-app-lac.vercel.app)"
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wikisource API error ${res.status}: ${body.slice(0, 500)}`);
  }

  return (await res.json()) as T;
}

export async function getParsedPage(pageTitle: string): Promise<WikiParseResponse> {
  const url = buildUrl({
    origin: "*",
    action: "parse",
    page: pageTitle,
    redirects: 1,
    prop: "text|sections|links|revid|displaytitle",
    format: "json",
    formatversion: 2
  });

  return fetchJson<WikiParseResponse>(url);
}

export async function getPageWikitext(pageTitle: string): Promise<WikiRevisionResponse> {
  const url = buildUrl({
    origin: "*",
    action: "query",
    prop: "revisions",
    titles: pageTitle,
    rvprop: "content",
    rvslots: "main",
    format: "json",
    formatversion: 2
  });

  return fetchJson<WikiRevisionResponse>(url);
}

export function extractSubpageCandidates(parsedHtml: string, rootTitle: string): string[] {
  /**
   * 휴리스틱:
   * - rootTitle/로 시작하는 내부 링크를 subpage 후보로 간주
   * - HTML parsing 라이브러리를 쓰지 않고 regex로만 처리
   */
  const hrefRegex = /href="\/wiki\/([^"#?]+)"/g;
  const decodedRoot = rootTitle.replace(/ /g, "_");
  const found = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(parsedHtml)) !== null) {
    const raw = decodeURIComponent(match[1]);
    const title = raw.replace(/_/g, " ");
    if (title.startsWith(`${rootTitle}/`) || title.startsWith(`${decodedRoot}/`)) {
      found.add(title);
    }
  }

  return Array.from(found).sort();
}

export type CollectedWikiPage = {
  pageTitle: string;
  displayTitle?: string;
  revid?: number;
  sections: WikiSection[];
  links: WikiLink[];
  html: string;
  wikitext: string | null;
};

export async function collectSinglePage(pageTitle: string): Promise<CollectedWikiPage> {
  const parsed = await getParsedPage(pageTitle);
  const revision = await getPageWikitext(pageTitle);

  const parseNode = parsed.parse;
  const pageNode = revision.query?.pages?.[0];
  const wikitext = pageNode?.revisions?.[0]?.slots?.main?.content ?? null;

  return {
    pageTitle,
    displayTitle: parseNode?.displaytitle,
    revid: parseNode?.revid,
    sections: parseNode?.sections ?? [],
    links: parseNode?.links ?? [],
    html: parseNode?.text?.["*"] ?? "",
    wikitext
  };
}

export type WorkCollectionResult = {
  root: CollectedWikiPage;
  childCandidates: string[];
};

export async function discoverWork(rootTitle: string): Promise<WorkCollectionResult> {
  const root = await collectSinglePage(rootTitle);
  const childCandidates = extractSubpageCandidates(root.html, rootTitle);
  return { root, childCandidates };
}

// 사용 예시
// const result = await discoverWork("三命通會 (四庫全書本)");
// console.log(result.childCandidates);