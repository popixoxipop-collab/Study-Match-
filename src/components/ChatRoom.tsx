import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { Send, ArrowLeft, Users } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export function ChatRoom() {
  const { groupId } = useParams<{ groupId: string }>();
  const { profile } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupId) return;

    // Fetch group details
    const fetchGroup = async () => {
      const docRef = doc(db, 'studyGroups', groupId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGroup({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchGroup();

    // Listen to messages
    const q = query(
      collection(db, `studyGroups/${groupId}/messages`),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !groupId) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, `studyGroups/${groupId}/messages`), {
        groupId,
        senderId: profile.uid,
        senderName: profile.displayName,
        text,
        createdAt: serverTimestamp()
      });
      
      // Increment user score for participating (AI track only)
      if (profile.track === 'AI') {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          score: increment(1)
        });
      }
      
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `studyGroups/${groupId}/messages`);
    }
  };

  if (!group) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/groups" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{group.ideaTitle}</h2>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Users className="w-3 h-3" />
              {group.members?.length || 0}명 참여중
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === profile?.uid;
          const showName = index === 0 || messages[index - 1].senderId !== msg.senderId;
          
          return (
            <div key={msg.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
              {!isMe && showName && (
                <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</span>
              )}
              <div className={clsx(
                "max-w-[75%] px-4 py-2 rounded-2xl",
                isMe 
                  ? "bg-blue-600 text-white rounded-tr-sm" 
                  : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
              )}>
                <p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 mx-1">
                {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : ''}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
