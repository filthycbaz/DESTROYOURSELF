// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

// react-router v7 and msw/node both reference TextEncoder/TextDecoder/
// TransformStream, which jest-environment-jsdom 27 does not provide
// globally. require() (unlike import) is not hoisted by Babel, so this
// polyfill runs before anything below tries to import those modules.
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
if (typeof global.TransformStream === 'undefined') {
  const webStreams = require('stream/web');
  global.TransformStream = webStreams.TransformStream;
  global.ReadableStream = webStreams.ReadableStream;
  global.WritableStream = webStreams.WritableStream;
}
require('@testing-library/jest-dom');

const { server } = require('./test-utils/msw/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
