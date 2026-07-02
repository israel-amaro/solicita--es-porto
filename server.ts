import express from "express";
import { put, del } from '@vercel/blob';
import multer from 'multer';

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  runTransaction,
  arrayUnion
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Firebase Configuration
let firebaseConfig: any = {};
try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  }
} catch (e) {
  console.error("Error loading Firebase config:", e);
}

const isDummyFirebase = !firebaseConfig.projectId || 
                        firebaseConfig.projectId === "remixed-project-id" || 
                        firebaseConfig.projectId === "your-project-id" ||
                        firebaseConfig.projectId === "" ||
                        firebaseConfig.apiKey === "remixed-api-key" ||
                        firebaseConfig.apiKey === "your-api-key";

interface LocalDBData {
  users: any[];
  tickets: any[];
  comments: any[];
  loans: any[];
  counters: { tickets: number };
}

class LocalDatabase {
  private filePath: string;
  private data: LocalDBData;

  constructor() {
    this.filePath = path.join(__dirname, 'data_store.json');
    this.data = {
      users: [],
      tickets: [],
      comments: [],
      loans: [],
      counters: { tickets: 0 }
    };
    this.load();
    this.seedAdminIfNeeded();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.tickets) this.data.tickets = [];
        if (!this.data.comments) this.data.comments = [];
        if (!this.data.loans) this.data.loans = [];
        if (!this.data.counters) this.data.counters = { tickets: 0 };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load local DB:", e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error("Failed to save local DB:", e);
    }
  }

  private seedAdminIfNeeded() {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@2026";
    const hasAdmin = this.data.users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (!hasAdmin) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      this.data.users.push({
        id: "local-admin-id",
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        departments: ["TI", "Manutenção", "ADM"],
        unit: "Todas"
      });
      this.save();
    }
  }

  getUsers() {
    this.load();
    return this.data.users;
  }

  getUser(id: string) {
    this.load();
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string) {
    this.load();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: any) {
    this.load();
    const id = "user_" + Math.random().toString(36).substring(2, 11);
    const newUser = { id, ...user };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: any) {
    this.load();
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return true;
    }
    return false;
  }

  deleteUser(id: string) {
    this.load();
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getTickets() {
    this.load();
    return this.data.tickets;
  }

  getTicket(id: string) {
    this.load();
    return this.data.tickets.find(t => t.id === id || String(t.numeric_id) === String(id));
  }

  addTicket(ticket: any) {
    this.load();
    const id = "ticket_" + Math.random().toString(36).substring(2, 11);
    this.data.counters.tickets = (this.data.counters.tickets || 0) + 1;
    const numeric_id = this.data.counters.tickets;
    const newTicket = { id, numeric_id, ...ticket };
    this.data.tickets.push(newTicket);
    this.save();
    return newTicket;
  }

  updateTicket(id: string, updates: any) {
    this.load();
    const idx = this.data.tickets.findIndex(t => t.id === id || String(t.numeric_id) === String(id));
    if (idx !== -1) {
      this.data.tickets[idx] = { ...this.data.tickets[idx], ...updates };
      this.save();
      return true;
    }
    return false;
  }

  deleteTicket(id: string) {
    this.load();
    const initialLen = this.data.tickets.length;
    this.data.tickets = this.data.tickets.filter(t => t.id !== id && String(t.numeric_id) !== String(id));
    if (this.data.tickets.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getComments(ticket_id: string) {
    this.load();
    return this.data.comments.filter(c => c.ticket_id === ticket_id);
  }

  addComment(comment: any) {
    this.load();
    const id = "comment_" + Math.random().toString(36).substring(2, 11);
    const newComment = { id, ...comment };
    this.data.comments.push(newComment);
    this.save();
    return newComment;
  }

  getLoans() {
    this.load();
    return this.data.loans;
  }

  getLoan(id: string) {
    this.load();
    return this.data.loans.find(l => l.id === id);
  }

  addLoan(loan: any) {
    this.load();
    const id = "loan_" + Math.random().toString(36).substring(2, 11);
    const newLoan = { id, ...loan };
    this.data.loans.push(newLoan);
    this.save();
    return newLoan;
  }

  updateLoan(id: string, updates: any) {
    this.load();
    const idx = this.data.loans.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.data.loans[idx] = { ...this.data.loans[idx], ...updates };
      this.save();
      return true;
    }
    return false;
  }
}

const localDb = new LocalDatabase();

let db: any;
try {
  if (firebaseConfig.projectId && !isDummyFirebase) {
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase initialized for project:", firebaseConfig.projectId);
  } else {
    console.warn("Firebase Project ID is missing or is dummy. Local Database fallback enabled.");
  }
} catch (e) {
  console.error("Firebase initialization failed, enabling Local Database fallback:", e);
}

const app = express();
app.use(express.json());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

const upload = multer({ storage: multer.memoryStorage() });

// --- API Routes ---

app.get("/api/files", authenticate, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: "No url provided" });
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch file" });
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("File proxy error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload Route
app.post("/api/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    const blob = await put(`tickets/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
      access: 'private'
    });
    
    res.json({ url: blob.url, path: blob.pathname });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/upload", authenticate, async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) return res.status(400).json({ error: "No path provided" });
    
    await del(path);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Public: Open Ticket
app.post("/api/tickets", async (req, res) => {
  const payload = req.body;
  const now = new Date().toISOString();
  
  if (isDummyFirebase) {
    try {
      const ticket = localDb.addTicket({
        ...payload,
        status: 'aberto',
        last_status_change_at: now,
        created_at: now,
        total_time_ms: 0,
        assigned_technician_id: null,
        history: [{
          status: 'aberto',
          changed_at: now,
          changed_by_name: payload.requester_name || "Sistema"
        }]
      });
      return res.json({ id: ticket.id, numeric_id: ticket.numeric_id });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) {
    return res.status(500).json({ error: "Banco de dados não inicializado. Verifique as configurações do Firebase." });
  }

  try {
    const ticketId = await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, "counters", "tickets");
      const counterDoc = await transaction.get(counterRef);
      
      let nextId = 1;
      if (counterDoc.exists()) {
        nextId = (counterDoc.data().lastId || 0) + 1;
      }
      
      transaction.set(counterRef, { lastId: nextId });
      return nextId;
    });

    const docRef = await addDoc(collection(db, "chamados"), {
      ...payload,
      numeric_id: ticketId,
      status: 'aberto',
      last_status_change_at: now,
      created_at: now,
      total_time_ms: 0,
      assigned_technician_id: null,
      history: [{
        status: 'aberto',
        changed_at: now,
        changed_by_name: payload.requester_name || "Sistema"
      }]
    });
    
    res.json({ id: docRef.id, numeric_id: ticketId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/tickets/:id", authenticate, isAdmin, async (req, res) => {
  if (isDummyFirebase) {
    try {
      const ticket = localDb.getTicket(req.params.id);
      if (ticket && ticket.evidenceUrls && ticket.evidenceUrls.length > 0) {
        try {
          await del(ticket.evidenceUrls);
        } catch (error) {
          console.error('Error deleting evidence files from Vercel Blob:', error);
        }
      }
      const deleted = localDb.deleteTicket(req.params.id);
      if (deleted) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: "Chamado não encontrado" });
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const ticketRef = doc(db, "chamados", req.params.id);
    const ticketDoc = await getDoc(ticketRef);
    
    if (ticketDoc.exists()) {
      const ticket = ticketDoc.data();
      if (ticket.evidenceUrls && ticket.evidenceUrls.length > 0) {
        try {
          await del(ticket.evidenceUrls);
        } catch (error) {
          console.error('Error deleting evidence files from Vercel Blob:', error);
        }
      }
    }

    await deleteDoc(ticketRef);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Auth: Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (isDummyFirebase) {
    try {
      const user = localDb.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      const token = jwt.sign({ 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name, 
        departments: user.departments || [], 
        unit: user.unit || "Todas" 
      }, JWT_SECRET);
      return res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          departments: user.departments || [], 
          unit: user.unit || "Todas" 
        } 
      });
    } catch (error: any) {
      console.error("Local login error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (!db) {
    return res.status(500).json({ error: "Banco de dados não inicializado. Verifique as configurações do Firebase." });
  }

  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin";
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@2026";
      const isAdminLogin = (email.toLowerCase() === adminEmail.toLowerCase()) && password === adminPassword;
      
      if (isAdminLogin) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newAdmin = await addDoc(usersCol, {
          name: "Administrador",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          departments: ["TI", "Manutenção", "ADM"],
          unit: "Todas"
        });
        const token = jwt.sign({ id: newAdmin.id, email: adminEmail, role: "admin", name: "Administrador", departments: ["TI", "Manutenção", "ADM"], unit: "Todas" }, JWT_SECRET);
        return res.json({ token, user: { id: newAdmin.id, name: "Administrador", email: adminEmail, role: "admin", departments: ["TI", "Manutenção", "ADM"], unit: "Todas" } });
      }
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    const token = jwt.sign({ id: userDoc.id, email: user.email, role: user.role, name: user.name, departments: user.departments || [user.department] || [], unit: user.unit || "Todas" }, JWT_SECRET);
    res.json({ token, user: { id: userDoc.id, name: user.name, email: user.email, role: user.role, departments: user.departments || [user.department] || [], unit: user.unit || "Todas" } });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Public: Track Ticket
app.get("/api/tickets/track/:id", async (req, res) => {
  if (isDummyFirebase) {
    try {
      const ticket = localDb.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Chamado não encontrado" });
      }
      const ticketCopy = { ...ticket };
      if (ticketCopy.assigned_technician_id) {
        const tech = localDb.getUser(ticketCopy.assigned_technician_id);
        if (tech) {
          ticketCopy.technician_name = tech.name;
        }
      }
      return res.json(ticketCopy);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const id = req.params.id;
    let ticket = null;

    // First try numeric_id
    if (!isNaN(Number(id))) {
      const q = query(collection(db, "chamados"), where("numeric_id", "==", Number(id)));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        ticket = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
    }

    // If not found, try document ID
    if (!ticket) {
      const docRef = doc(db, "chamados", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        ticket = { id: docSnap.id, ...docSnap.data() };
      }
    }

    if (!ticket) {
      return res.status(404).json({ error: "Chamado não encontrado" });
    }

    // Fetch technician name if assigned
    if (ticket.assigned_technician_id) {
      const techDoc = await getDoc(doc(db, "users", ticket.assigned_technician_id));
      if (techDoc.exists()) {
        ticket.technician_name = techDoc.data().name;
      }
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Public: Get Tickets by Unit
app.get("/api/tickets/public", async (req, res) => {
  const { unit } = req.query;
  if (!unit) {
    return res.status(400).json({ error: "Unidade é obrigatória" });
  }

  if (isDummyFirebase) {
    try {
      const tickets = localDb.getTickets()
        .filter((t: any) => t.unit === unit)
        .map((t: any) => {
          const ticketCopy = { ...t };
          if (ticketCopy.assigned_technician_id) {
            const tech = localDb.getUser(ticketCopy.assigned_technician_id);
            if (tech) {
              ticketCopy.technician_name = tech.name;
            }
          }
          return ticketCopy;
        });
      return res.json(tickets);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const q = query(collection(db, "chamados"), where("unit", "==", unit), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    
    let tickets = await Promise.all(querySnapshot.docs.map(async (ticketDoc) => {
      const data = ticketDoc.data();
      let technician_name = null;
      
      if (data.assigned_technician_id) {
        const techDoc = await getDoc(doc(db, "users", data.assigned_technician_id));
        if (techDoc.exists()) {
          technician_name = techDoc.data().name;
        }
      }
      
      return {
        id: ticketDoc.id,
        ...data,
        technician_name
      };
    }));

    res.json(tickets);
  } catch (error: any) {
    // If index is missing, it might throw an error. We can fallback to fetching all and filtering if needed, but let's try this first.
    if (error.message.includes('index')) {
       try {
         const qFallback = query(collection(db, "chamados"), orderBy("created_at", "desc"));
         const querySnapshotFallback = await getDocs(qFallback);
         let ticketsFallback = await Promise.all(querySnapshotFallback.docs.map(async (ticketDoc) => {
            const data = ticketDoc.data();
            let technician_name = null;
            if (data.assigned_technician_id) {
              const techDoc = await getDoc(doc(db, "users", data.assigned_technician_id));
              if (techDoc.exists()) {
                technician_name = techDoc.data().name;
              }
            }
            return { id: ticketDoc.id, ...data, technician_name };
         }));
         ticketsFallback = ticketsFallback.filter((t: any) => t.unit === unit);
         return res.json(ticketsFallback);
       } catch (fallbackError: any) {
         return res.status(400).json({ error: fallbackError.message });
       }
    }
    res.status(400).json({ error: error.message });
  }
});

// Protected: Get Tickets
app.get("/api/tickets", authenticate, async (req, res) => {
  const user = (req as any).user;

  if (isDummyFirebase) {
    try {
      let tickets = localDb.getTickets().map((t: any) => {
        const ticketCopy = { ...t };
        if (ticketCopy.assigned_technician_id) {
          const tech = localDb.getUser(ticketCopy.assigned_technician_id);
          if (tech) {
            ticketCopy.technician_name = tech.name;
          }
        }
        return ticketCopy;
      });

      if (user.role !== 'admin' && user.unit && user.unit !== 'Todas') {
        tickets = tickets.filter((t: any) => t.unit === user.unit);
      }

      // Filtrar categoria "Supervisão": apenas admin e gestor podem visualizar
      tickets = tickets.filter((t: any) => {
        if (t.category === 'Supervisão') {
          return user.role === 'admin' || user.role === 'gestor';
        }
        return true;
      });

      return res.json(tickets);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const q = query(collection(db, "chamados"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    
    let tickets = await Promise.all(querySnapshot.docs.map(async (ticketDoc) => {
      const data = ticketDoc.data();
      let technician_name = null;
      
      if (data.assigned_technician_id) {
        const techDoc = await getDoc(doc(db, "users", data.assigned_technician_id));
        if (techDoc.exists()) {
          technician_name = techDoc.data().name;
        }
      }
      
      return {
        id: ticketDoc.id,
        ...data,
        technician_name
      };
    }));

    if (user.role !== 'admin' && user.unit && user.unit !== 'Todas') {
      tickets = tickets.filter((t: any) => t.unit === user.unit);
    }

    // Filtrar categoria "Supervisão": apenas admin e gestor podem visualizar
    tickets = tickets.filter((t: any) => {
      if (t.category === 'Supervisão') {
        return user.role === 'admin' || user.role === 'gestor';
      }
      return true;
    });

    res.json(tickets);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Change Password
app.patch("/api/users/me/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (isDummyFirebase) {
    try {
      const userId = (req as any).user.id;
      const user = localDb.getUser(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Senha atual incorreta" });
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      localDb.updateUser(userId, { password: hashedPassword });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    const userRef = doc(db, "users", (req as any).user.id);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return res.status(404).json({ error: "Usuário não encontrado" });
    
    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) return res.status(400).json({ error: "Senha atual incorreta" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateDoc(userRef, { password: hashedPassword });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Get Single Ticket
app.get("/api/tickets/:id", authenticate, async (req, res) => {
  if (isDummyFirebase) {
    try {
      const ticket = localDb.getTicket(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });

      const ticketCopy = { ...ticket };
      if (ticketCopy.assigned_technician_id) {
        const tech = localDb.getUser(ticketCopy.assigned_technician_id);
        if (tech) {
          ticketCopy.technician_name = tech.name;
        }
      }

      // Restrição de acesso à categoria "Supervisão"
      if (ticketCopy.category === 'Supervisão' && (req as any).user.role !== 'admin' && (req as any).user.role !== 'gestor') {
        return res.status(403).json({ error: "Acesso negado para esta categoria de chamado" });
      }

      const comments = localDb.getComments(req.params.id)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return res.json({ 
        ...ticketCopy, 
        comments 
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const ticketDoc = await getDoc(doc(db, "chamados", req.params.id));
    if (!ticketDoc.exists()) return res.status(404).json({ error: "Ticket not found" });

    const ticketData = ticketDoc.data();
    let technician_name = null;
    
    if (ticketData.assigned_technician_id) {
      const techDoc = await getDoc(doc(db, "users", ticketData.assigned_technician_id));
      if (techDoc.exists()) {
        technician_name = techDoc.data().name;
      }
    }

    // Restrição de acesso à categoria "Supervisão"
    if (ticketData.category === 'Supervisão' && (req as any).user.role !== 'admin' && (req as any).user.role !== 'gestor') {
      return res.status(403).json({ error: "Acesso negado para esta categoria de chamado" });
    }

    const commentsQuery = query(collection(db, "comments"), where("ticket_id", "==", req.params.id));
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    res.json({ 
      id: ticketDoc.id,
      ...ticketData, 
      technician_name,
      comments 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Update Ticket Status & Time Tracking
app.patch("/api/tickets/:id/status", authenticate, async (req, res) => {
  const { status } = req.body;

  if (isDummyFirebase) {
    try {
      const ticket = localDb.getTicket(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });

      const now = new Date();
      const lastChange = new Date(ticket.last_status_change_at);
      let additionalTime = 0;

      if (ticket.status === 'aberto' || ticket.status === 'em_atendimento') {
        additionalTime = now.getTime() - lastChange.getTime();
      }

      const newTotalTime = (ticket.total_time_ms || 0) + additionalTime;
      const nowISO = now.toISOString();
      const completedAt = status === 'concluido' ? nowISO : (ticket.completed_at || null);

      const history = ticket.history || [];
      history.push({
        status,
        changed_at: nowISO,
        changed_by_name: (req as any).user.name
      });

      const updateData: any = { 
        status, 
        total_time_ms: newTotalTime, 
        last_status_change_at: nowISO, 
        completed_at: completedAt,
        history
      };

      if (status === 'concluido' && ticket.evidenceUrls && ticket.evidenceUrls.length > 0) {
        try {
          await del(ticket.evidenceUrls);
          updateData.evidencePaths = [];
          updateData.evidenceUrls = [];
        } catch (error) {
          console.error('Error deleting evidence files from Vercel Blob:', error);
        }
      }

      localDb.updateTicket(req.params.id, updateData);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    const ticketRef = doc(db, "chamados", req.params.id);
    const ticketDoc = await getDoc(ticketRef);

    if (!ticketDoc.exists()) return res.status(404).json({ error: "Ticket not found" });

    const ticket = ticketDoc.data();
    const now = new Date();
    const lastChange = new Date(ticket.last_status_change_at);
    let additionalTime = 0;

    if (ticket.status === 'aberto' || ticket.status === 'em_atendimento') {
      additionalTime = now.getTime() - lastChange.getTime();
    }

    const newTotalTime = (ticket.total_time_ms || 0) + additionalTime;
    const nowISO = now.toISOString();
    const completedAt = status === 'concluido' ? nowISO : (ticket.completed_at || null);

    const history = ticket.history || [];
    history.push({
      status,
      changed_at: nowISO,
      changed_by_name: (req as any).user.name
    });

    const updateData: any = { 
      status, 
      total_time_ms: newTotalTime, 
      last_status_change_at: nowISO, 
      completed_at: completedAt,
      history
    };

    if (status === 'concluido' && ticket.evidenceUrls && ticket.evidenceUrls.length > 0) {
      try {
        await del(ticket.evidenceUrls);
        updateData.evidencePaths = [];
        updateData.evidenceUrls = [];
      } catch (error) {
        console.error('Error deleting evidence files from Vercel Blob:', error);
      }
    }

    await updateDoc(ticketRef, updateData);

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Assign Technician
app.patch("/api/tickets/:id/assign", authenticate, async (req, res) => {
  const { technician_id } = req.body;

  if (isDummyFirebase) {
    try {
      const updated = localDb.updateTicket(req.params.id, { assigned_technician_id: technician_id });
      if (updated) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: "Ticket not found" });
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    await updateDoc(doc(db, "chamados", req.params.id), { assigned_technician_id: technician_id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Update Priority
app.patch("/api/tickets/:id/priority", authenticate, async (req, res) => {
  const { priority } = req.body;

  if (isDummyFirebase) {
    try {
      const updated = localDb.updateTicket(req.params.id, { priority });
      if (updated) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: "Ticket not found" });
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    await updateDoc(doc(db, "chamados", req.params.id), { priority });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected: Add Comment
app.post("/api/tickets/:id/comments", authenticate, async (req, res) => {
  const { message } = req.body;
  const user = (req as any).user;

  if (isDummyFirebase) {
    try {
      localDb.addComment({ 
        ticket_id: req.params.id, 
        author_name: user.name, 
        author_role: user.role, 
        message,
        created_at: new Date().toISOString()
      });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    await addDoc(collection(db, "comments"), { 
      ticket_id: req.params.id, 
      author_name: user.name, 
      author_role: user.role, 
      message,
      created_at: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/debug/users", async (req, res) => {
  if (isDummyFirebase) {
    return res.json(localDb.getUsers());
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: User Management
app.get("/api/users", authenticate, isAdmin, async (req, res) => {
  if (isDummyFirebase) {
    try {
      const users = localDb.getUsers().map((u: any) => {
        let depts = [];
        if (Array.isArray(u.departments)) {
          depts = u.departments;
        } else if (typeof u.departments === 'string') {
          depts = [u.departments];
        }
        return { id: u.id, name: u.name, email: u.email, role: u.role, departments: depts, unit: u.unit };
      });
      return res.json(users);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(d => {
      const data = d.data();
      console.log("User data:", data);
      let depts = [];
      if (Array.isArray(data.departments)) {
        depts = data.departments;
      } else if (typeof data.departments === 'string') {
        depts = [data.departments];
      } else if (data.department) {
        depts = [data.department];
      }
      return { id: d.id, name: data.name, email: data.email, role: data.role, departments: depts, unit: data.unit };
    });
    console.log("Returning users:", users);
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/users", authenticate, isAdmin, async (req, res) => {
  const { name, email, password, role, departments, unit } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (isDummyFirebase) {
    try {
      const existing = localDb.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      localDb.addUser({ name, email, password: hashedPassword, role, departments: departments || [], unit: unit || "Todas" });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    // Check if email exists
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    await addDoc(collection(db, "users"), { name, email, password: hashedPassword, role, departments: departments || [], unit: unit || "Todas" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/users/:id", authenticate, isAdmin, async (req, res) => {
  if (isDummyFirebase) {
    try {
      const deleted = localDb.deleteUser(req.params.id);
      if (deleted) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    await deleteDoc(doc(db, "users", req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Empréstimos (Loans) ---
app.post("/api/loans", async (req, res) => {
  const { requester_name, registration, phone, equipment, location, reason } = req.body;

  if (isDummyFirebase) {
    try {
      const newLoan = localDb.addLoan({
        requester_name,
        registration,
        phone,
        equipment,
        location,
        reason,
        status: "pendente",
        created_at: new Date().toISOString(),
        logs: []
      });
      return res.json({ success: true, id: newLoan.id });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    const newLoan = await addDoc(collection(db, "loans"), {
      requester_name,
      registration,
      phone,
      equipment,
      location,
      reason,
      status: "pendente",
      created_at: new Date().toISOString(),
      logs: []
    });
    res.json({ success: true, id: newLoan.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/loans", async (req, res) => {
  if (isDummyFirebase) {
    try {
      const loans = localDb.getLoans().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json(loans);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  try {
    const q = query(collection(db, "loans"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const loans = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(loans);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/loans/:id/authorize", authenticate, async (req, res) => {
  const { terms } = req.body;
  const user = (req as any).user;
  
  if (!user.departments?.includes('ADM') && !user.departments?.includes('TI') && user.role !== 'admin') {
    return res.status(403).json({ error: "Acesso negado" });
  }

  if (isDummyFirebase) {
    try {
      const loan = localDb.getLoan(req.params.id);
      if (!loan) return res.status(404).json({ error: "Empréstimo não encontrado" });

      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      const logEntry = {
        action: "Autorizado",
        user: user.name,
        timestamp: new Date().toISOString()
      };
      
      const currentLogs = loan.logs || [];
      localDb.updateLoan(req.params.id, { 
        status: "autorizado",
        terms,
        pin,
        authorized_by: user.name,
        authorized_at: new Date().toISOString(),
        logs: [...currentLogs, logEntry]
      });
      return res.json({ success: true, pin });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });

  try {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const logEntry = {
      action: "Autorizado",
      user: user.name,
      timestamp: new Date().toISOString()
    };
    
    await updateDoc(doc(db, "loans", req.params.id), { 
      status: "autorizado",
      terms,
      pin,
      authorized_by: user.name,
      authorized_at: new Date().toISOString(),
      logs: arrayUnion(logEntry)
    });
    res.json({ success: true, pin });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/loans/:id/sign", async (req, res) => {
  const { pin, signature_name, signature_registration, signature_date } = req.body;

  if (isDummyFirebase) {
    try {
      const loan = localDb.getLoan(req.params.id);
      if (!loan) return res.status(404).json({ error: "Empréstimo não encontrado" });
      
      if (loan.pin !== pin) {
        return res.status(401).json({ error: "Senha inválida" });
      }

      const logEntry = {
        action: "Liberado (Assinado)",
        user: signature_name,
        timestamp: new Date().toISOString()
      };

      const currentLogs = loan.logs || [];
      localDb.updateLoan(req.params.id, { 
        status: "em_uso",
        signature_name,
        signature_registration,
        signature_date,
        released_at: new Date().toISOString(),
        logs: [...currentLogs, logEntry]
      });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    const loanRef = doc(db, "loans", req.params.id);
    const loanSnap = await getDoc(loanRef);
    
    if (!loanSnap.exists()) return res.status(404).json({ error: "Empréstimo não encontrado" });
    const loanData = loanSnap.data();
    
    if (loanData.pin !== pin) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    const logEntry = {
      action: "Liberado (Assinado)",
      user: signature_name,
      timestamp: new Date().toISOString()
    };

    await updateDoc(loanRef, { 
      status: "em_uso",
      signature_name,
      signature_registration,
      signature_date,
      released_at: new Date().toISOString(),
      logs: arrayUnion(logEntry)
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/loans/:id/complete", authenticate, async (req, res) => {
  const { return_condition, return_problem } = req.body;
  const user = (req as any).user;
  
  if (!user.departments?.includes('ADM') && !user.departments?.includes('TI') && user.role !== 'admin') {
    return res.status(403).json({ error: "Acesso negado" });
  }

  if (isDummyFirebase) {
    try {
      const loan = localDb.getLoan(req.params.id);
      if (!loan) return res.status(404).json({ error: "Empréstimo não encontrado" });

      const logEntry = {
        action: "Concluído",
        user: user.name,
        timestamp: new Date().toISOString(),
        details: return_condition === 'nao' ? `Problema: ${return_problem}` : 'Devolvido em perfeito estado'
      };

      const currentLogs = loan.logs || [];
      localDb.updateLoan(req.params.id, { 
        status: "concluido",
        return_condition,
        return_problem: return_problem || null,
        completed_at: new Date().toISOString(),
        completed_by: user.name,
        logs: [...currentLogs, logEntry]
      });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!db) return res.status(500).json({ error: "Banco de dados não inicializado" });
  
  try {
    const logEntry = {
      action: "Concluído",
      user: user.name,
      timestamp: new Date().toISOString(),
      details: return_condition === 'nao' ? `Problema: ${return_problem}` : 'Devolvido em perfeito estado'
    };

    await updateDoc(doc(db, "loans", req.params.id), { 
      status: "concluido",
      return_condition,
      return_problem: return_problem || null,
      completed_at: new Date().toISOString(),
      completed_by: user.name,
      logs: arrayUnion(logEntry)
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});



// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error:", err);
  res.status(500).json({ 
    error: "Erro interno do servidor", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Vite Integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
          res.status(404).send("Frontend build not found.");
        }
      });
    });
  }
}

setupVite().catch(err => console.error("Vite setup failed:", err));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
