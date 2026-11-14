import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apiFetch,todayDate} from '../dist/deficit-client/client.js';

test('missing user token cannot fall back to a server account',async()=>{
 process.env.DEFICIT_BEARER_TOKEN='must-never-be-used';
 let called=false;const original=globalThis.fetch;
 globalThis.fetch=async()=>{called=true;throw Error('unexpected');};
 try{await assert.rejects(apiFetch('/api/users/me'),/Authentication required/);assert.equal(called,false);}finally{globalThis.fetch=original;delete process.env.DEFICIT_BEARER_TOKEN;}
});
test('each account gets only its own Authorization header',async()=>{
 const original=globalThis.fetch;const seen=[];
 globalThis.fetch=async(_,options)=>{seen.push(options.headers.Authorization);return {ok:true,json:async()=>({success:true,data:{}})};};
 try{await apiFetch('/api/users/me','account-a');await apiFetch('/api/users/me','account-b');assert.deepEqual(seen,['Bearer account-a','Bearer account-b']);}finally{globalThis.fetch=original;}
});
test('unsuccessful API envelope is not a saved or successful result',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({success:false})});
 try{await assert.rejects(apiFetch('/api/users/me','account-a'),/Invalid API response/);}finally{globalThis.fetch=original;}
});
test('IANA timezone is explicit and invalid zones fail',()=>{
 assert.match(todayDate('Europe/London'),/^\d{4}-\d{2}-\d{2}$/);
 assert.throws(()=>todayDate('not-a-timezone'),RangeError);
});
