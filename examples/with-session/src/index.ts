import { prismy, createUrlEncodedBodySelector, redirect, res } from 'prismy'
import { methodRouter } from 'prismy-method-router'
import createSession from 'prismy-session'
import JWTCookieStrategy from 'prismy-session-strategy-jwt-cookie'

interface SessionData {
  message?: string
}

const { sessionSelector, sessionMiddleware } = createSession<SessionData>(
  new JWTCookieStrategy({
    secret: 'RANDOM_HASH'
  })
)

const urlEncodedBodySelector = createUrlEncodedBodySelector()

export default methodRouter(
  {
    get: prismy([sessionSelector], session => {
      const { data } = session
      return res(
        [
          '<!DOCTYPE html>',
          '<body>',
          `<p>Message: ${data != null ? data.message : 'NULL'}</p>`,
          '<form action="/" method="post">',
          '<input name="message">',
          '<button type="submit">Send</button>',
          '</form>',
          '</body>'
        ].join('')
      )
    }),
    post: prismy([sessionSelector, urlEncodedBodySelector], (session, body) => {
      session.data =
        typeof body.message === 'string' ? { message: body.message } : null
      return redirect('/')
    })
  },
  [sessionMiddleware]
)
