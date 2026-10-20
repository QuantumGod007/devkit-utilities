import {test} from 'node:test';import assert from 'node:assert/strict';import {format} from './json.ts';
test("JSON formatter handles valid and invalid inputs",()=>{assert.equal(format('{"a":1}'), '{\n  "a": 1\n}'); assert.throws(()=>format("broken"));});
