import {test} from 'node:test';import assert from 'node:assert/strict';import {count} from './counter.ts';
test("Text inspector handles valid and invalid inputs",()=>{const value=JSON.parse(count("hello world 👋"));assert.equal(value.words,2);assert.equal(value.characters,13);assert.equal(JSON.parse(count("")).lines,0);});
