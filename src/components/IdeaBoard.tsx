import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, deleteDoc, increment } from 'firebase/firestore';
import { Plus, Users, ArrowRight, ExternalLink, Link as LinkIcon, FileText, Trash2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getGoogleEmbedUrl(url: string) {
  if (!url) return null;
  
  // Google Slides
  const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/);
  if (slidesMatch) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/embed`;
  }
  
  // Google Drive File (Preview mode)
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  
  return null;
}

export function IdeaBoard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.track !== 'DX') return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'ideas'), {
        authorId: profile.uid,
        authorName: profile.displayName,
        title: newTitle,
        description: newDesc,
        driveLink: driveLink,
        status: 'open',
        likesCount: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setDriveLink('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ideas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinIdea = async (idea: any) => {
    if (!profile) return;
    
    try {
      const groupRef = doc(db, 'studyGroups', idea.id);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        if (groupData.members.length >= 5) {
          alert('이 스터디 그룹은 이미 5명이 꽉 찼습니다.');
          return;
        }
        if (!groupData.members.includes(profile.uid)) {
          await updateDoc(groupRef, {
            members: arrayUnion(profile.uid)
          });
        }
      } else {
        await setDoc(groupRef, {
          ideaId: idea.id,
          ideaTitle: idea.title,
          members: [idea.authorId, profile.uid],
          createdAt: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'ideas', idea.id), {
          status: 'matched'
        });
      }
      
      navigate(`/groups/${idea.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `studyGroups/${idea.id}`);
    }
  };

  const handleToggleLike = async (idea: any) => {
    if (!profile) return;
    const ideaRef = doc(db, 'ideas', idea.id);
    const authorRef = doc(db, 'users', idea.authorId);
    const isLiked = idea.likedBy?.includes(profile.uid);
    
    try {
      if (isLiked) {
        await updateDoc(ideaRef, {
          likedBy: arrayRemove(profile.uid),
          likesCount: increment(-1)
        });
        await updateDoc(authorRef, {
          score: increment(-1)
        });
      } else {
        await updateDoc(ideaRef, {
          likedBy: arrayUnion(profile.uid),
          likesCount: increment(1)
        });
        await updateDoc(authorRef, {
          score: increment(1)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ideas/${idea.id}`);
    }
  };

  const confirmDelete = async () => {
    if (!ideaToDelete) return;
    try {
      // Delete the idea
      await deleteDoc(doc(db, 'ideas', ideaToDelete));
      
      // Also delete the associated study group if it exists
      try {
        await deleteDoc(doc(db, 'studyGroups', ideaToDelete));
      } catch (groupError) {
        // Ignore error if group doesn't exist or permission denied
        console.log("Study group deletion skipped or failed:", groupError);
      }
      
      setIdeaToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ideas/${ideaToDelete}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">아이디어 매칭</h1>
          <p className="text-gray-500 mt-2">DX 트랙의 아이디어와 AI 트랙의 기술력을 연결하세요.</p>
        </div>
        {profile?.track === 'DX' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            아이디어 제안
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map(idea => {
          const embedUrl = getGoogleEmbedUrl(idea.driveLink);
          
          return (
          <div key={idea.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden group">
              {embedUrl ? (
                <iframe 
                  src={embedUrl} 
                  className="w-full h-full border-0"
                  title="Presentation Preview"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">자료 링크가 없습니다</span>
                </div>
              )}
              
              {idea.driveLink && (
                <a 
                  href={idea.driveLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors pointer-events-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  원본 보기
                </a>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    idea.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {idea.status === 'open' ? '모집중' : '매칭됨'}
                  </span>
                  <button 
                    onClick={() => handleToggleLike(idea)} 
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${idea.likedBy?.includes(profile?.uid) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm font-medium">{idea.likesCount || 0}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">{idea.authorName} (DX)</span>
                  {idea.authorId === profile?.uid && (
                    <button 
                      onClick={() => setIdeaToDelete(idea.id)} 
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="삭제하기"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{idea.title}</h3>
              <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{idea.description}</p>
              
              <button
                onClick={() => handleJoinIdea(idea)}
                disabled={idea.authorId === profile?.uid}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                  idea.authorId === profile?.uid
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {idea.authorId === profile?.uid ? '내 아이디어' : '스터디 참여하기'}
                {idea.authorId !== profile?.uid && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
          );
        })}
        {ideas.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            아직 등록된 아이디어가 없습니다.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {ideaToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">아이디어 삭제</h2>
            <p className="text-gray-600 mb-6">정말로 이 아이디어를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIdeaToDelete(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">새 아이디어 제안</h2>
            <form onSubmit={handleCreateIdea} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트 제목</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="예: AI 기반 맞춤형 학습 추천 서비스"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">발표 자료 링크 (Google Slides / Drive)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    required
                    value={driveLink}
                    onChange={e => setDriveLink(e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="https://docs.google.com/presentation/d/.../edit"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * 0.7초 자동 스와이핑을 원하시면 <b>Google Slides</b> 링크를 입력해주세요.<br/>
                  * 일반 Google Drive 링크 입력 시 미리보기 화면이 제공됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">아이디어 설명</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="프로젝트의 목적과 필요한 AI 기술을 설명해주세요."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
