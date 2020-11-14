import { State } from './state';

export class DataQuery {

  constructor(
    public start: string,
    public end: string,
    public county: string,
    public state: State,
  ) {  }

}
