import { EventData } from '../../types';

export interface V3ComponentProps {
  event: EventData;
  variables: Record<string, string>;
  variant?: string;
}
