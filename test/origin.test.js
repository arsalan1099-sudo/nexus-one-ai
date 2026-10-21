import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePublicOrigin} from '../src/origin.js';
test('Render hostname resolves to an HTTPS origin',()=>assert.equal(resolvePublicOrigin({RENDER_EXTERNAL_HOSTNAME:'nexus-asi.onrender.com'}),'https://nexus-asi.onrender.com'));
test('explicit custom domain overrides Render hostname',()=>assert.equal(resolvePublicOrigin({APP_ORIGIN:'https://nexus.example.org',RENDER_EXTERNAL_HOSTNAME:'nexus-asi.onrender.com'}),'https://nexus.example.org'));
test('empty origin without hostname remains invalid to config schema',()=>assert.equal(resolvePublicOrigin({}),undefined));
test('hostnames containing port/protocol are rejected',()=>{assert.throws(()=>resolvePublicOrigin({RENDER_EXTERNAL_HOSTNAME:'localhost:3000'}));assert.throws(()=>resolvePublicOrigin({RENDER_EXTERNAL_HOSTNAME:'evil..example.com'}));});
