import {test} from 'node:test';import assert from 'node:assert/strict';import {encode,decode} from './url.ts';
test("URL codec handles valid and invalid inputs",()=>{assert.equal(decode(encode("hello 世界 &?")),"hello 世界 &?");assert.throws(()=>decode("%2"));});
