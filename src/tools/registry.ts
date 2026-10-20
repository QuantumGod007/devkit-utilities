import type { Tool } from '../types';
import { jsonTool } from './json.ts';
import { base64Tool } from './base64.ts';
import { passwordTool } from './password.ts';
import { uuidTool } from './uuid.ts';
export const tools:Tool[]=[jsonTool,base64Tool,passwordTool,uuidTool];
