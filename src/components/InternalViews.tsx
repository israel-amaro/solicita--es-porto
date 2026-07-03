// --- Internal Views (requires login) ---

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Timer,
  Clock,
  MapPin,
  User,
  Monitor,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  PlusCircle,
  FileText,
  Hash,
  Cpu,
  Wrench,
  Brush,
  Briefcase,
  Calendar,
  Link2,
  LogIn,
  Lock
} from 'lucide-react';
import { Button, Card, Badge, Input, Sidebar } from './ui';
import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, formatDuration, SLA_MS, formatSLA } from '../lib/utils';
import { Ticket, Priority, Status, Category, UserProfile, Loan } from '../types';

// =====================================================================
// HomeView
// =====================================================================
interface HomeViewProps {
  setView: (view: any) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setCreatedTicketId: (id: string | null) => void;
}

export const HomeView = ({ setView, setSelectedCategory, setCreatedTicketId }: HomeViewProps) => {
  const buttons = [
    { id: 'TI', label: 'TI', icon: Cpu, color: 'bg-blue-600' },
    { id: 'Limpeza', label: 'Limpeza', icon: Brush, color: 'bg-emerald-600' },
    { id: 'Manutenção', label: 'Manutenção', icon: Wrench, color: 'bg-amber-600' },
    { id: 'Supervisão', label: 'Supervisão', icon: Briefcase, color: 'bg-violet-600' },
    { id: 'loans', label: 'Empréstimos', icon: Monitor, color: 'bg-orange-600' },
    { id: 'scheduling-external', label: 'Agendamento Ambientes', icon: Calendar, color: 'bg-slate-700', url: 'https://chavesporto.vercel.app' },
    { id: 'class-panel-external', label: 'Painel de Aulas', icon: Briefcase, color: 'bg-indigo-600', url: 'https://chavesporto.vercel.app/painel' },
    { id: 'ticket-tracking', label: 'Acompanhamento', icon: Search, color: 'bg-teal-600' },
    { id: 'useful-links', label: 'Links Úteis', icon: Link2, color: 'bg-rose-600' },
  ];

  const handleButtonClick = (id: string) => {
    if (id === 'ticket-tracking') {
      setCreatedTicketId(null);
      setView('ticket-tracking');
    } else if (id === 'useful-links') {
      setView('useful-links');
    } else if (id === 'loans') {
      setView('loan-request');
    } else {
      setSelectedCategory(id as Category);
      setView('open-ticket');
    }
  };

  const cardClass = "group relative bg-white p-4 sm:p-5 lg:p-4 lg:px-1 xl:px-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-4 text-center overflow-hidden h-full w-full";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
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

            if ((btn as any).url) {
              return (
                <a key={btn.id} href={(btn as any).url} target="_blank" rel="noopener noreferrer" className={cardClass}>
                  {content}
                </a>
              );
            }

            return (
              <button key={btn.id} onClick={() => handleButtonClick(btn.id)} className={cardClass}>
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

// =====================================================================
// LoginView
// =====================================================================
interface LoginViewProps {
  setView: (view: any) => void;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const LoginView = ({ setView, handleLogin }: LoginViewProps) => (
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

// =====================================================================
// TicketSuccessView
// =====================================================================
interface TicketSuccessViewProps {
  createdTicketId: string | null;
  selectedUnit: string;
  selectedCategory: Category | null;
  setView: (view: any) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setCreatedTicketId: (id: string | null) => void;
}

export const TicketSuccessView = ({
  createdTicketId,
  selectedUnit,
  selectedCategory,
  setView,
  setSelectedCategory,
  setCreatedTicketId,
}: TicketSuccessViewProps) => (
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
          onClick={() => setView('ticket-tracking')}
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

// =====================================================================
// DashboardView
// =====================================================================
interface DashboardViewProps {
  view: string;
  setView: (view: any) => void;
  user: UserProfile | null;
  token: string | null;
  tickets: Ticket[];
  selectedUnit: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPriority: Priority | 'all';
  setFilterPriority: (p: Priority | 'all') => void;
  filterStatus: Status | 'all';
  setFilterStatus: (s: Status | 'all') => void;
  filterCategory: Category | 'all';
  setFilterCategory: (c: Category | 'all') => void;
  calculateActiveTime: (ticket: Ticket) => number;
  handleTicketClick: (ticket: Ticket) => void;
  setShowPasswordModal: (show: boolean) => void;
  handleLogout: () => void;
}

export const DashboardView = ({
  view,
  setView,
  user,
  tickets,
  selectedUnit,
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  calculateActiveTime,
  handleTicketClick,
  setShowPasswordModal,
  handleLogout,
}: DashboardViewProps) => {
  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      (t.equipment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
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
      <Sidebar
        view={view}
        setView={setView}
        user={user}
        setShowPasswordModal={setShowPasswordModal}
        handleLogout={handleLogout}
      />

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Fila de Chamados - {selectedUnit}</h1>
            <p className="text-slate-500">Gerencie as solicitações em aberto e pendentes.</p>
          </div>
          <div className="flex items-center gap-3">
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
                ? (['all', 'TI', 'Manutenção', 'Limpeza', 'Supervisão'] as const)
                : (['all', 'Supervisão'] as const)
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
                          <h3 className="font-bold text-slate-900 truncate text-lg">{ticket.equipment || ticket.reason?.substring(0, 30)}</h3>
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
                            <MapPin className="w-3.5 h-3.5" /> {ticket.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                          <span className={cn("flex items-center gap-1.5 text-sm font-bold", isOverdue ? "text-red-600" : "text-blue-600")}>
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

// =====================================================================
// TicketDetailView
// =====================================================================
interface TicketDetailViewProps {
  selectedTicket: Ticket | null;
  token: string | null;
  setView: (view: any) => void;
  calculateActiveTime: (ticket: Ticket) => number;
  updateStatus: (id: string, status: Status) => void;
  updatePriority: (id: string, priority: Priority) => void;
  assignToMe: (id: string) => void;
  addComment: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const TicketDetailView = ({
  selectedTicket,
  token,
  setView,
  calculateActiveTime,
  updateStatus,
  updatePriority,
  assignToMe,
  addComment,
}: TicketDetailViewProps) => {
  if (!selectedTicket) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
                    <h2 className="text-2xl font-bold text-slate-900">{selectedTicket.equipment}</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-500">{selectedTicket.unit} - {selectedTicket.location}</p>
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
                    {['Limpeza', 'Supervisão'].includes(selectedTicket.category!) ? 'Motivo da Solicitação' : 'Descrição do Problema'}
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {['Limpeza', 'Supervisão'].includes(selectedTicket.category!) ? selectedTicket.reason : selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.urgent_explanation && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Explicação da Urgência
                    </h4>
                    <p className="text-red-700 leading-relaxed italic">{selectedTicket.urgent_explanation}</p>
                  </div>
                )}

                {selectedTicket.evidenceUrls && selectedTicket.evidenceUrls.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidências Anexadas</h4>
                    <div className="flex flex-wrap gap-4">
                      {selectedTicket.evidenceUrls.map((url, index) => {
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
                    {(['baixo', 'medio', 'urgente'] as Priority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => updatePriority(selectedTicket.id, p)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all",
                          selectedTicket.priority === p ? PRIORITY_COLORS[p] : "bg-white text-slate-400 border-slate-100"
                        )}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
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

// =====================================================================
// UsersView
// =====================================================================
interface UsersViewProps {
  view: string;
  setView: (view: any) => void;
  user: UserProfile | null;
  token: string | null;
  usersList: UserProfile[];
  showAddUsersForm: boolean;
  setShowAddUsersForm: (show: boolean) => void;
  handleAddUser: (e: React.FormEvent<HTMLFormElement>) => void;
  deleteUser: (id: string) => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
  setShowPasswordModal: (show: boolean) => void;
  handleLogout: () => void;
}

export const UsersView = ({
  view,
  setView,
  user,
  usersList,
  showAddUsersForm,
  setShowAddUsersForm,
  handleAddUser,
  deleteUser,
  setShowPasswordModal,
  handleLogout,
}: UsersViewProps) => (
  <div className="min-h-screen bg-slate-50 flex">
    <Sidebar
      view={view}
      setView={setView}
      user={user}
      setShowPasswordModal={setShowPasswordModal}
      handleLogout={handleLogout}
    />

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
              {u.unit && <Badge className="bg-slate-100 text-slate-700">{u.unit}</Badge>}
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
                      {(['TI', 'Manutenção', 'Limpeza', 'Supervisão'] as const).map(dept => (
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
