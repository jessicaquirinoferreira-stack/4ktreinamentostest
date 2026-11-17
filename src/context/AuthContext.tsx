import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { seedInitialDatabaseIfEmpty } from '../lib/firestoreService';
import type { UserProfile } from '../types';

const ADMIN_EMAILS = new Set(['jessicaq2204@gmail.com', 'admin@x.com']);

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  serverAdminSession: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (name: string, email: string, password: string, cpf?: string) => Promise<User>;
  loginAdminCredentials: (email: string, password: string) => Promise<{ ok: boolean; note?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [serverAdminSession, setServerAdminSession] = useState(false);

  async function syncUserProfile(fbUser: User) {
    try {
      const ref = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(ref);
      const emailLower = (fbUser.email || '').toLowerCase();
      const adminMatch =
        (emailLower === 'jessicaq2204@gmail.com' && fbUser.emailVerified) ||
        emailLower === 'admin@x.com';

      let adminDocExists = false;
      if (fbUser.emailVerified) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
          adminDocExists = adminSnap.exists();
        } catch {
          adminDocExists = false;
        }
      }

      const resolvedIsAdmin = adminMatch || adminDocExists;
      setIsAdmin(resolvedIsAdmin);

      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aluno 4k',
          email: fbUser.email || '',
          role: 'student',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(snap.data() as UserProfile);
      }

      if (resolvedIsAdmin) {
        await seedInitialDatabaseIfEmpty().catch((err) => {
          console.warn('Seed inicial ignorado ou sem permissão:', err);
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
    }
  }

  useEffect(() => {
    testConnection();
    try {
      if (sessionStorage.getItem('4k_admin_auth') === '1') {
        setServerAdminSession(true);
      }
    } catch {
      // ignore storage errors
    }

    fetch('/api/admin/session')
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('application/json') ? r.json() : null))
      .then((d) => {
        if (d?.authenticated) {
          setServerAdminSession(true);
        }
      })
      .catch(() => {});

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await syncUserProfile(fbUser).catch(() => {});
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function loginWithEmail(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  }

  async function registerWithEmail(name: string, email: string, password: string, cpf?: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    const ref = doc(db, 'users', cred.user.uid);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      name: name.trim(),
      email: email.trim(),
      ...(cpf ? { cpf: cpf.trim() } : {}),
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, newProfile);
    setProfile(newProfile);
    return cred.user;
  }

  async function loginAdminCredentials(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanEmail !== 'admin@x.com' || cleanPass !== 'admin4321') {
      throw new Error('E-mail ou senha administrativa incorretos.');
    }

    // Attempt server cookie login when backend API route is reachable
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      if (res.status === 401) {
        throw new Error('E-mail ou senha administrativa incorretos.');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('incorretos')) {
        throw err;
      }
      // Continue with Firebase Auth + session state if API route is unavailable
    }

    setServerAdminSession(true);
    try {
      sessionStorage.setItem('4k_admin_auth', '1');
    } catch {
      // ignore storage errors
    }

    // Also sign in via Firebase Auth so Firestore admin reads/writes work seamlessly
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      return { ok: true };
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          return { ok: true };
        } catch {
          return {
            ok: true,
            note: 'Sessão administrativa ativa. Para persistir alterações no Firestore como admin Firebase, conecte também sua conta Google autorizada ou ative Email/Password no Firebase Console.',
          };
        }
      }
      return {
        ok: true,
        note: 'Sessão administrativa ativa. Conecte sua conta Google autorizada no botão abaixo para sincronizar gravações no Firestore.',
      };
    }
  }

  async function logout() {
    try {
      sessionStorage.removeItem('4k_admin_auth');
    } catch {
      // ignore storage errors
    }
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setServerAdminSession(false);
    setIsAdmin(false);
    await signOut(auth);
  }

  async function refreshProfile() {
    if (auth.currentUser) {
      await syncUserProfile(auth.currentUser);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: isAdmin || serverAdminSession,
        serverAdminSession,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAdminCredentials,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return ctx;
}
