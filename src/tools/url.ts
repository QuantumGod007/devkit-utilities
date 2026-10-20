import type { Tool } from '../types.ts';
export function encode(value:string){return encodeURIComponent(value)} export function decode(value:string){try{return decodeURIComponent(value)}catch{throw new Error('Invalid percent encoding. Check incomplete escapes such as % or %2.')}}
export const urlTool:Tool={id:"url",name:"URL codec",category:"Encoding",description:"Safely encode or decode a URL component, including Unicode characters.",sample:"hello world?name=\u4e16\u754c",actions:[{label:"Encode component",run:encode},{label:"Decode component",run:decode}]};
