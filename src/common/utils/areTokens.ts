export const areTokens = (
  data: unknown,
): data is { accessToken: string; refreshToken: string } => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'accessToken' in data &&
    typeof data.accessToken === 'string' &&
    data.accessToken.length > 0 &&
    'refreshToken' in data &&
    typeof data.refreshToken === 'string' &&
    data.refreshToken.length > 0
  )
}
