/**
 * ctext_client.ts
 *
 * 목적:
 * - CTP API의 제한을 지키면서 단건 조회를 수행한다.
 *
 * 중요한 운영 원칙:
 * 1) bulk crawl 금지
 * 2) 등록 IP 또는 유효 API key가 없는 대형 work 탐색 금지
 * 3) ctext는 공개 서비스이지만 자동 다운로드 소프트웨어 사용 금지 규정이 있으므로
 *    release pipeline에서는 메타데이터/비교본 용도로만 사용한다.
 */

export type CtextTextResponse = {
  title?: string;
  fulltext?: string[];
  subsections?: string[];
  error?: {
    code: string;
    description: string;
  };
};

export type CtextStatusResponse = {
  status?: string;
  error?: {
    code: string;
    description: string;
  };
};

const CTEXT_API_BASE = "https://api.ctext.org";

function buildUrl(
  fn: string,
  params: Record<string, string | number | boolean | undefined> = {}
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    sp.set(key, String(value));
  }
  return `${CTEXT_API_BASE}/${fn}?${sp.toString()}`;
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
    throw new Error(`CTP API error ${res.status}: ${body.slice(0, 500)}`);
  }

  return (await res.json()) as T;
}

export async function getStatus(): Promise<CtextStatusResponse> {
  const url = buildUrl("getstatus");
  return fetchJson<CtextStatusResponse>(url);
}

export async function readLink(ctextUrl: string, apiKey?: string): Promise<unknown> {
  const url = buildUrl("readlink", {
    url: ctextUrl,
    apikey: apiKey
  });
  return fetchJson<unknown>(url);
}

export async function getTextByUrn(
  urn: string,
  apiKey?: string
): Promise<CtextTextResponse> {
  const url = buildUrl("gettext", {
    urn,
    apikey: apiKey
  });

  const data = await fetchJson<CtextTextResponse>(url);

  if (data.error?.code === "ERR_REQUIRES_AUTHENTICATION") {
    throw new Error(
      `CTP auth required for URN ${urn}. 등록 IP 또는 유효 API key를 사용해야 합니다.`
    );
  }

  if (data.error?.code === "ERR_REQUEST_LIMIT") {
    throw new Error(
      `CTP request limit reached for URN ${urn}. 호출 빈도를 낮추거나 인증 상태를 확인해야 합니다.`
    );
  }

  return data;
}

export type SafeCtextFetchOptions = {
  urn: string;
  apiKey?: string;
  allowBookLevel?: boolean;
};

export async function getSafeSingleNodeText(
  options: SafeCtextFetchOptions
): Promise<CtextTextResponse> {
  /**
   * 기본 방침:
   * - chapter 수준 fulltext 응답을 선호
   * - book 수준에서 subsections 탐색이 필요하면 인증 상태를 먼저 확인
   */
  const { urn, apiKey, allowBookLevel = false } = options;
  const data = await getTextByUrn(urn, apiKey);

  if (data.subsections && !allowBookLevel) {
    throw new Error(
      `URN ${urn} returned subsections. batch expansion은 수동 승인 후 별도 작업으로 분리하세요.`
    );
  }

  return data;
}

// 사용 예시
// const status = await getStatus();
// const text = await getSafeSingleNodeText({ urn: "ctp:wb346166", apiKey: process.env.CTEXT_API_KEY });