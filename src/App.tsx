/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  LogIn, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Monitor, 
  User, 
  Phone, 
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Timer,
  ArrowLeft,
  Search,
  Filter,
  Settings,
  Lock,
  Wrench,
  Briefcase,
  Cpu,
  Calendar,
  FileText,
  Key,
  Hash,
  Sparkles,
  Brush,
  Trash2,
  ArrowRight,
  BookOpen,
  Link2,
  ExternalLink
} from 'lucide-react';

const USEFUL_LINKS = [
  {
    title: "Diário de Classe (Pauta e RH)",
    url: "https://portal.findes.org.br/Corpore.Net/Login.aspx?autoload=false&ReturnUrl=%2fCorpore.Net%2fMain.aspx%3fActionID%3dEduDiarioClasseActionWeb%26SelectedMenuIDKey%3dmnDiarioClasse",
    user: "Nº de Matrícula",
    desc: "Acesso ao Diário de Classe, pautas e recursos humanos da Findes.",
    category: "Acadêmico"
  },
  {
    title: "Portal EAD Sesi Educação",
    url: "https://ead.sesieducacao.com.br/uc/login?dir=%2Fuc%2F&hash=portal",
    user: "CPF",
    desc: "Cursos previstos no PDI (Plano de Desenvolvimento Individual) e outras formações.",
    category: "Capacitação"
  },
  {
    title: "Horário de Aula",
    url: "https://portal.findes.org.br",
    user: "CPF",
    desc: "Consulta e acompanhamento do horário de aulas institucional.",
    category: "Acadêmico"
  },
  {
    title: "Plataforma Meu SENAI",
    url: "https://identidade.senai.br/authenticationendpoint/login.do?RelayState=https%3A%2F%2Fmeusenai.senai.br%2F&commonAuthCallerPath=%2Fsamlsso&forceAuth=false&passiveAuth=false&tenantDomain=carbon.super&sessionDataKey=7c08b55c-f8fb-4804-abf4-f2c51a55f589&relyingParty=https%3A%2F%2Fmeusenai.senai.br&type=samlsso&sp=meusenai.senai.br&isSaaSApp=false&authenticators=BasicAuthenticator%3ALOCAL",
    user: "CPF ou E-mail Docente",
    desc: "Acesso à plataforma Meu SENAI e conta Google Educacional (login com o e-mail docente).",
    category: "Acadêmico"
  },
  {
    title: "Metas e Feedback Individual",
    url: "https://portal.findes.org.br",
    user: "E-mail Corporativo",
    desc: "Acesso à plataforma de metas individuais, avaliações e feedback corporativo.",
    category: "Corporativo"
  },
  {
    title: "E-mail Corporativo (Outlook)",
    url: "https://outlook.office.com/mail/",
    user: "E-mail Corporativo",
    desc: "Caixa de entrada oficial do e-mail corporativo (Office 365).",
    category: "Comunicação"
  },
  {
    title: "EAD SENAI-ES (Portal do Aluno)",
    url: "https://ead.senaies.org.br/",
    user: "CPF",
    desc: "Portal para acompanhamento de atividades dos alunos na modalidade EAD.",
    category: "Acadêmico"
  },
  {
    title: "Banco de Questões SAEP (SISBIA)",
    url: "https://sisbia.senai.br",
    user: "E-mail Corporativo",
    desc: "Acesso ao banco de questões padrão para o Sistema de Avaliação da Educação Profissional.",
    category: "Avaliação"
  },
  {
    title: "Itinerário Nacional SENAI",
    url: "https://itinerario.senai.br/",
    user: "Google Educacional",
    desc: "Cursos e conteúdos didáticos do Itinerário Nacional do SENAI.",
    category: "Capacitação"
  },
  {
    title: "Recursos Didáticos SENAI",
    url: "https://recursosdidaticos.senai.br/",
    user: "Google Educacional",
    desc: "Situações de aprendizagem, simuladores, games, apostilas e materiais didáticos diversos.",
    category: "Materiais"
  },
  {
    title: "Conteúdo Online SENAI-ES",
    url: "https://conteudoonline.senai-es.org.br/login",
    user: "Solicitar acesso na própria tela de login",
    desc: "Planos de curso, calendários escolares e formulários operacionais (Atividades, Provas, S.A.s, Planos de Aula/Ensino).",
    category: "Materiais"
  }
];
import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, formatDuration, SLA_MS, formatSLA } from './lib/utils';
import { uploadFile, deleteFile } from './lib/storage';

// --- Types ---
type Role = 'admin' | 'tecnico' | 'assistente' | 'estagiario' | 'gestor' | 'analista';
type Status = 'aberto' | 'pendente' | 'em_atendimento' | 'concluido' | 'recusado';
type Priority = 'baixo' | 'medio' | 'urgente';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  departments?: ('TI' | 'Manutenção' | 'Limpeza' | 'Supervisão')[];
}

interface Comment {
  id: string;
  author_name: string;
  author_role: string;
  message: string;
  created_at: string;
}

interface Loan {
  id: string;
  requester_name: string;
  registration: string;
  phone: string;
  equipment: string;
  location: string;
  reason: string;
  status: 'pendente' | 'autorizado' | 'liberado' | 'em_uso' | 'concluido';
  terms?: string;
  pin?: string;
  authorized_by?: string;
  authorized_at?: string;
  signature_name?: string;
  signature_registration?: string;
  signature_date?: string;
  released_at?: string;
  return_condition?: 'sim' | 'nao';
  return_problem?: string;
  completed_by?: string;
  completed_at?: string;
  created_at: string;
  logs: { action: string; user: string; timestamp: string; details?: string }[];
}

const UNIT_LOCATIONS: Record<string, string[]> = {
  'PORTO': [
    "SAL01 - SALA ESTRUTURAR",
    "SAL02 - SALA APRIMORAR",
    "SAL03 - SALA FORTALECER",
    "SAL04 - SALA EXPLORAR",
    "SAL05 - SALA OBSERVAR",
    "SAL06 - SALA COMPREENDER",
    "SAL07 - SALA CONECTAR",
    "SAL08 - SALA INOVAR",
    "SAL09 - SALA INSPIRAR",
    "SAL10 - SALA EVOLUIR",
    "SAL11 - SALA EXPANDIR",
    "SAL12 - SALA CRIAR",
    "SAL13 - SALA PLANEJAR",
    "SAL14 - SALA ORGANIZAR",
    "LAB01 - LAB. PROTOTIPAR",
    "LAB02 - LAB. MOVIMENTAR",
    "LAB03 - LAB. INTEGRAR",
    "LAB04 - LAB. IMPULSIONAR",
    "LAB05 - LAB. VALORIZAR",
    "LAB06 - LAB. TRANSFORMAR",
    "LAB07 - LAB. EXPERIMENTAR",
    "LAB08 - LAB. OTIMIZAR",
    "LAB09 - LAB. VALIDAR",
    "LAB10 - SALA COMPARTILHAR",
    "LAB11 - SALA COLABORAR",
    "SENAI LAB",
    "SALA DE ATENDIMENTO 01",
    "SALA DE ATENDIMENTO 02",
    "ESPAÇO EDUCAR",
    "ESPAÇO COODERNAR",
    "ESPAÇO CONEXOES",
    "PEDAGOGICO 1PAV",
    "PEDAGOGICO 2PAV",
    "RECEPÇÃO",
    "AREA DE VIVENCIA"
  ]
};

interface Ticket {
  id: string;
  numeric_id?: number;
  unit?: 'PORTO';
  requester_name: string;
  email?: string;
  phone: string;
  location?: string;
  equipment?: string;
  category?: 'TI' | 'Manutenção' | 'Limpeza' | 'Supervisão';
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
  // Standard fields for Limpeza, Compras, Financeiro, RH
  registration?: string;
  reason?: string;
  // Patrimônio specific
  new_location?: string;
  approved_by?: string;
  approved_at?: string;
}

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2',
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
    <input 
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all",
        error && "border-red-500 focus:ring-red-100"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);

const Card = ({ children, className, ...props }: any) => (
  <div 
    className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({ children, className }: any) => (
  <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", className)}>
    {children}
  </span>
);

const Sidebar = ({ view, setView, user, setShowPasswordModal, handleLogout }: any) => (
  <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 space-y-8">
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center">
        <img 
          src="https://lh3.googleusercontent.com/d/1x_2FRXCBA5T2PDG7JjDx6me8RboCVaj0" 
          alt="Logo 2" 
          className="w-32 h-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>

    <nav className="flex-1 space-y-2">
      <button 
        onClick={() => setView('dashboard')} 
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
          view === 'dashboard' ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        <LayoutDashboard className="w-5 h-5" /> Dashboard
      </button>
      {(user?.departments?.includes('ADM') || user?.departments?.includes('TI') || user?.role === 'admin') && (
        <button 
          onClick={() => setView('loans-dashboard')} 
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
            view === 'loans-dashboard' ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Briefcase className="w-5 h-5" /> Empréstimos
        </button>
      )}

      {user?.role === 'admin' && (
        <button 
          onClick={() => setView('users')} 
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
            view === 'users' ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Users className="w-5 h-5" /> Usuários
        </button>
      )}
      <button 
        onClick={() => setShowPasswordModal(true)} 
        className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
      >
        <Lock className="w-5 h-5" /> Alterar Senha
      </button>
    </nav>

    <div className="pt-6 border-t border-slate-100">
      <div className="px-4 py-3 bg-slate-50 rounded-xl mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Logado como</p>
        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
        <Badge className="bg-blue-100 text-blue-700 mt-1">{user?.role}</Badge>
      </div>
      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors">
        <LogOut className="w-5 h-5" /> Sair
      </button>
    </div>
  </aside>
);

// --- Main App ---

interface OpenTicketViewProps {
  selectedUnit: string | null;
  setSelectedUnit: (unit: any) => void;
  selectedCategory: string | null;
  setView: (view: any) => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setCreatedTicketId: (id: string | null) => void;
}

const OpenTicketView = ({
  selectedUnit,
  setSelectedUnit,
  selectedCategory,
  setView,
  showMessage,
  loading,
  setLoading,
  setCreatedTicketId
}: OpenTicketViewProps) => {
  const [ticketPriority, setTicketPriority] = useState<Priority>('baixo');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  const handleOpenTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let evidenceUrls: string[] = [];
      let evidencePaths: string[] = [];

      if (evidenceFiles.length > 0) {
        for (const file of evidenceFiles) {
          const { url, path } = await uploadFile(file);
          evidenceUrls.push(url);
          evidencePaths.push(path);
        }
      }

      const payload: any = {
        ...Object.fromEntries(formData.entries()),
        category: selectedCategory,
        evidenceUrls,
        evidencePaths
      };

      if (payload.unit) {
        setSelectedUnit(payload.unit as any);
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Erro do servidor: ${text.substring(0, 50)}...`);
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido no servidor');
      }

      showMessage('success', `Chamado #${data.numeric_id || data.id} aberto com sucesso!`);
      setCreatedTicketId(data.numeric_id || data.id);
      setEvidenceFiles([]);
      setView('ticket-success');
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao abrir chamado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView('home')} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar para Início
        </Button>
        
        <Card className="p-8 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Nova Solicitação</h2>
            <div className="flex gap-2 animate-fade-in">
                <Badge className="bg-blue-600 text-white px-4 py-1.5">{selectedUnit || 'PORTO'}</Badge>
                <Badge className="bg-slate-600 text-white px-4 py-1.5">{selectedCategory}</Badge>
              </div>
            </div>
            <p className="text-slate-500">Preencha os detalhes abaixo para que possamos ajudar.</p>
          </div>

          <form onSubmit={handleOpenTicket} className="space-y-6">
            {/* Hidden field for unit */}
            <input type="hidden" name="unit" value={selectedUnit || 'PORTO'} />

            {/* Ambiente Selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Ambiente</label>
              <select 
                name="location" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Selecione o Ambiente...</option>
                {(UNIT_LOCATIONS[selectedUnit || 'PORTO'] || []).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Standard Fields for all categories */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Nome Completo" name="requester_name" required />
              <Input label="Matrícula" name="registration" required />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Telefone" name="phone" required />
              <Input label="Email Corporativo" name="email" type="email" required />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Prioridade</label>
                <select 
                  name="priority" 
                  required 
                  value={ticketPriority}
                  onChange={(e: any) => setTicketPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            {ticketPriority === 'urgente' && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Explicação da Urgência</label>
                <textarea 
                  name="urgent_explanation"
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Por que esta solicitação é urgente?"
                />
              </div>
            )}

            {/* Category-specific fields */}
            {(selectedCategory === 'TI' || selectedCategory === 'Manutenção') && (
              <>
                <Input label="Equipamento" name="equipment" required />
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Descrição do Problema</label>
                  <textarea name="description" required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                </div>
              </>
            )}

            {['Limpeza', 'Supervisão'].includes(selectedCategory!) && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Motivo da Solicitação</label>
                <textarea name="reason" required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Evidências (Opcional)</label>
              <input 
                type="file" 
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    setEvidenceFiles(Array.from(e.target.files));
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <p className="text-xs text-slate-500 ml-1">Você pode selecionar múltiplos arquivos (imagens, PDFs, documentos).</p>
              {evidenceFiles.length > 0 && (
                <div className="mt-2 text-sm text-slate-700">
                  {evidenceFiles.length} arquivo(s) selecionado(s).
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 text-lg">
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

interface TicketTrackingViewProps {
  createdTicketId: string | null;
  setCreatedTicketId: (id: string | null) => void;
  setView: (view: string) => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
  selectedUnit?: 'BEIRA-MAR' | 'PORTO' | 'Jardim da Penha' | 'Maruípe' | null;
}

const TicketTrackingView = ({ createdTicketId, setCreatedTicketId, setView, showMessage }: TicketTrackingViewProps) => {
  const [searchTerm, setSearchTerm] = useState(createdTicketId ? String(createdTicketId) : '');
  const [trackedTicket, setTrackedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrackedTicket = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/track/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Chamado não encontrado. Verifique o número digitado.');
        }
        throw new Error('Erro ao buscar o chamado');
      }
      const data = await res.json();
      setTrackedTicket(data);
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao carregar chamado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (createdTicketId) {
      fetchTrackedTicket(createdTicketId);
    }
  }, [createdTicketId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <Button variant="ghost" onClick={() => {
          if (trackedTicket) {
            setTrackedTicket(null);
            setCreatedTicketId(null);
            setSearchTerm('');
          } else {
            setView('home');
          }
        }} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> {trackedTicket ? 'Voltar para Consulta' : 'Voltar para Início'}
        </Button>

        {!trackedTicket ? (
          <Card className="p-8 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 animate-fade-in">Acompanhar Chamado</h2>
              <p className="text-slate-500">Digite o número do seu chamado para acompanhar seu status em tempo real.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                fetchTrackedTicket(searchTerm.trim());
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Número do Chamado</label>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Ex: 123" 
                  required
                  className="w-full px-4 py-3 h-12 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-center font-bold text-lg"
                />
              </div>

              <Button 
                type="submit" 
                loading={isLoading}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all"
              >
                Buscar Chamado
              </Button>
            </form>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Chamado #{trackedTicket.numeric_id || trackedTicket.id}
                    </h3>
                    <Badge className={STATUS_COLORS[trackedTicket.status]}>
                      {STATUS_LABELS[trackedTicket.status]}
                    </Badge>
                  </div>
                  <p className="text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Aberto em {new Date(trackedTicket.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Detalhes</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">Solicitante: {trackedTicket.requester_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{trackedTicket.unit}</span>
                        {trackedTicket.location && <span className="text-slate-500">- {trackedTicket.location}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{trackedTicket.category}</span>
                      </div>
                      {trackedTicket.equipment && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Monitor className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{trackedTicket.equipment}</span>
                        </div>
                      )}
                      {trackedTicket.technician_name && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">Técnico: {trackedTicket.technician_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {['Limpeza', 'Supervisão'].includes(trackedTicket.category!) ? 'Motivo da Solicitação' : 'Descrição'}
                    </h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                      {['Limpeza', 'Supervisão'].includes(trackedTicket.category!) ? trackedTicket.reason : trackedTicket.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Histórico</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {trackedTicket.history?.map((log: any, index: number) => (
                      <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{STATUS_LABELS[log.status as Status] || log.status}</span>
                            <span className="text-xs font-medium text-slate-400">
                              {new Date(log.changed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{log.changed_by_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const UsefulLinksView = ({ setView }: { setView: (v: any) => void }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | 'Todos'>('Todos');

  const categories = ['Todos', 'Acadêmico', 'Corporativo', 'Capacitação', 'Materiais', 'Avaliação', 'Comunicação'];

  const filtered = USEFUL_LINKS.filter(link => {
    const matchesSearch = 
      link.title.toLowerCase().includes(search.toLowerCase()) ||
      (link.desc || '').toLowerCase().includes(search.toLowerCase()) ||
      link.user.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCat === 'Todos' || link.category === selectedCat;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <Button variant="ghost" onClick={() => setView('home')} className="h-10 hover:bg-slate-200 rounded-xl px-4 text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Links Úteis</h2>
            <p className="text-slate-500 text-lg font-medium">Sistemas institucionais, ferramentas operacionais e materiais de apoio.</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-rose-100 transition-all shadow-sm">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              placeholder="Buscar portal ou função..." 
              className="outline-none text-sm bg-transparent w-full sm:w-64" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border",
                selectedCat === cat
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-200 border-rose-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((link, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between hover:shadow-2xl hover:border-rose-400 hover:-translate-y-1 transition-all border border-slate-200 bg-white group rounded-3xl h-full animate-fadeIn">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <span className={cn(
                    "text-[9px] uppercase font-black tracking-wider px-3 py-1 rounded-full border border-solid",
                    link.category === 'Acadêmico' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    link.category === 'Corporativo' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    link.category === 'Capacitação' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                    link.category === 'Materiais' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    link.category === 'Avaliação' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  )}>
                    {link.category}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 shrink-0">
                    Login: {link.user}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors leading-snug">{link.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">{link.desc}</p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-semibold">Credencial: <strong className="text-slate-600">{link.user.split(',')[0]}</strong></span>
                {link.url ? (
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md group-hover:shadow-rose-100"
                  >
                    Acessar <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                    Rede Interna
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-3xl">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nenhum link encontrado</h3>
            <p className="text-slate-400 text-sm mt-1 font-medium">Tente buscar por termos diferentes ou selecione outra categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'open-ticket' | 'login' | 'dashboard' | 'ticket-detail' | 'users' | 'ticket-success' | 'loans-menu' | 'loan-request' | 'loan-tracking' | 'loans-dashboard' | 'patrimonio-dashboard' | 'ticket-tracking' | 'useful-links'>('home');
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<'PORTO'>('PORTO');
  const [selectedCategory, setSelectedCategory] = useState<'TI' | 'Manutenção' | 'Limpeza' | 'Supervisão' | null>(null);
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<'TI' | 'Manutenção' | 'Limpeza' | 'Supervisão' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tick, setTick] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [showAddUsersForm, setShowAddUsersForm] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanTab, setLoanTab] = useState<'ativos' | 'concluidos'>('ativos');
  const [authTerms, setAuthTerms] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [returnCondition, setReturnCondition] = useState<'sim' | 'nao'>('sim');
  const [returnProblem, setReturnProblem] = useState('');

  useEffect(() => {
    let interval: any;
    if ((view === 'dashboard' && selectedUnit) || view === 'ticket-detail') {
      interval = setInterval(() => setTick(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, selectedUnit]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/users?t=${new Date().getTime()}`, { 
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      console.log('fetchUsers data:', data);
      if (Array.isArray(data)) {
        setUsersList(data);
      } else {
        console.error("Failed to fetch users:", data);
        setUsersList([]);
      }
    } catch (e) {
      console.error("Error fetching users:", e);
      setUsersList([]);
    }
  };

  useEffect(() => {
    if (view === 'users' && token) {
      fetchUsers();
    }
  }, [view, token]);

  const calculateActiveTime = (ticket: Ticket) => {
    let activeTime = ticket.total_time_ms || 0;
    if (ticket.status === 'aberto' || ticket.status === 'em_atendimento') {
      const lastChange = new Date(ticket.last_status_change_at).getTime();
      const now = new Date().getTime();
      activeTime += Math.max(0, now - lastChange);
    }
    return activeTime;
  };

  const fetchTickets = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      setTickets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/loans', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setLoans(data);
    } catch (e) {
      console.error("Error fetching loans:", e);
    }
  };



  // Auth Effect
  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'tecnico' && parsedUser.departments && parsedUser.departments.length > 0) {
          setFilterCategory(parsedUser.departments[0]);
        }
        if (parsedUser.unit && parsedUser.unit !== 'Todas') {
          setSelectedUnit(parsedUser.unit);
        }
      }
      fetchTickets();
    }
    fetchLoans();
  }, [token]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        return showMessage('error', 'Erro inesperado do servidor (não JSON)');
      }

      const data = await res.json();
      
      if (!res.ok) {
        return showMessage('error', data.error || 'Erro ao realizar login');
      }
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.unit && data.user.unit !== 'Todas') {
        setSelectedUnit(data.user.unit);
      }
      
      setView('dashboard');
    } catch (e: any) {
      showMessage('error', 'Erro ao conectar ao servidor');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSelectedUnit('PORTO');
    setSelectedCategory(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('home');
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      showMessage('error', 'As senhas não coincidem');
      return;
    }

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        showMessage('success', 'Senha alterada com sucesso');
        setShowPasswordModal(false);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao alterar senha');
      }
    } catch (e: any) {
      showMessage('error', e.message);
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const departments = formData.getAll('departments');
    const payload = {
      ...Object.fromEntries(formData.entries()),
      departments
    };
    delete (payload as any).departments; // Remove the single entry if it exists
    (payload as any).departments = departments;
    
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      fetchUsers();
      setShowAddUsersForm(false);
      showMessage('success', 'Usuário criado com sucesso');
    } else {
      const data = await res.json();
      showMessage('error', data.error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchUsers();
    showMessage('success', 'Usuário excluído');
  };

  const updateStatus = async (id: string, status: Status) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Falha ao atualizar status');
      
      fetchTickets();
      if (selectedTicket?.id === id) {
        const detailRes = await fetch(`/api/tickets/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailRes.ok) {
          const data = await detailRes.json();
          if (data && data.id) setSelectedTicket(data);
        }
      }
      showMessage('success', 'Status atualizado');
    } catch (e) {
      showMessage('error', 'Erro ao atualizar status');
    }
  };

  const updatePriority = async (id: string, priority: Priority) => {
    try {
      const res = await fetch(`/api/tickets/${id}/priority`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priority })
      });
      
      if (!res.ok) throw new Error('Falha ao atualizar prioridade');
      
      fetchTickets();
      if (selectedTicket?.id === id) {
        const detailRes = await fetch(`/api/tickets/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailRes.ok) {
          const data = await detailRes.json();
          if (data && data.id) setSelectedTicket(data);
        }
      }
      showMessage('success', 'Prioridade atualizada');
    } catch (e) {
      showMessage('error', 'Erro ao atualizar prioridade');
    }
  };

  const assignToMe = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${id}/assign`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ technician_id: user.id })
      });
      
      if (!res.ok) throw new Error('Falha ao atribuir chamado');
      
      fetchTickets();
      if (selectedTicket?.id === id) {
        const detailRes = await fetch(`/api/tickets/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailRes.ok) {
          const data = await detailRes.json();
          if (data && data.id) setSelectedTicket(data);
        }
      }
      showMessage('success', 'Chamado atribuído a você');
    } catch (e) {
      showMessage('error', 'Erro ao atribuir chamado');
    }
  };

  const addComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTicket) return;
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message');
    
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      
      if (res.ok) {
        const detailRes = await fetch(`/api/tickets/${selectedTicket.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailRes.ok) {
          const data = await detailRes.json();
          if (data && data.id) setSelectedTicket(data);
        }
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Falha ao adicionar comentário');
      }
    } catch (e) {
      showMessage('error', 'Erro ao adicionar comentário');
    }
  };

  // --- Views ---

  const HomeView = () => {
    const buttons = [
      { id: 'TI', label: 'TI', icon: Cpu, color: 'bg-blue-600' },
      { id: 'Limpeza', label: 'Limpeza', icon: Brush, color: 'bg-emerald-600' },
      { id: 'Manutenção', label: 'Manutenção', icon: Wrench, color: 'bg-amber-600' },
      { id: 'Supervisão', label: 'Supervisão', icon: Briefcase, color: 'bg-violet-600' },
      { id: 'loans-external', label: 'Empréstimos', icon: Monitor, color: 'bg-orange-600', url: 'https://www.google.com' },
      { id: 'scheduling-external', label: 'Agendamento Ambientes', icon: Calendar, color: 'bg-slate-700', url: 'https://chavesporto.vercel.app' },
      { id: 'class-panel-external', label: 'Painel de Aulas', icon: BookOpen, color: 'bg-indigo-600', url: 'https://chavesporto.vercel.app/painel' },
      { id: 'ticket-tracking', label: 'Acompanhamento', icon: Search, color: 'bg-teal-600' },
      { id: 'useful-links', label: 'Links Úteis', icon: Link2, color: 'bg-rose-600' },
    ];

    const handleButtonClick = (id: string) => {
      if (id === 'ticket-tracking') {
        setCreatedTicketId(null);
        setView('ticket-tracking');
      } else if (id === 'useful-links') {
        setView('useful-links');
      } else {
        setSelectedCategory(id as any);
        setView('open-ticket');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl w-full text-center space-y-12 relative z-10"
        >
          <div className="space-y-8">
            <div className="flex items-center justify-center">
              <img 
                src="https://lh3.googleusercontent.com/d/1x_2FRXCBA5T2PDG7JjDx6me8RboCVaj0" 
                alt="Logo 2" 
                className="h-16 md:h-24 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Solicitações Porto</h1>
              <p className="text-slate-500 text-lg font-medium">Selecione o serviço desejado para iniciar sua solicitação</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 xl:gap-6 max-w-4xl mx-auto">
            {buttons.map((btn) => {
              const content = (
                <>
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", btn.color)}>
                    <btn.icon className="w-7 h-7" />
                  </div>
                  <span className={cn(
                    "font-bold text-slate-700 uppercase text-center w-full block break-normal leading-tight whitespace-normal",
                    btn.label.length > 12 
                      ? "text-[9px] sm:text-[10px] md:text-[9px] xl:text-[10px] tracking-tighter" 
                      : btn.label.length > 8 
                        ? "text-[10px] sm:text-[11px] md:text-[10px] xl:text-xs tracking-tight" 
                        : "text-xs tracking-wider"
                  )}>
                    {btn.label}
                  </span>
                </>
              );

              const className = "group relative bg-white p-4 sm:p-5 lg:p-4 lg:px-1 xl:px-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 text-center overflow-hidden h-full w-full";

              if (btn.url) {
                return (
                  <a 
                    key={btn.id}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button 
                  key={btn.id}
                  onClick={() => handleButtonClick(btn.id)} 
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </div>

          <div className="pt-8 border-t border-slate-200">
            <Button onClick={() => setView('login')} variant="ghost" className="h-12 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-6">
              <LogIn className="w-5 h-5" />
              Entrar no Sistema Interno
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  const LoansMenuView = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full space-y-8"
      >
        <Button variant="ghost" onClick={() => setView('home')} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-slate-900">Empréstimos</h2>
          <p className="text-slate-500 text-lg">Selecione o que você deseja fazer.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button 
            onClick={() => setView('loan-request')}
            className="group relative bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all text-left overflow-hidden flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Solicitar Empréstimo</h3>
            <p className="text-slate-500 text-sm">Solicite equipamentos para uso temporário.</p>
          </button>

          <button 
            onClick={() => setView('loan-tracking')}
            className="group relative bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all text-left overflow-hidden flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Acompanhar Empréstimos</h3>
            <p className="text-slate-500 text-sm">Veja o status e assine termos de empréstimo.</p>
          </button>
        </div>
      </motion.div>
    </div>
  );



  const handleOpenLoan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showMessage('success', 'Empréstimo pendente de aprovação.');
        fetchLoans();
        setView('loan-tracking');
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erro ao solicitar empréstimo.');
      }
    } catch (e) {
      showMessage('error', 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const LoanRequestView = () => (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView('loans-menu')} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        
        <Card className="p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Solicitar Empréstimo</h2>
            <p className="text-slate-500">Preencha os detalhes do equipamento que você precisa.</p>
          </div>

          <form onSubmit={handleOpenLoan} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Nome Completo" name="requester_name" required />
              <Input label="Matrícula" name="registration" required />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Número de Telefone" name="phone" required />
              <Input label="Equipamento" name="equipment" required />
            </div>
            <Input label="Local onde será utilizado" name="location" required />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Motivo da solicitação</label>
              <textarea 
                name="reason"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-14 text-lg">
              {loading ? 'Enviando...' : 'Solicitar Empréstimo'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );

  const [loanPin, setLoanPin] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);

  const handleSignLoan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      pin: loanPin,
      signature_name: formData.get('signature_name'),
      signature_registration: formData.get('signature_registration'),
      signature_date: formData.get('signature_date')
    };
    
    try {
      const res = await fetch(`/api/loans/${selectedLoan.id}/sign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showMessage('success', 'Empréstimo assinado e liberado com sucesso!');
        setShowSignModal(false);
        setLoanPin('');
        fetchLoans();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Erro ao assinar empréstimo.');
      }
    } catch (e) {
      showMessage('error', 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const LoanTrackingView = () => (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView('loans-menu')} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Acompanhar Empréstimos</h2>
          <p className="text-slate-500">Veja o status dos seus empréstimos e assine os termos quando autorizado.</p>
        </div>

        <div className="grid gap-4">
          {loans.filter(l => l.status !== 'concluido').map(loan => (
            <Card key={loan.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{loan.equipment}</h3>
                  <p className="text-slate-500">Solicitante: {loan.requester_name}</p>
                </div>
                <Badge className={
                  loan.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                  loan.status === 'autorizado' ? 'bg-blue-100 text-blue-700' :
                  loan.status === 'em_uso' ? 'bg-purple-100 text-purple-700' :
                  'bg-emerald-100 text-emerald-700'
                }>
                  {loan.status === 'em_uso' ? 'EM USO' : loan.status.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
                <p><strong>Local:</strong> {loan.location}</p>
                <p><strong>Data:</strong> {new Date(loan.created_at).toLocaleDateString()}</p>
              </div>
              
              {loan.status === 'autorizado' && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center space-y-4">
                  <p className="text-blue-800 font-medium text-center">Este empréstimo foi autorizado. Insira a senha fornecida pelo TI/ADM para assinar o termo e liberar o equipamento.</p>
                  <div className="flex gap-2 w-full max-w-xs">
                    <input 
                      type="text" 
                      placeholder="Senha (4 dígitos)" 
                      className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-center font-mono text-lg tracking-widest"
                      value={loanPin}
                      onChange={e => setLoanPin(e.target.value)}
                      maxLength={4}
                    />
                    <Button 
                      onClick={() => {
                        if (loanPin.length === 4) {
                          setSelectedLoan(loan);
                          setShowSignModal(true);
                        } else {
                          showMessage('error', 'A senha deve ter 4 dígitos.');
                        }
                      }}
                    >
                      Validar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {loans.filter(l => l.status !== 'concluido').length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Nenhum empréstimo ativo no momento.
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {showSignModal && selectedLoan && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl w-full"
            >
              <Card className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-slate-900">Termo de Responsabilidade</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedLoan.terms}
                </div>
                <form onSubmit={handleSignLoan} className="space-y-4">
                  <Input label="Nome Completo" name="signature_name" defaultValue={selectedLoan.requester_name} required />
                  <Input label="Matrícula" name="signature_registration" defaultValue={selectedLoan.registration} required />
                  <Input label="Data" name="signature_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowSignModal(false)}>Cancelar</Button>
                    <Button type="submit" className="flex-1">Assinar e Liberar</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );







  const TicketSuccessView = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 space-y-8"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">Solicitação Enviada!</h2>
          {createdTicketId && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">Número do seu chamado</p>
              <p className="text-3xl font-black text-blue-700">#{createdTicketId}</p>
              <p className="text-xs text-blue-500 mt-2">Guarde este número para acompanhar sua solicitação</p>
            </div>
          )}
          <div className="flex justify-center gap-2">
            <Badge className="bg-blue-50 text-blue-600 border-blue-100">{selectedUnit}</Badge>
            <Badge className="bg-slate-50 text-slate-600 border-slate-100">{selectedCategory}</Badge>
          </div>
          <div className="space-y-2 text-slate-600">
            <p className="font-medium">Tempo de reposta para a solicitação é de 2h.</p>
            <p className="text-sm">Para resolução do Problema o tempo é de 24 a 48 hrs a depender da complexidade.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => {
              setView('ticket-tracking');
            }} 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
          >
            Acompanhar Chamado
          </Button>
          <Button 
            onClick={() => {
              setSelectedCategory(null);
              setCreatedTicketId(null);
              setView('home');
            }} 
            variant="outline"
            className="w-full h-12 rounded-xl font-bold transition-all"
          >
            Sair
          </Button>
        </div>
      </motion.div>
    </div>
  );



  const LoginView = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Acesso Restrito</h2>
          <p className="text-slate-500">Entre com suas credenciais de técnico ou admin.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input label="Usuário / Email" name="email" required />
          <Input label="Senha" name="password" type="password" required />
          <Button type="submit" className="w-full h-12">Entrar</Button>
          <Button type="button" variant="ghost" onClick={() => setView('home')} className="w-full">Voltar</Button>
        </form>
      </Card>
    </div>
  );

  const handleTicketClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView('ticket-detail');
    
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fullTicket = await res.json();
        if (fullTicket && fullTicket.id) setSelectedTicket(fullTicket);
      }
    } catch (e) {
      console.error("Error fetching ticket details:", e);
    }
  };

  const SidebarWrapper = () => (
    <Sidebar 
      view={view} 
      setView={setView} 
      user={user} 
      setShowPasswordModal={setShowPasswordModal} 
      handleLogout={handleLogout} 
    />
  );

  const LoansDashboardView = () => {
    const handleAuthorize = async () => {
      if (!selectedLoan) return;
      try {
        const res = await fetch(`/api/loans/${selectedLoan.id}/authorize`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ terms: authTerms })
        });
        if (res.ok) {
          const data = await res.json();
          showMessage('success', `Empréstimo autorizado! PIN: ${data.pin}`);
          setShowAuthModal(false);
          setAuthTerms('');
          fetchLoans();
        }
      } catch (e) {
        showMessage('error', 'Erro ao autorizar.');
      }
    };

    const handleComplete = async () => {
      if (!selectedLoan) return;
      try {
        const res = await fetch(`/api/loans/${selectedLoan.id}/complete`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ return_condition: returnCondition, return_problem: returnProblem })
        });
        if (res.ok) {
          showMessage('success', 'Empréstimo concluído com sucesso!');
          setShowCompleteModal(false);
          setReturnCondition('sim');
          setReturnProblem('');
          fetchLoans();
        }
      } catch (e) {
        showMessage('error', 'Erro ao concluir.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarWrapper />
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestão de Empréstimos</h1>
              <p className="text-slate-500">Autorize solicitações e gerencie devoluções.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setLoanTab('ativos')}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", loanTab === 'ativos' ? "bg-blue-600 text-white" : "text-slate-500")}
              >
                Ativos
              </button>
              <button 
                onClick={() => setLoanTab('concluidos')}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", loanTab === 'concluidos' ? "bg-blue-600 text-white" : "text-slate-500")}
              >
                Concluídos
              </button>
            </div>
          </header>
          
          {loanTab === 'ativos' && loans.some(l => l.status !== 'concluido' && (new Date().getTime() - new Date(l.created_at).getTime()) > (24 * 60 * 60 * 1000)) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-700 shadow-sm"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Atenção: Empréstimos Atrasados</h4>
                <p className="text-sm opacity-90">Existem empréstimos ativos há mais de 24 horas que ainda não foram concluídos.</p>
              </div>
            </motion.div>
          )}

          <div className="grid gap-4">
            {loans.filter(l => loanTab === 'ativos' ? l.status !== 'concluido' : l.status === 'concluido').map(loan => {
              const createdDate = new Date(loan.created_at).getTime();
              const now = new Date().getTime();
              const isOverdue = loan.status !== 'concluido' && (now - createdDate) > (24 * 60 * 60 * 1000);

              return (
                <Card key={loan.id} className={cn("p-6 transition-all", isOverdue && "border-red-500 bg-red-50/30 shadow-lg shadow-red-100")}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-slate-900">{loan.equipment}</h3>
                        {isOverdue && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            <AlertCircle className="w-3 h-3 mr-1" /> ATRASADO (+24h)
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500">Solicitante: {loan.requester_name} ({loan.registration})</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={
                        loan.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                        loan.status === 'autorizado' ? 'bg-blue-100 text-blue-700' :
                        loan.status === 'em_uso' ? 'bg-purple-100 text-purple-700' :
                        loan.status === 'liberado' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {loan.status === 'em_uso' ? 'EM USO' : loan.status.toUpperCase()}
                      </Badge>
                      {loan.pin && loan.status === 'autorizado' && (
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-mono font-bold text-lg shadow-lg shadow-blue-200">
                          PIN: {loan.pin}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600 mb-6">
                    <p><strong>Local:</strong> {loan.location}</p>
                    <p><strong>Motivo:</strong> {loan.reason}</p>
                    <p><strong>Solicitado em:</strong> {new Date(loan.created_at).toLocaleString()}</p>
                  </div>
  
                  {loanTab === 'ativos' && (
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      {loan.status === 'pendente' && (
                        <Button onClick={() => { setSelectedLoan(loan); setShowAuthModal(true); }}>
                          Autorizar Empréstimo
                        </Button>
                      )}
                      {(loan.status === 'liberado' || loan.status === 'autorizado' || loan.status === 'em_uso') && (
                        <Button variant="secondary" onClick={() => { setSelectedLoan(loan); setShowCompleteModal(true); }}>
                          Concluir Empréstimo
                        </Button>
                      )}
                    </div>
                  )}

                {loanTab === 'concluidos' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-sm"><strong>Concluído por:</strong> {loan.completed_by}</p>
                    <p className="text-sm"><strong>Estado de devolução:</strong> {loan.return_condition === 'sim' ? 'Perfeito' : 'Com Problemas'}</p>
                    {loan.return_problem && <p className="text-sm text-red-600"><strong>Problema:</strong> {loan.return_problem}</p>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        </main>

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-md w-full">
                <Card className="p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">Autorizar Empréstimo</h3>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Termos do Empréstimo (Obrigatório)</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100"
                      value={authTerms}
                      onChange={e => setAuthTerms(e.target.value)}
                      placeholder="Descreva as condições e responsabilidades..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowAuthModal(false)}>Cancelar</Button>
                    <Button className="flex-1" disabled={!authTerms} onClick={handleAuthorize}>Autorizar</Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Complete Modal */}
        <AnimatePresence>
          {showCompleteModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-md w-full">
                <Card className="p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">Concluir Empréstimo</h3>
                  <p className="text-slate-600">O equipamento foi devolvido no mesmo estado que foi entregue?</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setReturnCondition('sim')}
                      className={cn("flex-1 py-3 rounded-xl border-2 font-bold transition-all", returnCondition === 'sim' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "border-slate-100 text-slate-400")}
                    >
                      SIM
                    </button>
                    <button 
                      onClick={() => setReturnCondition('nao')}
                      className={cn("flex-1 py-3 rounded-xl border-2 font-bold transition-all", returnCondition === 'nao' ? "bg-red-50 border-red-500 text-red-700" : "border-slate-100 text-slate-400")}
                    >
                      NÃO
                    </button>
                  </div>
                  {returnCondition === 'nao' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Descreva o problema</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                        value={returnProblem}
                        onChange={e => setReturnProblem(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowCompleteModal(false)}>Cancelar</Button>
                    <Button className="flex-1" onClick={handleComplete}>Concluir</Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };



  const DashboardView = () => {


    const filteredTickets = tickets.filter(t => {
      const matchesSearch = 
        (t.equipment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.adm_sector?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.requester_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.numeric_id?.toString() || t.id?.toString() || '').includes(searchTerm);
      
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' ? t.status !== 'concluido' : t.status === filterStatus;
      const matchesUnit = t.unit === selectedUnit;
      
      const matchesCategory = 
        filterCategory === 'all'
          ? (user?.role === 'admin' 
              ? true 
              : user?.role === 'gestor' 
                ? t.category === 'Supervisão' 
                : user?.departments?.includes(t.category as any))
          : t.category === filterCategory;

      return matchesSearch && matchesPriority && matchesStatus && matchesUnit && matchesCategory;
    });
    
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarWrapper />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Fila de Chamados - {selectedUnit}</h1>
              <p className="text-slate-500">Gerencie as solicitações em aberto e pendentes.</p>
            </div>
            <div className="flex items-center gap-3">
              {(user?.role === 'admin' || user?.unit === 'Todas') && (
                <Button variant="secondary" onClick={() => setSelectedUnit(null)} className="h-10">
                  Trocar Unidade
                </Button>
              )}
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Buscar chamado..." 
                  className="outline-none text-sm bg-transparent w-full md:w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto">
              {user?.role === 'admin' || user?.role === 'gestor' ? (
                (user.role === 'admin' 
                  ? ['all', 'TI', 'Manutenção', 'Limpeza', 'Supervisão'] 
                  : ['all', 'Supervisão']
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as any)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                      filterCategory === cat 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))
              ) : (
                <div className="flex gap-1">
                  {user?.departments?.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setFilterCategory(dept as any)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                        filterCategory === dept 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select 
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
              >
                <option value="all">Todas Prioridades</option>
                <option value="baixo">Baixo</option>
                <option value="medio">Médio</option>
                <option value="urgente">Urgente</option>
              </select>
              <select 
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Ativos (Não Concluídos)</option>
                <option value="aberto">Abertos</option>
                <option value="pendente">Pendentes</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluido">Concluídos</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTickets.map((ticket) => {
                const activeTime = calculateActiveTime(ticket);
                const isOverdue = activeTime > SLA_MS && ticket.status !== 'concluido';
                
                return (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card 
                      className={cn(
                        "hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group border-slate-200",
                        isOverdue && "bg-red-50 border-red-300 ring-1 ring-red-200"
                      )} 
                      onClick={() => handleTicketClick(ticket)}
                    >
                    <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex items-center gap-4 min-w-[120px]">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-600 border border-slate-100">
                          #{ticket.numeric_id || String(ticket.id).substring(0, 4)}
                        </div>
                        <div className={cn("w-3 h-3 rounded-full", STATUS_COLORS[ticket.status])} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-900 truncate text-lg">
                            {ticket.category === 'ADM' ? `${ticket.adm_sector} - ${ticket.reason?.substring(0, 30)}...` : ticket.equipment}
                          </h3>
                          <Badge className={cn("border", PRIORITY_COLORS[ticket.priority])}>
                            {PRIORITY_LABELS[ticket.priority]}
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] h-5">
                            {ticket.category || 'TI'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-y-2 gap-x-4">
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <User className="w-3.5 h-3.5" /> {ticket.requester_name}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="w-3.5 h-3.5" /> {ticket.category === 'ADM' ? ticket.unit : ticket.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                          <span className={cn(
                            "flex items-center gap-1.5 text-sm font-bold",
                            isOverdue ? "text-red-600" : "text-blue-600"
                          )}>
                            <Timer className="w-3.5 h-3.5" /> {formatSLA(activeTime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                          <p className={cn("font-bold", 
                            ticket.status === 'aberto' ? 'text-emerald-600' : 
                            ticket.status === 'pendente' ? 'text-amber-600' : 
                            'text-blue-600'
                          )}>
                            {STATUS_LABELS[ticket.status]}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            </AnimatePresence>

            {filteredTickets.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">Tudo limpo por aqui!</h3>
                <p className="text-slate-400">Não há chamados pendentes no momento.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  const deleteTicket = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este chamado?')) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showMessage('success', 'Chamado excluído com sucesso!');
        fetchTickets();
        setView('dashboard');
      }
    } catch (e) {
      showMessage('error', 'Erro ao excluir chamado.');
    }
  };

  const TicketDetailView = () => {
    if (!selectedTicket) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Reuse Sidebar or just header for detail */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para Fila
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                      #{selectedTicket.numeric_id || String(selectedTicket.id).substring(0, 4)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedTicket.category === 'ADM' ? selectedTicket.adm_sector : selectedTicket.equipment}
                      </h2>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-500">
                          {selectedTicket.unit} {selectedTicket.category !== 'ADM' && `- ${selectedTicket.location}`}
                        </p>
                        <span className="text-slate-300">•</span>
                        <Badge className={cn("border", PRIORITY_COLORS[selectedTicket.priority])}>
                          {PRIORITY_LABELS[selectedTicket.priority]}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                          {selectedTicket.category || 'TI'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn("text-white px-4 py-1.5 text-xs", STATUS_COLORS[selectedTicket.status])}>
                    {STATUS_LABELS[selectedTicket.status]}
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {['Limpeza', 'Supervisão'].includes(selectedTicket.category) ? 'Motivo da Solicitação' : 'Descrição do Problema'}
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {['Limpeza', 'Supervisão'].includes(selectedTicket.category) ? selectedTicket.reason : selectedTicket.description}
                    </p>
                  </div>

                  {selectedTicket.urgent_explanation && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Explicação da Urgência
                      </h4>
                      <p className="text-red-700 leading-relaxed italic">
                        {selectedTicket.urgent_explanation}
                      </p>
                    </div>
                  )}

                  {selectedTicket.evidenceUrls && selectedTicket.evidenceUrls.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidências Anexadas</h4>
                      <div className="flex flex-wrap gap-4">
                        {selectedTicket.evidenceUrls.map((url, index) => {
                          const token = localStorage.getItem('token');
                          const proxyUrl = `/api/files?url=${encodeURIComponent(url)}&token=${token}`;
                          return (
                            <a 
                              key={index} 
                              href={proxyUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-blue-600"
                            >
                              <FileText className="w-4 h-4" />
                              Anexo {index + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Solicitante</h4>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> {selectedTicket.requester_name}</p>
                        {selectedTicket.registration && (
                          <p className="text-sm text-slate-500 flex items-center gap-2"><Hash className="w-4 h-4 text-slate-400" /> Matrícula: {selectedTicket.registration}</p>
                        )}
                        {selectedTicket.email && (
                          <p className="text-sm text-slate-500 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {selectedTicket.email}</p>
                        )}
                        <p className="text-sm text-slate-500 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selectedTicket.phone}</p>
                      </div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Atendimento</h4>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-slate-400" /> 
                          {selectedTicket.technician_name || 'Não atribuído'}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Timer className="w-4 h-4 text-slate-400" /> 
                          Tempo: {formatDuration(selectedTicket.total_time_ms)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Comments Section */}
              <Card className="p-8 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" /> Histórico e Comentários
                </h3>

                <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                  {selectedTicket.comments?.map((comment) => (
                    <div key={comment.id} className={cn(
                      "p-4 rounded-2xl",
                      comment.author_role === 'admin' ? "bg-blue-50 border border-blue-100 ml-8" : "bg-slate-50 border border-slate-100 mr-8"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900">{comment.author_name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.message}</p>
                    </div>
                  ))}
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                    <p className="text-center py-10 text-slate-400 italic">Nenhum comentário ainda.</p>
                  )}
                </div>

                <form onSubmit={addComment} className="flex gap-2 pt-4 border-t border-slate-100">
                  <input 
                    name="message"
                    required
                    placeholder="Escreva um comentário ou atualização..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none transition-all"
                  />
                  <Button type="submit">Enviar</Button>
                </form>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 space-y-6">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Ações Rápidas</h3>
                
                <div className="space-y-3">
                  {!selectedTicket.assigned_technician_id ? (
                    <Button onClick={() => assignToMe(selectedTicket.id)} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100">
                      <CheckCircle2 className="w-5 h-5" /> Assumir este Chamado
                    </Button>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-blue-400 uppercase">Atribuído a</p>
                        <p className="font-bold text-blue-900">{selectedTicket.technician_name}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridade</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => updatePriority(selectedTicket.id, 'baixo')}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all",
                          selectedTicket.priority === 'baixo' ? PRIORITY_COLORS.baixo : "bg-white text-slate-400 border-slate-100"
                        )}
                      >
                        Baixo
                      </button>
                      <button 
                        onClick={() => updatePriority(selectedTicket.id, 'medio')}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all",
                          selectedTicket.priority === 'medio' ? PRIORITY_COLORS.medio : "bg-white text-slate-400 border-slate-100"
                        )}
                      >
                        Médio
                      </button>
                      <button 
                        onClick={() => updatePriority(selectedTicket.id, 'urgente')}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all",
                          selectedTicket.priority === 'urgente' ? PRIORITY_COLORS.urgente : "bg-white text-slate-400 border-slate-100"
                        )}
                      >
                        Urgente
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alterar Status</p>
                    <div className="grid gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => updateStatus(selectedTicket.id, 'em_atendimento')}
                        className={cn("justify-start", selectedTicket.status === 'em_atendimento' && "bg-blue-50 border-blue-200 text-blue-600")}
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Em Atendimento
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => updateStatus(selectedTicket.id, 'pendente')}
                        className={cn("justify-start", selectedTicket.status === 'pendente' && "bg-amber-50 border-amber-200 text-amber-600")}
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-500" /> Pendente
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => updateStatus(selectedTicket.id, 'concluido')}
                        className="justify-start hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Concluir Chamado
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={cn(
                "p-6 text-white transition-colors duration-500",
                calculateActiveTime(selectedTicket) > SLA_MS ? "bg-red-600" : "bg-blue-600"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <Timer className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Tempo de SLA</h3>
                </div>
                <p className="text-3xl font-black tracking-tighter mb-1">
                  {formatSLA(calculateActiveTime(selectedTicket))}
                </p>
                <p className={cn(
                  "text-xs font-medium",
                  calculateActiveTime(selectedTicket) > SLA_MS ? "text-red-100" : "text-blue-200"
                )}>
                  {calculateActiveTime(selectedTicket) > SLA_MS ? "SLA Excedido" : "Tempo restante para atendimento"}
                </p>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  };

  const UsersView = () => {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarWrapper />

        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestão de Usuários</h1>
              <p className="text-slate-500">Adicione ou remova técnicos do sistema.</p>
            </div>
            <Button onClick={() => setShowAddUsersForm(true)}><PlusCircle className="w-4 h-4" /> Novo Técnico</Button>
          </header>

          <div className="grid gap-4">
            {Array.isArray(usersList) && usersList.map(u => (
              <Card key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {u.name ? u.name[0] : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    {u.departments && (
                      <div className="flex gap-1 mt-1">
                        {u.departments.map(d => (
                          <span key={d} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold uppercase">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {u.unit && (
                    <Badge className="bg-slate-100 text-slate-700">
                      {u.unit}
                    </Badge>
                  )}
                  <Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                    {u.role}
                  </Badge>
                  {u.email !== 'admin' && (
                    <Button variant="ghost" onClick={() => deleteUser(u.id)} className="text-red-500 hover:bg-red-50">Excluir</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Add User Modal */}
          <AnimatePresence>
            {showAddUsersForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-md w-full"
                >
                  <Card className="p-8 space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900">Novo Usuário</h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <Input label="Nome Completo" name="name" required />
                      <Input label="Email / Usuário" name="email" required />
                      <Input label="Senha" name="password" type="password" required />
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Perfil</label>
                        <select name="role" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                          <option value="tecnico">Técnico</option>
                          <option value="admin">Administrador</option>
                          <option value="assistente">Assistente</option>
                          <option value="estagiario">Estagiário</option>
                          <option value="gestor">Gestor</option>
                          <option value="analista">Analista</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Unidade</label>
                        <select name="unit" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                          <option value="PORTO">Porto</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Setores (Selecione um ou mais)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['TI', 'Manutenção', 'Limpeza', 'Supervisão'].map(dept => (
                            <label key={dept} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                              <input type="checkbox" name="departments" value={dept} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm font-bold text-slate-700">{dept}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddUsersForm(false)}>Cancelar</Button>
                        <Button type="submit" className="flex-1">Criar</Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  };

  return (
    <div className="font-sans text-slate-900">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {HomeView()}
            </motion.div>
          )}

          {view === 'open-ticket' && (
            <motion.div key="open-ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OpenTicketView 
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                selectedCategory={selectedCategory}
                setView={setView}
                showMessage={showMessage}
                loading={loading}
                setLoading={setLoading}
                setCreatedTicketId={setCreatedTicketId}
              />
            </motion.div>
          )}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {LoginView()}
            </motion.div>
          )}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {DashboardView()}
            </motion.div>
          )}
          {view === 'ticket-detail' && (
            <motion.div key="ticket-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {TicketDetailView()}
            </motion.div>
          )}
          {view === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {UsersView()}
            </motion.div>
          )}
          {view === 'loans-dashboard' && (
            <motion.div key="loans-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {LoansDashboardView()}
            </motion.div>
          )}

          {view === 'ticket-success' && (
            <motion.div key="ticket-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {TicketSuccessView()}
            </motion.div>
          )}
          {view === 'ticket-tracking' && (
            <motion.div key="ticket-tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TicketTrackingView 
                createdTicketId={createdTicketId}
                setCreatedTicketId={setCreatedTicketId}
                setView={setView}
                showMessage={showMessage}
                selectedUnit={selectedUnit}
              />
            </motion.div>
          )}

          {view === 'loans-menu' && (
            <motion.div key="loans-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {LoansMenuView()}
            </motion.div>
          )}

          {view === 'loan-request' && (
            <motion.div key="loan-request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {LoanRequestView()}
            </motion.div>
          )}
          {view === 'loan-tracking' && (
            <motion.div key="loan-tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {LoanTrackingView()}
            </motion.div>
          )}

          {view === 'useful-links' && (
            <motion.div key="useful-links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UsefulLinksView setView={setView} />
            </motion.div>
          )}
        </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[110]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full"
            >
              <Card className="p-8 space-y-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <Lock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-bold">Alterar Senha</h3>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input label="Senha Atual" name="currentPassword" type="password" required />
                  <Input label="Nova Senha" name="newPassword" type="password" required />
                  <Input label="Confirmar Nova Senha" name="confirmPassword" type="password" required />
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                    <Button type="submit" className="flex-1">Salvar</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100]",
              message.type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
