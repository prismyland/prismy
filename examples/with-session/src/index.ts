import {
  prismy,
  Method,
  BaseHandler,
  createInjectDecorators,
  createTextBodySelector
} from 'prismy'
import createSession, { SessionStore } from 'prismy-session'
import MemoryStore from 'prismy-session/dist/MemoryStore'
import querystring from 'querystring'

const { Session, sessionMiddleware } = createSession({
  store: new MemoryStore(),
  secret: 'secret'
})

const UrlencodedBody = () =>
  createInjectDecorators(async context => {
    const textBody = await createTextBodySelector()(context)
    return querystring.parse(textBody)
  })

class MyHandler extends BaseHandler {
  async handle(
    @Method() method: string,
    @Session() session: SessionStore,
    @UrlencodedBody() body: any
  ) {
    if (method === 'POST') {
      session.update({ message: body.message })
      return this.redirect('/')
    } else {
      const data = session.get()
      return [
        '<!DOCTYPE html>',
        '<body>',
        `<p>Message: ${data != null ? data.message : 'NULL'}</p>`,
        '<form action="/" method="post">',
        '<input name="message">',
        '<button type="submit">Send</button>',
        '</form>',
        '</body>'
      ].join('')
    }
  }
}

export default prismy([sessionMiddleware, MyHandler])
