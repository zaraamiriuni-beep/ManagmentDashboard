import React, { useState, useMemo } from 'react';
import { mockDepartments, mockActivities } from './mockData';
import { Department, ProjectManager, Project } from './types';
import { 
  LayoutDashboard, Layers, Users, Activity, BarChart3, 
  Search, Sun, Moon, ChevronLeft, ArrowUpRight, ArrowDownRight, 
  Download, Filter, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Flat helper matrices
  const allManagers = useMemo(() => mockDepartments.flatMap(d => d.managers), []);
  const allProjects = useMemo(() => allManagers.flatMap(m => m.projects), []);

  const selectedDept = mockDepartments.find(d => d.id === selectedDeptId);
  const selectedManager = allManagers.find(m => m.id === selectedManagerId);

  // Computed analytical aggregates
  const stats = useMemo(() => {
    const totalProjects = allProjects.length;
    const completed = allProjects.filter(p => p.status === 'completed').length;
    const delayed = allProjects.filter(p => p.status === 'delayed').length;
    const avgScore = allProjects.reduce((acc, p) => acc + p.score, 0) / (totalProjects || 1);
    
    return {
      totalProjects,
      avgScore: Math.round(avgScore),
      totalDepts: mockDepartments.length,
      totalManagers: allManagers.length,
      delayedCount: delayed,
      completionRate: Math.round((completed / (totalProjects || 1)) * 100)
    };
  }, [allProjects, allManagers]);

  // Chart configuration transformer
  const chartData = useMemo(() => {
    return mockDepartments.map(dept => {
      const deptProjects = dept.managers.flatMap(m => m.projects);
      const avgScore = deptProjects.reduce((acc, p) => acc + p.score, 0) / (deptProjects.length || 1);
      return {
        name: dept.name,
        id: dept.id,
        'تعداد پروژه‌ها': deptProjects.length,
        'میانگین امتیاز': deptProjects.length ? Math.round(avgScore) : 0
      };
    });
  }, []);

  // Filter pipeline for projects
  const filteredProjects = useMemo(() => {
    let source = selectedManager ? selectedManager.projects : allProjects;
    return source.filter(p => {
      const matchesSearch = p.title.includes(searchQuery) || p.description.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [selectedManager, allProjects, searchQuery, statusFilter, priorityFilter]);

  const exportToCSV = () => {
    const headers = 'عنوان پروژه,وضعیت,امتیاز,بودجه,پیشرفت\n';
    const rows = filteredProjects.map(p => `${p.title},${p.status},${p.score},${p.budget},${p.progress}%`).join('\n');
    const blob = new Blob([`\ufeff${headers}${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'project_analytics_export.csv');
    link.click();
  };

  return (
    <div className={`min-h-screen font-sans antialiased text-right transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      
      {/* Sticky Header */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur border-b transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'}`}>
        <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>سامانه جامع داشبورد تحلیل مدیریت پروژه‌ها</h1>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>امروز: ۳۰ اردیبهشت ۱۴۰۵</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0">
            <div className="relative w-full max-w-xs">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="جستجو در پروژه‌ها..." 
                className={`w-full pr-9 pl-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-400 text-slate-900 placeholder-slate-600 font-bold'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-800" />
              <img className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60" alt="حساب کاربری" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Navigation Sidebar (Desktop Only) */}
        <aside className={`w-64 max-lg:hidden shrink-0 min-h-[calc(100vh-4rem)] border-l transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-300'}`}>
          <div className="p-4 space-y-1">
            <button onClick={() => { setSelectedDeptId(null); setSelectedManagerId(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${!selectedDeptId ? 'bg-blue-600 text-white' : 'text-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60'}`}>
              <Layers size={18} />
              <span>نمای کل سازمان</span>
            </button>
            <div className={`pt-4 pb-2 px-3 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>دپارتمان‌ها</div>
            {mockDepartments.map((d) => (
              <button 
                key={d.id} 
                onClick={() => { setSelectedDeptId(d.id); setSelectedManagerId(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedDeptId === d.id ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}
              >
                <span>{d.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-900 font-bold'}`}>{d.managers.flatMap(m => m.projects).length}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-hidden">
          
          {/* Breadcrumbs Navigation */}
          <div className={`flex items-center gap-2 text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>
            <span className="cursor-pointer hover:text-blue-600" onClick={() => { setSelectedDeptId(null); setSelectedManagerId(null); }}>سازمان اصلی</span>
            {selectedDept && (
              <>
                <ChevronLeft size={14} className="text-slate-400" />
                <span className="cursor-pointer hover:text-blue-600" onClick={() => { setSelectedDeptId(selectedDept.id); setSelectedManagerId(null); }}>دپارتمان {selectedDept.name}</span>
              </>
            )}
            {selectedManager && (
              <>
                <ChevronLeft size={14} className="text-slate-400" />
                <span className={`${darkMode ? 'text-slate-200' : 'text-slate-900'} font-bold`}>{selectedManager.name}</span>
              </>
            )}
          </div>

          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>پروژه‌های فعال سازمان</span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg"><Layers size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalProjects}</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5" dir="ltr"><ArrowUpRight size={12}/>+12%</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>میانگین امتیاز عملکرد</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg"><Activity size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.avgScore}٪</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5" dir="ltr"><ArrowUpRight size={12}/>+4%</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>نرخ نهایی‌سازی پروژه‌ها</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg"><Users size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.completionRate}٪</span>
                <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-900'}`}>مطلوب</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>پروژه‌های دارای تاخیر</span>
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg"><Activity size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-rose-600">{stats.delayedCount}</span>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5" dir="ltr"><ArrowDownRight size={12}/>-2%</span>
              </div>
            </div>
          </div>

          {/* Interactive Responsive Analytics Chart Block */}
          {!selectedDeptId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-4 sm:p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className="mb-4">
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>نمودار ترکیبی بارگذاری دپارتمان‌ها و شاخص کیفی</h3>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>برای مشاهده مدیران روی ستون‌ها کلیک کنید (در گوشی برای دیدن همه حتماً به چپ/راست بکشید ↔️)</p>
                </div>
                
                {/* Horizontal Scroll Active Layout */}
                <div className="w-full overflow-x-auto pb-4 pt-2 touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="h-80 w-[850px] pr-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} onClick={(state) => { if(state && state.activePayload) { const found = mockDepartments.find(d => d.name === state.activePayload?.[0].payload.name); if(found) setSelectedDeptId(found.id); } }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#cbd5e1'} />
                        <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#0f172a'} fontSize={12} tickLine={true} fontWeight="bold" dy={10} />
                        <YAxis yAxisId="left" stroke="#2563eb" fontSize={12} fontWeight="bold" tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={12} fontWeight="bold" tickLine={false} />
                        <Tooltip contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: '8px', fontWeight: 'bold' }} cursor={{ fill: darkMode ? 'rgba(30,41,59,0.4)' : 'rgba(226,232,240,0.6)' }} />
                        <Bar yAxisId="left" dataKey="تعداد پروژه‌ها" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={38} />
                        <Line yAxisId="right" type="monotone" dataKey="میانگین امتیاز" stroke="#d97706" strokeWidth={4} dot={{ r: 6, fill: '#d97706' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sidebar Recent System Activities */}
              <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <h3 className={`text-base font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>آخرین وقایع و فعالیت سیستم</h3>
                <div className="space-y-4">
                  {mockActivities.map(act => (
                    <div key={act.id} className={`flex gap-3 text-xs border-b pb-3 last:border-none last:pb-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div className="space-y-1">
                        <p className={`font-bold ${darkMode ? 'text-slate-300' : 'text-black'}`}>{act.managerName}</p>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-900 font-medium'}`}>{act.action}: <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-black'}`}>{act.projectTitle}</span></p>
                        <span className="text-[10px] text-slate-500 font-bold block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Department View Grid Layer */}
          {selectedDeptId && !selectedManagerId && (
            <div className={`p-5 sm:p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className={`flex items-center justify-between mb-6 border-b pb-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">دپارتمان {selectedDept?.name}</h2>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>لیست مدیران پروژه فعال و شاخص‌های اختصاصی</p>
                </div>
                <button onClick={() => setSelectedDeptId(null)} className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all ${darkMode ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'}`}>بازگشت به سازمان</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDept?.managers.map(mng => {
                  const mngProjects = mng.projects;
                  const mngAvgScore = Math.round(mngProjects.reduce((acc, p) => acc + p.score, 0) / (mngProjects.length || 1));
                  return (
                    <div key={mng.id} onClick={() => setSelectedManagerId(mng.id)} className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] hover:border-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <img className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/10" src={mng.avatar} alt={mng.name} />
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{mng.name}</h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>{mng.role}</p>
                        </div>
                      </div>
                      <div className={`grid grid-cols-2 gap-2 text-xs border-t pt-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div>
                          <span className={`${darkMode ? 'text-slate-400' : 'text-slate-900 font-medium'}`}>تعداد پروژه‌ها:</span>
                          <span className={`font-bold font-mono block text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{mngProjects.length}</span>
                        </div>
                        <div>
                          <span className={`${darkMode ? 'text-slate-400' : 'text-slate-900 font-medium'}`}>میانگین امتیاز:</span>
                          <span className="font-bold font-mono block text-sm text-amber-500">{mngAvgScore}٪</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {selectedDept?.managers.length === 0 && (
                  <div className={`col-span-full py-12 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-900 font-bold'}`}>هیچ مدیر پروژه‌ای در این دپارتمان تعریف نشده است.</div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Multi-Tier Search Filter Matrix */}
          {(selectedManagerId || !selectedDeptId) && (
            <div className={`p-4 sm:p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 borde
