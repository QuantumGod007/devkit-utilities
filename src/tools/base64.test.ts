import {test} from 'node:test';import assert from 'node:assert/strict';import {encode,decode} from './base64.ts';
test("Base64 codec handles valid and invalid inputs",()=>{assert.equal(decode(encode("Hello, 世界 👋")),"Hello, 世界 👋");assert.throws(()=>decode("%%%"));});
