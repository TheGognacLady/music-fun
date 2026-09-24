export const isErrorWithDetail = (
  error: unknown,
): error is { errors: { detail: string }[] } => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('errors' in error) ||
    !Array.isArray(error.errors)
  )
    return false
  const first: unknown = error.errors[0]
  return (
    typeof first === 'object' &&
    first !== null &&
    'detail' in first &&
    typeof first.detail === 'string'
  )
}
