import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { logout } from '../firebase';
import { Home, Lightbulb, Users, LogOut, Menu, Trophy } from 'lucide-react';
import clsx from 'clsx';

export function Layout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: '대시보드', icon: Home },
    { path: '/ideas', label: '아이디어 매칭', icon: Lightbulb },
    { path: '/groups', label: '스터디 그룹', icon: Users },
    { path: '/competitions', label: '대회', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside 
        className={clsx(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0",
          isSidebarOpen ? "w-full md:w-64" : "w-full md:w-20"
        )}
      >
        <div className={clsx(
          "p-6 border-b border-gray-200 flex items-center",
          isSidebarOpen ? "justify-between" : "justify-between md:justify-center"
        )}>
          <h1 className={clsx(
            "text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden transition-all",
            !isSidebarOpen && "md:hidden"
          )}>
            KT Aivle Match
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className={clsx("p-4 flex-1 overflow-hidden", !isSidebarOpen && "hidden md:block")}>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center rounded-lg text-sm font-medium transition-colors',
                    isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3',
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={clsx("p-4 border-t border-gray-200 overflow-hidden", !isSidebarOpen && "hidden md:block")}>
          <div className={clsx("flex items-center mb-4", isSidebarOpen ? "gap-3 px-2" : "justify-center")}>
            <img 
              src={profile?.photoURL || 'https://via.placeholder.com/40'} 
              alt="Profile" 
              className="w-10 h-10 rounded-full bg-gray-100 shrink-0"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{profile?.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.track ? `${profile.track} 트랙` : '트랙 미설정'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={clsx(
              "w-full flex items-center text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors",
              isSidebarOpen ? "gap-2 px-4 py-2" : "justify-center py-2"
            )}
            title={!isSidebarOpen ? "로그아웃" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap">로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
