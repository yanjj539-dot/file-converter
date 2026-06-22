export const useAssetPath = () => {
  const runtimeConfig = useRuntimeConfig()

  return (path: string) => {
    if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
      return path
    }

    const baseURL = runtimeConfig.app.baseURL.endsWith('/')
      ? runtimeConfig.app.baseURL
      : `${runtimeConfig.app.baseURL}/`
    const normalizedPath = path.replace(/^\/+/, '')

    return `${baseURL}${normalizedPath}`
  }
}
