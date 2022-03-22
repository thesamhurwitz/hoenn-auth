import { IResult } from 'ua-parser-js';

export default interface DeviceInfo {
  ip: string;
  device: IResult;
  location: Object;
}
