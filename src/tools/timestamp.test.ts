import {test} from 'node:test';import assert from 'node:assert/strict';import {fromUnix,toUnix} from './timestamp.ts';
test("Unix timestamp handles valid and invalid inputs",()=>{assert.equal(fromUnix("0"),"1970-01-01T00:00:00.000Z");assert.equal(toUnix("1970-01-01T00:00:00Z"),"0");assert.throws(()=>fromUnix("hello"));assert.throws(()=>toUnix("tomorrow"));});
