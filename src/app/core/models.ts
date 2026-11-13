export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type Audience = 'all' | 'new' | 'returning';
export type Frequency = 'always' | 'session' | 'day' | 'once';

export interface Modal {
  id?: number;
  title: string;
  body: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  delay_seconds: number;
  pages: string[];
  frequency: Frequency;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  status: CampaignStatus;
  audience: Audience;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
  modal: Modal | null;
  created_at: string;
  updated_at: string;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardSummary {
  days: number;
  active_campaigns: number;
  impressions: number;
  clicks: number;
  visitors: number;
  ctr: number;
  series: { day: string; impressions: number; clicks: number }[];
  top_campaigns: { id: number; name: string; impressions: number; clicks: number; ctr: number }[];
}

export interface AuditEntry {
  id: number;
  user: string | null;
  action: 'create' | 'update' | 'delete';
  action_display: string;
  model: string;
  object_id: string;
  object_repr: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  paused: 'Pausada',
  ended: 'Encerrada',
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  all: 'Todos os visitantes',
  new: 'Primeira visita',
  returning: 'Visitantes recorrentes',
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  always: 'Sempre',
  session: 'Uma vez por sessão',
  day: 'Uma vez por dia',
  once: 'Uma única vez',
};
