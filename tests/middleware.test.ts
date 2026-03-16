import { describe, expect, it } from "vitest";
import { middleware } from "../apps/web/middleware";

describe("middleware", () => {
  it("adds baseline security headers to all responses", () => {
    const request = {
      nextUrl: {
        pathname: "/meetings"
      }
    } as Parameters<typeof middleware>[0];

    const response = middleware(request);

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(response.headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
  });

  it("adds no-store for api routes", () => {
    const request = {
      nextUrl: {
        pathname: "/api/meetings"
      }
    } as Parameters<typeof middleware>[0];

    const response = middleware(request);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
