import { IncomingMessage, ServerResponse } from 'http'

export abstract class BaseResult {
  abstract execute(req: IncomingMessage, res: ServerResponse): any
}
