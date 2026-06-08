import { Tab } from '../entity/tab';
import { ActivityScope } from '../utils/enums';

export interface ITabsRepository {
  initAsync(): void;
  getTabs(): Tab[];
  getTabsByScope(scope?: ActivityScope): Tab[];
  removeAllTabs(): void;
  getTodayTabs(scope?: ActivityScope): Tab[];
  getTab(domain: string, scope?: ActivityScope): Tab | undefined;
  addTab(domain: string, scope?: ActivityScope): Promise<Tab | undefined>;
}
