import { Logger } from 'src/logger';

export class LoggerMock extends Logger {

  public debugMock = jest.fn();

  public infoMock = jest.fn();

  public warnMock = jest.fn();

  public errorMock = jest.fn();

  public debug(message: string, ...args: any[]): void {
    this.debugMock(message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.infoMock(message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.warnMock(message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.log(...args);
    this.errorMock(message, ...args);
  }

}
