import { Tab } from '../entity/tab';
import { TimeInterval } from '../entity/time-interval';

export interface SyncUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface SyncDevice {
  userId?: string;
  deviceId: string;
  name: string;
  browser: string;
  platform: string;
  extensionId: string;
  extensionVersion: string;
  lastSeenAt?: string;
  summaryTime?: number;
  sessions?: number;
  domains?: number;
}

export interface SyncSession {
  token: string;
  user: SyncUser;
  devices: SyncDevice[];
  currentDevice?: SyncDevice;
  expiresAt?: string;
}

export interface SyncAccount {
  user: SyncUser;
  devices: SyncDevice[];
  currentDevice?: SyncDevice;
}

export interface SyncSnapshot {
  device: SyncDevice;
  tabs: Tab[];
  intervals: TimeInterval[];
  capturedAt: string;
}

export interface CloudDomainActivity {
  domain: string;
  favicon?: string;
  summaryTime: number;
  sessions: number;
  devices: string[];
}

export interface CloudDayActivity {
  date: string;
  summaryTime: number;
  sessions: number;
  devices: string[];
}

export interface CloudActivity {
  generatedAt: string;
  totals: {
    summaryTime: number;
    sessions: number;
    domains: number;
    days: number;
    devices: number;
  };
  domains: CloudDomainActivity[];
  days: CloudDayActivity[];
  devices: SyncDevice[];
}
