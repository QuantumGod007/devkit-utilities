export interface Tool { id: string; name: string; category: string; description: string; sample: string; inputLabel?: string; actions: { label: string; run: (input: string) => string }[]; }
