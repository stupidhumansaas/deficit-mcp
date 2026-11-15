import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {apiFetch} from '../../deficit-client/client.js';
import {config} from '../../config.js';
export async function journalRequest(token:string|undefined,body:unknown):Promise<any>{
 if(!token)throw Error('Authentication required');
 const response=await fetch(`${config.deficitApiBase}/oauth/journal`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-Client-Type':'deficit-mcp'},body:JSON.stringify(body)});
 const result:any=await response.json();if(!response.ok)throw Error(typeof result.error==='string'?result.error:result.error?.message||'Journal request failed');return result;
}
export function registerJournalTools(server:McpServer,getToken:()=>string|undefined){
 server.registerTool('get_connection_status',{description:'Verify this authenticated DEFICIT MCP connection without creating records. Returns actual read verification and separately granted write/photo permissions.',inputSchema:{},annotations:{readOnlyHint:true}},async()=>{
 await journalRequest(getToken(),{action:'context'});
 const status=await apiFetch('/oauth/connection',getToken());
 return {content:[{type:'text' as const,text:JSON.stringify(status)}]};
 });
 const run=async(body:unknown)=>{try{return {content:[{type:'text' as const,text:JSON.stringify(await journalRequest(getToken(),body))}]}}catch(e:any){return {content:[{type:'text' as const,text:e.message}],isError:true}}};
 server.registerTool('read_cut_records',{description:'Read canonical DEFICIT records, including existing Cut history with IDs, revisions and sources.',inputSchema:{},annotations:{readOnlyHint:true}},async()=>{const c=await journalRequest(getToken(),{action:'context'});return {content:[{type:'text' as const,text:JSON.stringify(c.records)}]}});
 server.registerTool('read_cut_submissions',{description:'Read pending entries. Review exact versions; never log reviewed submissions separately.',inputSchema:{id:z.string().optional()},annotations:{readOnlyHint:true}},async args=>run({action:'submissions',...args}));
 server.registerTool('log_cut_record',{description:'Save or correct a record. Reuse requestId on retry. Corrections require expectedVersion. Never use for a submission saved via review_cut_submission.',inputSchema:{requestId:z.string().uuid(),id:z.string().optional(),expectedVersion:z.string().optional(),kind:z.enum(['food','weight','waist','body','workout','sleep','symptom','recipe','plan']),date:z.string(),data:z.record(z.string(),z.unknown()),confidence:z.string()}},async args=>run({action:'save',...args}));
 server.registerTool('review_cut_submission',{description:'Atomically ask a question or save one pending submission, using its exact version.',inputSchema:{id:z.string(),version:z.string(),status:z.enum(['question','saved']),message:z.string(),entries:z.array(z.object({kind:z.string(),date:z.string(),data:z.record(z.string(),z.unknown()),confidence:z.string()})).optional()}},async args=>run({action:'review',...args}));
 server.registerTool('read_cut_submission_photo',{description:'Read a private submission photo owned by this account.',inputSchema:{id:z.string(),index:z.number().int().min(0).max(2)},annotations:{readOnlyHint:true}},async args=>{const photo=await journalRequest(getToken(),{action:'photo',...args});return {content:[{type:'image' as const,data:photo.data,mimeType:photo.mimeType}]}});
}
