import {z} from 'zod';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {todayDate} from '../../deficit-client/client.js';
import {journalRequest} from './journal.js';
export function registerGetTodaySummary(server:McpServer,getToken:()=>string|undefined){
 server.registerTool('get_today_summary',{title:"Today's DEFICIT summary",description:'Canonical food allowance and saved records for the connected account. Pending submissions never count.',inputSchema:{timezone:z.string().default('UTC').describe('User IANA timezone; ask if unknown.')},annotations:{readOnlyHint:true}},async({timezone})=>{
 const context=await journalRequest(getToken(),{action:'context'});const date=todayDate(timezone);const records=context.records||[];const food=records.filter((r:any)=>r.kind==='food'&&r.date===date);const profile=records.find((r:any)=>r.kind==='profile');let target=profile?.data.calorieTarget ?? null;
 if(target===null&&profile?.id.endsWith(':baseline:0'))target=new Date(date+'T12:00:00Z').getUTCDay()===2?2750:2350;
 const sum=(key:string)=>food.length&&food.every((r:any)=>typeof r.data[key]==='number')?food.reduce((s:number,r:any)=>s+r.data[key],0):null;
 const calories=sum('calories')??0;
 return {content:[{type:'text' as const,text:JSON.stringify({date,timezone,calories,foodTarget:target,remaining:target===null?null:target-calories,protein:sum('protein'),carbs:sum('carbs'),fat:sum('fat'),meals:food,pendingSubmissions:context.submissions?.filter((s:any)=>s.status!=='saved').length||0,activity:records.filter((r:any)=>r.date===date&&['workout','sleep','plan'].includes(r.kind)),dashboardUrl:'https://the-cut-andy.innersdinners.chatgpt.site'})}]};
 });
}
