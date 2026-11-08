export type FileProblem = 'missing' | 'size' | 'type';

export interface FileRule {
  readonly types: readonly string[];
  readonly maxBytes: number;
}

/** Contrôle côté navigateur, pour répondre vite. Le serveur devra le refaire et analyser le fichier. */
export function fileProblem(
  file: { readonly size: number; readonly type: string } | null,
  rule: FileRule,
): FileProblem | null {
  if (!file) return 'missing';
  if (!rule.types.includes(file.type)) return 'type';
  return file.size > rule.maxBytes ? 'size' : null;
}
