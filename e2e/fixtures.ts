import type { Page, Route } from "@playwright/test";

const TEST_USER_ID = "00000000-0000-4000-8000-000000000001";
const TEST_ACCESS_TOKEN = "e2e-test-access-token";

const mockSession = {
  access_token: TEST_ACCESS_TOKEN,
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "e2e-test-refresh-token",
  user: {
    id: TEST_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "",
    phone: "",
    is_anonymous: true,
    app_metadata: { provider: "anonymous" },
    user_metadata: {},
    created_at: new Date().toISOString(),
  },
};

const mockAnnotations = [
  {
    id: "ann-1",
    pieceId: "openopus-9688",
    timestampSeconds: 12,
    label: "Opening flourish",
    note: "The ensemble announces the first idea with bright, interlocking lines.",
    category: "theme",
  },
  {
    id: "ann-2",
    pieceId: "openopus-9688",
    timestampSeconds: 90,
    label: "Conversational exchange",
    note: "Voices answer one another in quick, playful imitation.",
    category: "structure",
  },
  {
    id: "ann-3",
    pieceId: "openopus-9688",
    timestampSeconds: 180,
    label: "Closing cadence",
    note: "The movement gathers toward a clear, decisive finish.",
    category: "harmony",
  },
];

const recommendedPiece = {
  id: "openopus-15562",
  title: "Rhapsody in Blue",
  composer: "Gershwin",
  era: "20th Century",
  youtubeVideoId: "cH2VtBRhbk8",
  startOffsetSeconds: 0,
  durationSeconds: 1023,
  openOpusWorkId: "15562",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, prefer, accept-profile, content-profile, range",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    headers: corsHeaders,
    body: JSON.stringify(body),
  });
}

/** Keep Supabase calls offline so e2e does not need a live project. */
export async function mockSupabase(page: Page) {
  await page.route("**/auth/v1/**", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/auth/v1/signup") || url.includes("/auth/v1/token")) {
      await json(route, mockSession);
      return;
    }

    if (url.includes("/auth/v1/user") && method === "GET") {
      await json(route, mockSession.user);
      return;
    }

    await json(route, {});
  });

  await page.route("**/rest/v1/**", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const method = route.request().method();

    if (method === "GET" || method === "HEAD") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          ...corsHeaders,
          "content-range": "0-0/0",
          "content-type": "application/json; charset=utf-8",
        },
        body: "[]",
      });
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      headers: corsHeaders,
      body: "[]",
    });
  });
}

/** Stub YouTube IFrame API so the listen player becomes ready without network. */
export async function mockYouTubeApi(page: Page) {
  await page.route("**/www.youtube.com/iframe_api*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();",
    });
  });

  await page.addInitScript(() => {
    type PlayerOpts = {
      events?: {
        onReady?: (event: { target: unknown }) => void;
        onStateChange?: (event: { data: number }) => void;
      };
    };

    const Player = function Player(
      this: {
        playVideo: () => void;
        pauseVideo: () => void;
        seekTo: () => void;
        destroy: () => void;
        getCurrentTime: () => number;
        getDuration: () => number;
        getPlayerState: () => number;
      },
      _el: unknown,
      opts: PlayerOpts,
    ) {
      let playing = false;

      this.playVideo = () => {
        playing = true;
        opts.events?.onStateChange?.({ data: 1 });
      };
      this.pauseVideo = () => {
        playing = false;
        opts.events?.onStateChange?.({ data: 2 });
      };
      this.seekTo = () => undefined;
      this.destroy = () => undefined;
      this.getCurrentTime = () => 15;
      this.getDuration = () => 720;
      this.getPlayerState = () => (playing ? 1 : 2);

      queueMicrotask(() => {
        opts.events?.onReady?.({ target: this });
      });
    };

    const api = {
      PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
      Player,
    };

    Object.defineProperty(window, "YT", {
      configurable: true,
      writable: true,
      value: api,
    });
  });
}

export async function mockAiRoutes(page: Page) {
  await page.route("**/api/generate-annotations", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await json(route, {
      annotations: mockAnnotations,
      provider: "e2e-mock",
    });
  });

  await page.route("**/api/recommend-next", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    const body = [
      JSON.stringify({
        type: "piece",
        piece: recommendedPiece,
        provider: "e2e-mock",
      }),
      JSON.stringify({
        type: "delta",
        text: "Because you noticed the conversational exchange, ",
      }),
      JSON.stringify({
        type: "delta",
        text: "try Gershwin next for a related sense of dialogue and color.",
      }),
      JSON.stringify({ type: "done", provider: "e2e-mock" }),
      "",
    ].join("\n");

    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body,
    });
  });
}

export async function prepareApp(page: Page) {
  await mockSupabase(page);
  await mockYouTubeApi(page);
  await mockAiRoutes(page);
}

export { recommendedPiece, mockAnnotations };
