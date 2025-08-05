import { vi } from "vitest";
import { createCookieSessionStorage, json } from "@remix-run/node";
import {
  getCartFromSession,
  getTableIdFromSession,
  isAdmin,
  tableIdLoader,
  updateTableIdFromQuery,
} from "./session.server";

// createCookieSessyionStorage をモック
vi.mock("@remix-run/node", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@remix-run/node")>();
  let sessionData: Record<string, any> = {}; // 各テストでリセットされるようにletで宣言

  return {
    ...actual,
    createCookieSessionStorage: vi.fn(() => ({
      getSession: vi.fn(async (cookieHeader) => {
        // 各テストの開始時にsessionDataをリセット
        sessionData = {};
        if (cookieHeader) {
          Object.assign(sessionData, JSON.parse(cookieHeader));
        }
        return {
          get: vi.fn((key) => sessionData[key]),
          set: vi.fn((key, value) => (sessionData[key] = value)),
          unset: vi.fn((key) => delete sessionData[key]),
          has: vi.fn((key) =>
            Object.prototype.hasOwnProperty.call(sessionData, key)
          ),
          flash: vi.fn(),
          data: sessionData, // 内部データにアクセスできるようにする
        };
      }),
      commitSession: vi.fn(async (session) => JSON.stringify(session.data)),
      destroySession: vi.fn(async () => ""),
    })),
    json: vi.fn((data, init) => new Response(JSON.stringify(data), init)),
  };
});

describe("Session Utilities", () => {
  let mockSession: any;
  let mockRequest: any;

  beforeEach(async () => {
    // モックされた getSession を使用して新しいセッションを作成
    const { getSession } = createCookieSessionStorage({
      cookie: { name: "__session" },
    });
    mockSession = await getSession();
    mockRequest = new Request("http://localhost", { method: "GET" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getCartFromSession", () => {
    test("should return an empty array if cart is not in session", () => {
      expect(getCartFromSession(mockSession)).toEqual([]);
    });

    test("should return cart items if present in session", () => {
      const cart = [{ id: "1", name: "Item 1", quantity: 1, price: 100 }];
      mockSession.set("cart", cart);
      expect(getCartFromSession(mockSession)).toEqual(cart);
    });
  });

  describe("getTableIdFromSession", () => {
    test("should return an empty string if tableId is not in session", () => {
      expect(getTableIdFromSession(mockSession)).toEqual("");
    });

    test("should return tableId if present in session", () => {
      mockSession.set("tableId", "test-table-id");
      expect(getTableIdFromSession(mockSession)).toEqual("test-table-id");
    });
  });

  describe("isAdmin", () => {
    test("should return false if isAdmin is not in session", () => {
      expect(isAdmin(mockSession)).toBe(false);
    });

    test("should return true if isAdmin is true in session", () => {
      mockSession.set("isAdmin", true);
      expect(isAdmin(mockSession)).toBe(true);
    });

    test("should return false if isAdmin is false in session", () => {
      mockSession.set("isAdmin", false);
      expect(isAdmin(mockSession)).toBe(false);
    });
  });

  describe("tableIdLoader", () => {
    test("should return tableId from session if present", async () => {
      const sessionCookie = JSON.stringify({ tableId: "session-table-id" });
      const requestWithCookie = new Request("http://localhost", {
        headers: { Cookie: sessionCookie },
      });
      vi.mocked(
        createCookieSessionStorage({ cookie: { name: "__session" } }).getSession
      ).mockResolvedValue(mockSession);

      const response = (await tableIdLoader({
        request: requestWithCookie,
        params: {},
        context: {},
      })) as Response;
      const data = await response.json();
      expect(data).toEqual({ tableId: "session-table-id" });
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });

    test("should update tableId from query param and return it", async () => {
      const requestWithQuery = new Request(
        "http://localhost?tableId=query-table-id",
        { method: "GET" }
      );
      vi.mocked(
        createCookieSessionStorage({ cookie: { name: "__session" } }).getSession
      ).mockResolvedValue(mockSession);

      const response = (await tableIdLoader({
        request: requestWithQuery,
        params: {},
        context: {},
      })) as Response;
      const data = await response.json();
      expect(data).toEqual({ tableId: "query-table-id" });
      expect(mockSession.get("tableId")).toEqual("query-table-id");
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });

    test("should return empty tableId if neither session nor query has it", async () => {
      vi.mocked(
        createCookieSessionStorage({ cookie: { name: "__session" } }).getSession
      ).mockResolvedValue(mockSession);

      const response = (await tableIdLoader({
        request: mockRequest,
        params: {},
        context: {},
      })) as Response;
      const data = await (response as Response).json();
      expect(data).toEqual({ tableId: "" });
      expect(response.headers.get("Set-Cookie")).toBeDefined();
    });
  });

  describe("updateTableIdFromQuery", () => {
    test("should return tableId from session if no query param", () => {
      mockSession.set("tableId", "session-table-id");
      const result = updateTableIdFromQuery(mockRequest, mockSession);
      expect(result).toEqual("session-table-id");
    });

    test("should update tableId from query param and return it", () => {
      const requestWithQuery = new Request(
        "http://localhost?tableId=query-table-id",
        { method: "GET" }
      );
      const result = updateTableIdFromQuery(requestWithQuery, mockSession);
      expect(result).toEqual("query-table-id");
      expect(mockSession.get("tableId")).toEqual("query-table-id");
    });

    test("should return empty tableId if neither session nor query has it", () => {
      const result = updateTableIdFromQuery(mockRequest, mockSession);
      expect(result).toEqual("");
    });
  });
});
