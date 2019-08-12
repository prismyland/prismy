import {
  prismy,
  methodSelector,
  createUrlEncodedBodySelector,
  redirect,
  res
} from 'prismy'
import createSession from 'prismy-session'
import JWTCookieStrategy from 'prismy-session-strategy-jwt-cookie'

const { sessionSelector, sessionMiddleware } = createSession(
  new JWTCookieStrategy({
    secret: 'RANDOM_HASH'
  })
)

const urlEncodedBodySelector = createUrlEncodedBodySelector()

export default prismy(
  [methodSelector, sessionSelector, urlEncodedBodySelector],
  (method, session, body) => {
    if (method === 'POST') {
      session.data = { message: body.message }
      return redirect('/')
    } else {
      const { data } = session
      return res(
        [
          '<!DOCTYPE html>',
          '<body>',
          `<p>Message: ${data != null ? (data as any).message : 'NULL'}</p>`,
          '<form action="/" method="post">',
          '<input name="message">',
          '<button type="submit">Send</button>',
          '</form>',
          '</body>'
        ].join('')
      )
    }
  },
  [sessionMiddleware]
)
