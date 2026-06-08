import { extractHostname } from './extract-hostname';

export class ActiveTab {
  private static instance: ActiveTab;
  private _activeTabUrl: string | null;
  private _activeTabDomain: string | null;
  private _isIncognito: boolean;

  constructor() {
    if (ActiveTab.instance) {
      throw new Error('Error - use ActiveTab.getInstance()');
    }
    this._activeTabUrl = null;
    this._activeTabDomain = null;
    this._isIncognito = false;
  }

  static getInstance(): ActiveTab {
    ActiveTab.instance = ActiveTab.instance || new ActiveTab();
    return ActiveTab.instance;
  }

  public setActiveTab(value: string | null, isIncognito = false): void {
    this._activeTabUrl = value;
    this._activeTabDomain = value != null ? extractHostname(value) : null;
    this._isIncognito = value != null && isIncognito;
  }

  public getActiveTabUrl(): string | null {
    return this._activeTabUrl;
  }

  public getActiveTabDomain(): string | null {
    return this._activeTabDomain;
  }

  public getActiveTabIsIncognito(): boolean {
    return this._isIncognito;
  }
}
