export type ImportedEvent = {
  title: string;
  externalId: string;
  description?: string | null;

  startAt: string;
  endAt?: string | null;

  category?: string | null;

  venueName?: string | null;
  district?: string | null;

  imageUrl?: string | null;
  ticketUrl?: string | null;
  sourceUrl: string;

  isFree?: boolean;
};