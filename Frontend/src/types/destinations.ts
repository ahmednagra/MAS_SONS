import type { Incoterm } from './quote-requests';

export interface DestinationInfo {
  country: string;
  port: string;
  incoterms: Incoterm[];
  dutyNotes: string;
}
