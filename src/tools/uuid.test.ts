import {test} from 'node:test';import assert from 'node:assert/strict';import {generate} from './uuid.ts';
test("UUID generator handles valid and invalid inputs",()=>{const values=generate("5").split("\n");assert.equal(new Set(values).size,5);assert.match(values[0],/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);assert.throws(()=>generate("101"));});
