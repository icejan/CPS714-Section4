# Testing Documentation

This document provides instructions on how to run and create tests for the backend application.

## Prerequisites

- Node.js installed
- Dependencies installed (`npm install`)

## Running Tests

To run the existing tests, execute the following command in the `backend` directory:

```bash
npm test
```

This command runs `jest`, which will find and execute all files ending in `.test.js` or `.spec.js`.

## Creating New Tests

1.  **File Location**: Place your test files in the `tests/` directory.
2.  **Naming Convention**: Name your test files with `.test.js` extension (e.g., `myFeature.test.js`).
3.  **Frameworks**: We use [Jest](https://jestjs.io/) as the test runner and assertion library, and [Supertest](https://github.com/ladjs/supertest) for testing HTTP endpoints.

### Mocking Firebase Admin

Since the application uses `firebase-admin`, you need to mock it in your tests to avoid connecting to the real database.

Here is a template for a test file:

```javascript
const request = require('supertest');
const admin = require('firebase-admin');

// 1. Define mock objects for database references
const mockRef = {
  once: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  // Add other methods as needed
};
const mockDatabase = {
  ref: jest.fn(() => mockRef),
};

// 2. Mock firebase-admin module
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    database: jest.fn(() => mockDatabase),
  };
});

// 3. Mock ServerValue if used
admin.database.ServerValue = {
  TIMESTAMP: 'mock-timestamp',
};

// 4. Require the app AFTER mocking
const app = require('../src/app');

describe('My Feature API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock implementation
    mockDatabase.ref.mockReturnValue(mockRef);
    mockRef.push.mockReturnValue(mockRef);
  });

  it('should return 200 OK', async () => {
    // Setup mock return value for database query
    mockRef.once.mockResolvedValue({
      val: () => ({ /* mock data */ }),
    });

    const res = await request(app)
      .get('/api/my-endpoint');

    expect(res.statusCode).toEqual(200);
  });
});
```

### Key Points

- **Mocking**: Always mock `firebase-admin` before requiring `../src/app`.
- **Isolation**: Use `beforeEach` to clear mocks and reset implementations to ensure tests don't affect each other.
- **Async/Await**: Use `async/await` for `supertest` requests and database operations.

## Troubleshooting

- **"The module factory of jest.mock() is not allowed to reference any out-of-scope variables"**:
  - Ensure variables used inside `jest.mock()` factory start with `mock` (e.g., `mockDatabase`).
- **Server address in use**:
  - The `app.js` has been modified to only listen on a port if run directly. If you see this error, ensure you are importing `app` and not running it as a script in your tests.
