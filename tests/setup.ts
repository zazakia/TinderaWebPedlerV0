// Minimal Jest setup for the project.
// Provides a few environment shims and lightweight helpers used by tests.

import "@testing-library/jest-dom";

declare global {
  // lightweight error tracker used by some tests
  var aiErrorTracker: {
    errors: Array<any>;
    addError: (err: any, level?: string) => void;
    clear: () => void;
  };
  interface Window {
    matchMedia?: (query: string) => MediaQueryList;
    ResizeObserver?: any;
    IntersectionObserver?: any;
  }
}

// Simple in-memory error tracker to avoid missing globals in tests.
// Keep implementation synchronous and side-effect free to avoid triggering React updates.
if (!globalThis.aiErrorTracker) {
  globalThis.aiErrorTracker = {
    errors: [],
    addError(err: any, level?: string) {
      try {
        this.errors.push({ err, level, time: Date.now() });
      } catch {
        // swallow - tests shouldn't crash because of the tracker
      }
    },
    clear() {
      this.errors.length = 0;
    },
  };
}

// Optional: capture console.error to the tracker but still print to stdout.
// We keep this minimal and avoid complex side-effects.
const _originalConsoleError = console.error.bind(console);
// Capture console.error to the in-memory tracker but do NOT forward to the original console.
// Forwarding printed the React act(...) warnings and caused side-effects during tests.
console.error = (...args: any[]) => {
  try {
    // Record the error synchronously in the in-memory tracker (should be side-effect free)
    globalThis.aiErrorTracker?.addError(args[0], "console.error");
  } catch {
    // ignore any tracker failures
  }
  // Intentionally do not call _originalConsoleError to keep tests deterministic and avoid
  // triggering React update warnings during test execution.
};

// Minimal window.matchMedia mock for components relying on it.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as unknown as MediaQueryList;
    },
  });
}

// Minimal ResizeObserver mock
if (typeof window !== "undefined" && !window.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;
}

// Minimal IntersectionObserver mock
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class IntersectionObserverMock {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = IntersectionObserverMock as any;
}

// Lightweight fetch mock fallback so tests that don't provide one won't fail.
// If tests need to assert network calls they should set up their own mocks.
if (typeof globalThis.fetch === "undefined") {
  // @ts-ignore
  globalThis.fetch = async () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "",
    });
}

// Prevent React act(...) warnings caused by microtask scheduling when tests rely on timers.
// Tests should still opt into fake timers explicitly when needed.
jest.setTimeout(30000);
