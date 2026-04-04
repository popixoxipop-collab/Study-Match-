import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { IdeaBoard } from './components/IdeaBoard';
import { StudyGroups } from './components/StudyGroups';
import { ChatRoom } from './components/ChatRoom';
import { Competitions } from './components/Competitions';
import { Layout } from './components/Layout';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  track: 'DX' | 'AI' | null;
  score: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        } else {
          // Create basic profile, track will be null initially
          const newProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            track: null,
            score: 0,
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile as any);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ideas" element={<IdeaBoard />} />
            <Route path="/groups" element={<StudyGroups />} />
            <Route path="/groups/:groupId" element={<ChatRoom />} />
            <Route path="/competitions" element={<Competitions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
