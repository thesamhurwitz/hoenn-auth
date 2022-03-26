export class SessionServiceMock {

  public sessions: object;

  public getMock = jest.fn();

  public get(sessionId: string): Promise<object> {
    this.getMock(sessionId);
    return Promise.resolve(this.sessions[sessionId]);
  }

}
