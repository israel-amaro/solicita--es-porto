/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { cn } from './lib/utils';

// Types
import { UserProfile, Ticket, Loan, Priority, Status, Category } from './types';

// Components
import { Button, Card, Input } from './components/ui';
import { OpenTicketView, TicketTrackingView, UsefulLinksView, LoanRequestView } from './components/PublicViews';
import { HomeView, LoginView, TicketSuccessView, DashboardView, TicketDetailView, UsersView } from './components/InternalViews';
import { LoansDashboardView } from './components/LoansView';

type View =
  | 'home'
  | 'open-ticket'
  | 'login'
  | 'dashboard'
  | 'ticket-detail'
  | 'users'
  | 'ticket-success'
  | 'loans-dashboard'
  | 'ticket-tracking'
  | 'useful-links'
  | 'loan-request';

export default function App() {
  // --- Navigation ---
  const [view, setView] = useState<View>('home');

  // --- Ticket state ---
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('PORTO');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // --- Dashboard filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  // --- Auth ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- Users management ---
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [showAddUsersForm, setShowAddUsersForm] = useState(false);

  // --- Loans ---
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanTab, setLoanTab] = useState<'ativos' | 'concluidos'>('ativos');
  const [authTerms, setAuthTerms] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [returnCondition, setReturnCondition] = useState<'sim' | 'nao'>('sim');
  const [returnProblem, setReturnProblem] = useState('');
  const [createdLoanId, setCreatedLoanId] = useState<string | null>(null);

  // --- UI ---
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SLA timer tick (re-renders once per second when on relevant views)
  const [, setTick] = useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (view === 'dashboard' || view === 'ticket-detail') {
      interval = setInterval(() => setTick(t => t + 1), 1000);
    }
    return () => clearInterval(interval!);
  }, [view]);

  // --- Data fetchers ---
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

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/users?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsersList(data);
      else setUsersList([]);
    } catch (e) {
      console.error("Error fetching users:", e);
      setUsersList([]);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as UserProfile;
        setUser(parsedUser);
        if (parsedUser.role === 'tecnico' && parsedUser.departments?.length) {
          setFilterCategory(parsedUser.departments[0] as Category);
        }
        if (parsedUser.unit && parsedUser.unit !== 'Todas') {
          setSelectedUnit(parsedUser.unit);
        }
      }
      fetchTickets();
    }
    fetchLoans();
  }, [token]);

  useEffect(() => {
    if (view === 'users' && token) fetchUsers();
  }, [view, token]);

  // --- Helpers ---
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const calculateActiveTime = (ticket: Ticket) => {
    let activeTime = ticket.total_time_ms || 0;
    if (ticket.status === 'aberto' || ticket.status === 'em_atendimento') {
      activeTime += Math.max(0, Date.now() - new Date(ticket.last_status_change_at).getTime());
    }
    return activeTime;
  };

  // --- Auth handlers ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return showMessage('error', 'Erro inesperado do servidor (não JSON)');
      }

      const data = await res.json();
      if (!res.ok) return showMessage('error', data.error || 'Erro ao realizar login');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.unit && data.user.unit !== 'Todas') setSelectedUnit(data.user.unit);
      setView('dashboard');
    } catch {
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
        body: JSON.stringify({ currentPassword: formData.get('currentPassword'), newPassword })
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

  // --- User management handlers ---
  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const departments = formData.getAll('departments');
    const payload: any = { ...Object.fromEntries(formData.entries()), departments };

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

  // --- Ticket handlers ---
  const handleTicketClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView('ticket-detail');
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fullTicket = await res.json();
        if (fullTicket?.id) setSelectedTicket(fullTicket);
      }
    } catch (e) {
      console.error("Error fetching ticket details:", e);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Falha ao atualizar status');
      fetchTickets();
      await refreshSelectedTicket(id);
      showMessage('success', 'Status atualizado');
    } catch {
      showMessage('error', 'Erro ao atualizar status');
    }
  };

  const updatePriority = async (id: string, priority: Priority) => {
    try {
      const res = await fetch(`/api/tickets/${id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ priority })
      });
      if (!res.ok) throw new Error('Falha ao atualizar prioridade');
      fetchTickets();
      await refreshSelectedTicket(id);
      showMessage('success', 'Prioridade atualizada');
    } catch {
      showMessage('error', 'Erro ao atualizar prioridade');
    }
  };

  const assignToMe = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ technician_id: user.id })
      });
      if (!res.ok) throw new Error('Falha ao atribuir chamado');
      fetchTickets();
      await refreshSelectedTicket(id);
      showMessage('success', 'Chamado atribuído a você');
    } catch {
      showMessage('error', 'Erro ao atribuir chamado');
    }
  };

  const addComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTicket) return;
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: formData.get('message') })
      });
      if (res.ok) {
        await refreshSelectedTicket(selectedTicket.id);
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Falha ao adicionar comentário');
      }
    } catch {
      showMessage('error', 'Erro ao adicionar comentário');
    }
  };

  /** Re-fetch the currently open ticket after a mutation */
  const refreshSelectedTicket = async (id: string) => {
    if (selectedTicket?.id !== id) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.id) setSelectedTicket(data);
      }
    } catch (e) {
      console.error("Error refreshing ticket:", e);
    }
  };

  // =====================================================================
  // Render
  // =====================================================================
  const motionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className="font-sans text-slate-900">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" {...motionProps}>
            <HomeView
              setView={setView}
              setSelectedCategory={setSelectedCategory}
              setCreatedTicketId={setCreatedTicketId}
            />
          </motion.div>
        )}

        {view === 'open-ticket' && (
          <motion.div key="open-ticket" {...motionProps}>
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
          <motion.div key="login" {...motionProps}>
            <LoginView setView={setView} handleLogin={handleLogin} />
          </motion.div>
        )}

        {view === 'ticket-success' && (
          <motion.div key="ticket-success" {...motionProps}>
            <TicketSuccessView
              createdTicketId={createdTicketId}
              selectedUnit={selectedUnit}
              selectedCategory={selectedCategory}
              setView={setView}
              setSelectedCategory={setSelectedCategory}
              setCreatedTicketId={setCreatedTicketId}
            />
          </motion.div>
        )}

        {view === 'ticket-tracking' && (
          <motion.div key="ticket-tracking" {...motionProps}>
            <TicketTrackingView
              createdTicketId={createdTicketId}
              setCreatedTicketId={setCreatedTicketId}
              setView={setView}
              showMessage={showMessage}
            />
          </motion.div>
        )}

        {view === 'useful-links' && (
          <motion.div key="useful-links" {...motionProps}>
            <UsefulLinksView setView={setView} />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div key="dashboard" {...motionProps}>
            <DashboardView
              view={view}
              setView={setView}
              user={user}
              token={token}
              tickets={tickets}
              selectedUnit={selectedUnit}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              calculateActiveTime={calculateActiveTime}
              handleTicketClick={handleTicketClick}
              setShowPasswordModal={setShowPasswordModal}
              handleLogout={handleLogout}
            />
          </motion.div>
        )}

        {view === 'ticket-detail' && (
          <motion.div key="ticket-detail" {...motionProps}>
            <TicketDetailView
              selectedTicket={selectedTicket}
              token={token}
              setView={setView}
              calculateActiveTime={calculateActiveTime}
              updateStatus={updateStatus}
              updatePriority={updatePriority}
              assignToMe={assignToMe}
              addComment={addComment}
            />
          </motion.div>
        )}

        {view === 'users' && (
          <motion.div key="users" {...motionProps}>
            <UsersView
              view={view}
              setView={setView}
              user={user}
              token={token}
              usersList={usersList}
              showAddUsersForm={showAddUsersForm}
              setShowAddUsersForm={setShowAddUsersForm}
              handleAddUser={handleAddUser}
              deleteUser={deleteUser}
              showMessage={showMessage}
              setShowPasswordModal={setShowPasswordModal}
              handleLogout={handleLogout}
            />
          </motion.div>
        )}

        {view === 'loans-dashboard' && (
          <motion.div key="loans-dashboard" {...motionProps}>
            <LoansDashboardView
              view={view}
              setView={setView}
              user={user}
              token={token}
              loans={loans}
              selectedLoan={selectedLoan}
              setSelectedLoan={setSelectedLoan}
              loanTab={loanTab}
              setLoanTab={setLoanTab}
              authTerms={authTerms}
              setAuthTerms={setAuthTerms}
              showAuthModal={showAuthModal}
              setShowAuthModal={setShowAuthModal}
              showCompleteModal={showCompleteModal}
              setShowCompleteModal={setShowCompleteModal}
              returnCondition={returnCondition}
              setReturnCondition={setReturnCondition}
              returnProblem={returnProblem}
              setReturnProblem={setReturnProblem}
              showMessage={showMessage}
              fetchLoans={fetchLoans}
              setShowPasswordModal={setShowPasswordModal}
              handleLogout={handleLogout}
            />
          </motion.div>
        )}

        {view === 'loan-request' && (
          <motion.div key="loan-request" {...motionProps}>
            <LoanRequestView
              setView={setView}
              showMessage={showMessage}
              setCreatedLoanId={setCreatedLoanId}
            />
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
