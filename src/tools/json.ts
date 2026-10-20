import type { Tool } from '../types.ts';
export function format(value:string){return JSON.stringify(JSON.parse(value),null,2)}
export const jsonTool:Tool={id:"json",name:"JSON formatter",category:"Data",description:"Format, minify, or validate JSON with clear syntax errors.",sample:"{\"hello\":\"world\",\"ready\":true}",actions:[{label:"Format JSON",run:format},{label:"Minify",run:(value:string)=>JSON.stringify(JSON.parse(value))},{label:"Validate",run:(value:string)=>{JSON.parse(value);return "Valid JSON"}}]};
