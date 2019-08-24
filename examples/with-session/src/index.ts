import { prismy, createUrlEncodedBodySelector, redirect, res } from 'prismy'
import { methodRouter } from 'prismy-method-router'
import createSession from 'prismy-session'
import JWTCookieStrategy from 'prismy-session-strategy-jwt-cookie'

const { sessionSelector, sessionMiddleware } = createSession(
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
          `<p>Message: ${data != null ? (data as any).message : 'NULL'}</p>`,
          '<form action="/" method="post">',
          '<input name="message">',
          '<button type="submit">Send</button>',
          '</form>',
          '</body>'
        ].join('')
      )
    }),
    post: prismy([sessionSelector, urlEncodedBodySelector], (session, body) => {
      session.data = { message: body.message }
      return redirect('/')
    })
  },
  [sessionMiddleware]
)
