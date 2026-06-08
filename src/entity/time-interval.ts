import { logger } from '../utils/logger';

export class TimeInterval implements ISerializable<TimeInterval> {
  domain: string = '';
  intervals: string[] = [];
  day: string = '';
  incognito: boolean = false;

  init(day: string, domain: string, incognito = false) {
    this.domain = domain;
    this.intervals = [];
    this.day = day;
    this.incognito = incognito;
  }

  addInterval() {
    const stringDate = this.getCurrentStringDate();
    this.intervals.push(stringDate + '-' + stringDate);
    logger.log(`Add interval ${this.domain} - ${stringDate} - ${stringDate}`);
  }

  closeInterval() {
    const stringDate = this.getCurrentStringDate();
    const currentInterval = this.intervals[this.intervals.length - 1];
    if (currentInterval != null) {
      if (currentInterval.split('-')[0] == currentInterval.split('-')[1]) {
        this.intervals.pop();
        this.intervals.push(currentInterval.split('-')[0] + '-' + stringDate);
        logger.log(
          `Close interval ${this.domain} - ${currentInterval.split('-')[0]} - ${stringDate}`,
        );
      }
    }
  }

  deserialize(input: TimeInterval): TimeInterval {
    this.domain = input.domain;
    this.day = input.day;
    this.intervals = input.intervals;
    this.incognito = input.incognito === true;

    return this;
  }

  private getCurrentStringDate(): string {
    const date = new Date();
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  }
}
