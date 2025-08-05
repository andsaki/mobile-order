import { vi } from "vitest";
import { fetchJson } from "./fetchJson";

describe("fetchJson", () => {
  const mockResponse = { message: "Success" };
  const mockError = { message: "Error" };

  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
      ok: true,
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should fetch data successfully", async () => {
    const data = await fetchJson("/api/test");
    expect(data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-MICROCMS-API-KEY": expect.any(String),
        }),
      })
    );
  });

  test("should fetch data with options", async () => {
    const options = { method: "POST", body: JSON.stringify({ key: "value" }) };
    const data = await fetchJson("/api/test", options);
    expect(data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: options.method,
        body: options.body,
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-MICROCMS-API-KEY": expect.any(String),
        }),
      })
    );
  });

  test("should throw an error if response is not ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve(mockError),
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    await expect(fetchJson("/api/error")).rejects.toThrow(
      "Fetch failed with status 400"
    );
  });
});