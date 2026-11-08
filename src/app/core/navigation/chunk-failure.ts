import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { NavigationError } from '@angular/router';

export const isChunkFailure = (error: unknown): boolean =>
  error instanceof Error &&
  /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
    `${error.name} ${error.message}`,
  );

/**
 * Réseau coupé ou nouvelle version en ligne : un fichier de page peut manquer. Sans ce recours, le
 * clic ne ferait rien. Chaque page existe en HTML, un chargement complet suffit donc.
 */
export function reloadOnChunkFailure(event: NavigationError): void {
  if (isChunkFailure(event.error)) {
    inject(DOCUMENT).location.assign(event.url);
  }
}
