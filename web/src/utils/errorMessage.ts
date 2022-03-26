export function errorMessage(e: unknown): string {
  if (!isGenericError(e)) {
    return 'Unknown error';
  }

  return e.description || e.message || 'Unknown error';
}

interface GenericError {
  description?: string;
  message?: string;
}

function isGenericError(e: unknown): e is GenericError {
  return !!e && typeof e === 'object';
}
