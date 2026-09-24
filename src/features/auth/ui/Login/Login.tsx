import { useLoginMutation } from '@/features/auth/api/authApi.ts'
import { Path } from '@/common/routing/paths.ts'

export const Login = () => {
  const [login] = useLoginMutation()

  const loginHandler = () => {
    const redirectUri = import.meta.env.VITE_DOMAIN_ADDRESS + Path.OAuthRedirect

    const url = new URL(
      'auth/oauth-redirect',
      import.meta.env.VITE_BASE_URL.replace(/\/?$/, '/'),
    )
    url.searchParams.set('callbackUrl', redirectUri)

    const popup = window.open(url.href, 'oauthPopup', 'width=500, height=600')
    if (!popup) return

    const receiveMessage = (event: MessageEvent) => {
      if (
        event.origin !== import.meta.env.VITE_DOMAIN_ADDRESS ||
        event.source !== popup
      )
        return

      const code: unknown = event.data?.code
      if (typeof code !== 'string' || !code) return

      window.removeEventListener('message', receiveMessage)
      login({
        code,
        redirectUri,
        rememberMe: false,
      })
    }

    window.addEventListener('message', receiveMessage)
  }

  return (
    <button type={'button'} onClick={loginHandler}>
      login
    </button>
  )
}
