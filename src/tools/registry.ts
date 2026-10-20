import type { Tool } from '../types';
import { jsonTool } from './json.ts';
import { base64Tool } from './base64.ts';
import { passwordTool } from './password.ts';
import { uuidTool } from './uuid.ts';
import { timestampTool } from './timestamp.ts';
import { urlTool } from './url.ts';
import { caseTool } from './case.ts';
export const tools:Tool[]=[jsonTool,base64Tool,passwordTool,uuidTool,timestampTool,urlTool,caseTool];
