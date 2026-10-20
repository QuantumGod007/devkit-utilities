import {test} from 'node:test';import assert from 'node:assert/strict';import {generate} from './password.ts';
test("Password generator handles valid and invalid inputs",()=>{const value=generate("24");assert.equal(value.length,24);for(const pattern of [/[A-Z]/,/[a-z]/,/[0-9]/,/[!@#$%^&*()_=+\-]/])assert.match(value,pattern);assert.throws(()=>generate("2"));});
