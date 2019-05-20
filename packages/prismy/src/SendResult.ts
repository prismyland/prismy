export class SendResult {
  constructor(
    public statusCode: number,
    public data?: any,
    public headers?: [string, number | string | string[]][]
  ) {}
}
