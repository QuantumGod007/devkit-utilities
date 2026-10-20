import { test } from 'node:test';
import assert from 'node:assert/strict';
test('required browser primitives are available', () => { assert.equal(typeof TextEncoder, 'function'); assert.equal(typeof crypto.getRandomValues, 'function'); });
