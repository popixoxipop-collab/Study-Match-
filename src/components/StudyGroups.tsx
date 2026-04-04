import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Users, MessageSquare } from 'lucide-react';

export function StudyGroups() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'studyGroups'), where('members', 'array-contains', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const myGroups = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setGroups(myGroups);
    });
    
    return () => unsubscribe();
  }, [profile]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">나의 스터디 그룹</h1>
        <p className="text-gray-500 mt-2">참여 중인 프로젝트 스터디 목록입니다. (최대 5명)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <Link 
            key={group.id} 
            to={`/groups/${group.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {group.ideaTitle}
              </h3>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <Users className="w-4 h-4" />
                {group.members?.length || 0}/5
              </div>
            </div>
            
            <div className="flex items-center text-blue-600 font-medium text-sm mt-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              채팅방 입장하기
            </div>
          </Link>
        ))}
        
        {groups.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">참여 중인 스터디가 없습니다</h3>
            <p className="text-gray-500 mb-6">아이디어 매칭 게시판에서 새로운 프로젝트를 찾아보세요.</p>
            <Link 
              to="/ideas" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              아이디어 보러가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
