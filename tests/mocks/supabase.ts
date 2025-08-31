// Minimal Supabase mocks and a tiny AI test helper used in unit/integration tests.
// This file provides a lightweight, sync-friendly mock of the Supabase client
// with the chainable methods commonly used in the codebase/tests.
//
// Note: Tests sometimes override `mockSupabaseClient.from.mockImplementation(...)`
// with more specific behavior. The defaults here are simple and safe.

type SupabaseResponse<T = any> = Promise<{ data: T | null; error: any | null }>;

// Sample mock data used across tests
export const mockProducts = [
  {
    id: "1",
    name: "Test Product A",
    price_retail: 9.99,
    stock: 10,
    category_id: "1",
    units: [],
  },
  {
    id: "2",
    name: "Test Product B",
    price_retail: 19.99,
    stock: 5,
    category_id: "2",
    units: [],
  },
];

export const mockCategories = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Clothing" },
];

// Helper to create simple chainable query builders for a given dataset
function createQueryBuilder(dataset: any[]) {
  const builder: any = {};

  // Basic select that resolves to the dataset
  builder.select = (..._args: any[]) => {
    // Return a then-able that will resolve like supabase JS might
    return {
      then: (cb: (v: any) => any) =>
        Promise.resolve(cb({ data: dataset, error: null })),
      // also support awaiting the object directly in some tests
      // some tests call .select().then(...) while others expect a Promise-like return
      catch: () => Promise.resolve({ data: dataset, error: null }),
    };
  };

  // Allow order().then(...) patterns
  builder.order = (..._args: any[]) => ({
    then: (cb: (v: any) => any) =>
      Promise.resolve(cb({ data: dataset, error: null })),
  });

  // insert(...).select().single() common pattern
  builder.insert = (payload: any) => ({
    select: () => ({
      single: async () => ({
        data: {
          ...(Array.isArray(payload) ? payload[0] : payload),
          id: "new-id",
        },
        error: null,
      }),
    }),
  });

  // update(...).eq(...).select().single()
  builder.update = (_payload: any) => ({
    eq: (_col: string, _val: any) => ({
      select: () => ({
        single: async () => ({ data: dataset[0] ?? null, error: null }),
      }),
    }),
  });

  // delete().eq(...)
  builder.delete = () => ({
    eq: async (_col: string, _val: any) => ({ error: null }),
  });

  // single() directly on the builder
  builder.single = async () => ({ data: dataset[0] ?? null, error: null });

  // eq/order helpers returning the builder for chainability
  builder.eq = () => builder;
  builder.limit = () => builder;

  return builder;
}

// Create a jest-mockable Supabase client. Using jest.fn so tests can assert calls.
export const mockSupabaseClient: any = {
  // `from` should be a mock function so tests can assert it was called with the expected table.
  from: jest.fn((table: string) => {
    if (table === "products") return createQueryBuilder(mockProducts);
    if (table === "categories") return createQueryBuilder(mockCategories);
    // default empty dataset for unknown tables
    return createQueryBuilder([]);
  }),

  // Minimal realtime/channel stubs used in some components/tests
  // Provide a chainable `on(...).on(...).subscribe()` shape and a client-level `removeChannel`
  channel: jest.fn(() => {
    const ch: any = {
      // `on` returns the channel itself so calls can be chained: .on(...).on(...).subscribe()
      on: jest.fn(function (this: any, ..._args: any[]) {
        return ch;
      }),
      subscribe: jest.fn(async () => ({ subscription: true })),
      // keep a no-op unsubscribe hook on the channel instance itself if tests expect it
      unsubscribe: jest.fn(() => {}),
    };
    return ch;
  }),
  // supabase.removeChannel(channel) should be callable by hooks
  removeChannel: jest.fn(() => {}),

  // rpc fallback
  rpc: jest.fn(async () => ({ data: null, error: null })),

  // other helpers a test might call
  fromRaw: jest.fn(() => createQueryBuilder([])),
};

// Provide a factory for code paths that call createClient()
export function createClient() {
  return mockSupabaseClient;
}

// Minimal AI test helper used by some test suites to simulate error analysis / reporting.
// This isn't a fully featured analyzer — just enough for tests that call it.
export const aiTestHelper = (() => {
  const errorHistory: Array<{ error: any; label?: string; time: number }> = [];

  const analyzer = {
    getErrorHistory: () => errorHistory,
    analyzeError: (err: any, context?: string) => {
      const record = {
        error: err,
        label: context ?? "unknown",
        time: Date.now(),
      };
      errorHistory.push(record);
      const message = String(err?.message ?? err ?? "");
      const suggestions: Array<{ type: string; description: string }> = [];
      const autoFix: string[] = [];

      // Detect common patterns
      if (/Cannot read property|Cannot read|of undefined|null/i.test(message)) {
        suggestions.push({
          type: "NULL_ACCESS",
          description:
            "Add null/undefined checks or optional chaining to avoid runtime null access.",
        });
        autoFix.push("Add null checks or optional chaining");
      }

      if (/Module not found|Can'?t resolve|Cannot find module/i.test(message)) {
        suggestions.push({
          type: "IMPORT_ERROR",
          description: "Fix import path or install missing dependency.",
        });
        autoFix.push("Fix import path");
      }

      if (/is not a function/i.test(message)) {
        suggestions.push({
          type: "FUNCTION_ERROR",
          description:
            "Check function import/export and ensure the value is a callable function.",
        });
        autoFix.push("Check function import/export");
      }

      if (
        /timeout|timed out|Async callback was not invoked within/i.test(message)
      ) {
        suggestions.push({
          type: "TIMEOUT_ERROR",
          description:
            "Increase timeout or ensure async callbacks are invoked.",
        });
        autoFix.push("Increase timeout");
      }

      // Fallback generic suggestion if nothing matched
      if (suggestions.length === 0) {
        suggestions.push({
          type: "GENERIC",
          description:
            "Inspect the error message and stack trace to determine the root cause.",
        });
        autoFix.push("No automatic fix available");
      }

      return {
        context,
        suggestions,
        autoFix,
      };
    },

    // Return most common error patterns and counts
    getCommonErrorPatterns: () => {
      const map: Record<string, number> = {};
      for (const rec of errorHistory) {
        const message = String(rec.error?.message ?? rec.error ?? "");
        let type = "GENERIC";
        if (/Cannot read property|Cannot read|of undefined|null/i.test(message))
          type = "NULL_ACCESS";
        else if (
          /Module not found|Can'?t resolve|Cannot find module/i.test(message)
        )
          type = "IMPORT_ERROR";
        else if (/is not a function/i.test(message)) type = "FUNCTION_ERROR";
        else if (
          /timeout|timed out|Async callback was not invoked within/i.test(
            message,
          )
        )
          type = "TIMEOUT_ERROR";

        map[type] = (map[type] || 0) + 1;
      }
      return Object.keys(map).map((key) => ({ pattern: key, count: map[key] }));
    },

    generateReport: () => {
      const total = errorHistory.length;
      const patternSummary = analyzer
        .getCommonErrorPatterns()
        .map((p) => `${p.pattern}: ${p.count}`)
        .join(", ");
      const lines = errorHistory
        .map(
          (e, i) =>
            `${i + 1}. ${String(e.error?.message ?? e.error ?? "unknown")} (${e.label})`,
        )
        .join("\n");
      return `AI Error Analysis Report\nTotal Errors: ${total}\nPatterns: ${patternSummary}\n${lines}`;
    },

    clear: () => {
      errorHistory.length = 0;
    },
  };

  return {
    getAnalyzer: () => analyzer,
    // Convenience wrapper for tests to run their logic under the helper
    wrapTest: async (
      fn: () => any | Promise<any>,
      _name?: string,
      _opts?: any,
    ) => {
      try {
        const result = fn();
        if (result && typeof (result as any).then === "function") {
          return await result;
        }
        return result;
      } catch (err) {
        analyzer.analyzeError(err, _name);
        throw err;
      }
    },
  };
})();
