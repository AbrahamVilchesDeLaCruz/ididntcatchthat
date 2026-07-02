export interface RequestPageViewRecorder {
  path: string;
  visitorId: string;
  userId: string | null;
  referrer: string | null;
}
