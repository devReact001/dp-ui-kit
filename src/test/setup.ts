import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// @testing-library/react normally registers this cleanup automatically by
// detecting a global test-framework `afterEach` — but since these test files
// import `describe`/`it`/`expect` explicitly from 'vitest' rather than relying
// on injected globals, that auto-detection doesn't fire. Without it, the DOM
// rendered by one `it()` block stays mounted into the next, so a later test's
// `getByRole('button')` can match more than one button and fail.
afterEach(() => {
  cleanup();
});
