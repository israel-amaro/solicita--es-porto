// --- Shared Types ---

export type Role = 'admin' | 'tecnico' | 'assistente' | 'estagiario' | 'gestor' | 'analista';
export type Status = 'aberto' | 'pendente' | 'em_atendimento' | 'concluido' | 'recusado';
export type Priority = 'baixo' | 'medio' | 'urgente';
export type Category = 'TI' | 'Manutenção' | 'Limpeza' | 'Supervisão';
export type Department = 'TI' | 'Manutenção' | 'Limpeza' | 'Supervisão';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit?: string;
  departments?: Department[];
}

export interface Comment {
  id: string;
  author_name: string;
  author_role: string;
  message: string;
  created_at: string;
}

export interface Loan {
  id: string;
  requester_name: string;
  registration: string;
  email: string;
  phone: string;
  equipment: string;
  location: string;
  reason: string;
  status: 'pendente' | 'autorizado' | 'liberado' | 'em_uso' | 'concluido' | 'recusado';

  // Autorização
  terms?: string;
  pin?: string;
  authorized_by?: string;
  authorized_at?: string;

  // Reprovação
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;

  // Assinatura / liberação
  signature_name?: string;
  signature_registration?: string;
  signature_email?: string;
  signature_date?: string;   // ISO, timestamp do servidor
  released_at?: string;

  // Checklists
  checklist_initial?: string;
  checklist_initial_at?: string;
  checklist_return?: string;
  checklist_return_at?: string;

  // Devolução
  return_condition?: 'sim' | 'nao';
  return_problem?: string;
  completed_by?: string;
  completed_at?: string;
  completed_via?: 'pin' | 'gestor_manual';

  created_at: string;
  logs: { action: string; user: string; timestamp: string; details?: string }[];
}

export interface Ticket {
  id: string;
  numeric_id?: number;
  unit?: 'PORTO';
  requester_name: string;
  email?: string;
  phone: string;
  location?: string;
  equipment?: string;
  category?: Category;
  description?: string;
  priority: Priority;
  urgent_explanation?: string;
  status: Status;
  technician_name?: string;
  assigned_technician_id?: string;
  created_at: string;
  completed_at?: string;
  total_time_ms: number;
  last_status_change_at: string;
  comments?: Comment[];
  evidenceUrls?: string[];
  evidencePaths?: string[];
  registration?: string;
  reason?: string;
}
