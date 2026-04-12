export class BadRequest extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'BadRequest';
  }
}
