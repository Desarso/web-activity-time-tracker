import { ITabsRepository } from './tabs-repository-interface';
import { Tab } from '../entity/tab';
import { injectStorage } from '../storage/inject-storage';
import { isInBlackList } from '../functions/black-list';
import { StorageDeserializeParam } from '../storage/storage-params';
import { todayLocalDate } from '../utils/date';
import { ActivityScope } from '../utils/enums';

export class TabsRepository implements ITabsRepository {
  private tabs: Tab[];

  constructor() {
    this.tabs = [];
  }

  async initAsync() {
    this.tabs = (await injectStorage().getDeserializeList(StorageDeserializeParam.TABS)) as Tab[];
  }

  getTabs(): Tab[] {
    return this.tabs;
  }

  getTabsByScope(scope: ActivityScope = ActivityScope.Normal): Tab[] {
    return this.tabs.filter(tab => tab.incognito === (scope === ActivityScope.Incognito));
  }

  removeAllTabs(): void {
    this.tabs = [];
  }

  getTodayTabs(scope: ActivityScope = ActivityScope.Normal): Tab[] {
    return this.getTabsByScope(scope).filter(x => x.days.find(s => s.date === todayLocalDate()));
  }

  getTab(domain: string, scope: ActivityScope = ActivityScope.Normal): Tab | undefined {
    return this.tabs?.find(x => x.url === domain && x.incognito === (scope === ActivityScope.Incognito));
  }

  async addTab(domain: string, scope: ActivityScope = ActivityScope.Normal): Promise<Tab | undefined> {
    const tabFromStorage = this.getTab(domain, scope);
    const isInBlackListFlag = await isInBlackList(domain);

    if (!isInBlackListFlag && !tabFromStorage) {
      const newTab = new Tab();
      newTab.init(domain, scope === ActivityScope.Incognito);
      this.tabs.push(newTab);
      return newTab;
    }

    return undefined;
  }
}
