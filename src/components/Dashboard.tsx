import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, ExternalLink, Code, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const { profile, setProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [topDXUsers, setTopDXUsers] = useState<any[]>([]);
  const [topAIUsers, setTopAIUsers] = useState<any[]>([]);
  const [topIdeas, setTopIdeas] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('score', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setTopDXUsers(users.filter(u => u.track === 'DX').slice(0, 5));
      setTopAIUsers(users.filter(u => u.track === 'AI').slice(0, 5));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'ideas'), orderBy('likesCount', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopIdeas(ideas);
    });
    return () => unsubscribe();
  }, []);

  const [itemsToShow, setItemsToShow] = useState(3);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else {
        setItemsToShow(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const maxIndex = Math.max(0, topIdeas.length - itemsToShow);
  const cycle = maxIndex > 0 ? maxIndex * 2 : 1;
  const mod = tick % cycle;
  const currentIndex = maxIndex > 0 ? (mod <= maxIndex ? mod : cycle - mod) : 0;

  const handleTrackSelect = async (track: 'DX' | 'AI') => {
    if (!profile) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), { track });
      setProfile({ ...profile, track });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-2">환영합니다, {profile?.displayName}님!</p>
      </header>

      {!profile?.track && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">트랙을 선택해주세요</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleTrackSelect('DX')}
              disabled={updating}
              className="flex-1 bg-white border-2 border-blue-200 hover:border-blue-500 text-blue-700 font-medium py-4 rounded-xl transition-colors"
            >
              DX 트랙
            </button>
            <button
              onClick={() => handleTrackSelect('AI')}
              disabled={updating}
              className="flex-1 bg-white border-2 border-blue-200 hover:border-blue-500 text-blue-700 font-medium py-4 rounded-xl transition-colors"
            >
              AI 개발자 트랙
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* DX Hall of Fame */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">인기 아이디어 (Top 10)</h2>
            </div>
            
            {topIdeas.length > 0 ? (
              <div className="overflow-hidden -mx-2">
                <motion.div 
                  className="flex"
                  animate={{ x: `-${currentIndex * (100 / itemsToShow)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {topIdeas.map((idea, idx) => (
                    <div 
                      key={idea.id} 
                      className="shrink-0 px-2"
                      style={{ width: `${100 / itemsToShow}%` }}
                    >
                      <div className="h-full border border-gray-100 rounded-lg p-4 bg-gradient-to-b from-yellow-50/50 to-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                          {idx + 1}위
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{idea.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{idea.authorName}</p>
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="text-sm font-bold">{idea.likesCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                아직 등록된 아이디어가 없습니다.
              </div>
            )}
          </div>

          {/* Ranking Board */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">명예의 전당 (개인 점수 랭킹)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* DX Track */}
              <div>
                <div className="bg-blue-50/50 p-3 text-center font-bold text-blue-800 border-b border-gray-200">DX 트랙</div>
                <div className="divide-y divide-gray-100">
                  {topDXUsers.map((user, index) => (
                    <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 text-sm">
                        {index + 1}
                      </div>
                      <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.displayName}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-bold text-blue-600">{user.score} pt</p>
                      </div>
                    </div>
                  ))}
                  {topDXUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">아직 랭킹 데이터가 없습니다.</div>
                  )}
                </div>
              </div>

              {/* AI Track */}
              <div>
                <div className="bg-purple-50/50 p-3 text-center font-bold text-purple-800 border-b border-gray-200">AI 트랙</div>
                <div className="divide-y divide-gray-100">
                  {topAIUsers.map((user, index) => (
                    <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 text-sm">
                        {index + 1}
                      </div>
                      <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.displayName}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-bold text-purple-600">{user.score} pt</p>
                      </div>
                    </div>
                  ))}
                  {topAIUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">아직 랭킹 데이터가 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Colab Link */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Google Colab 연동</h2>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              프로젝트 실습 및 모델 학습을 위해 코랩 환경으로 이동하세요.
            </p>
            <a
              href="https://happy-gratitude-production-1f99.up.railway.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              코랩 열기
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Google Ads Placeholder */}
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 flex flex-col items-center justify-center min-h-[250px] text-center">
            <p className="text-xs text-gray-400 mb-2">Advertisement</p>
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
              Google Ads<br/>(AdSense Integration)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
