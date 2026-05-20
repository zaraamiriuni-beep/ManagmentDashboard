import React, { useState, useMemo } from 'react';
import { mockDepartments, mockActivities } from './mockData';
import { LayoutDashboard, Layers, Users, Activity, Search, Sun, Moon, ChevronLeft, ArrowUpRight, ArrowDownRight, Download, Filter, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const allManagers = useMemo(() => mockDepartments.flatMap(d => d.managers), []);
  const allProjects = useMemo(() => allManagers.flatMap(m => m.projects), []);

  const selectedDept = mockDepartments.find(d => d.id === selectedDeptId);
  const selectedManager = allManagers.find(m => m.id === selectedManagerId);

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

  const chartData = useMemo(() => {
    return mockDepartments.map(dept => {
      const deptProjects = dept.managers.flatMap(m => m.projects);
      const avgScore = deptProjects.reduce((acc, p) => acc + p.score, 0) / (deptProjects.length || 1);
      return {
        name: dept.name,
        'تعداد پروژه‌ها': deptProjects.length,
        'میانگین امتیاز': deptProjects.length ? Math.round(avgScore) : 0
      };
    });
  }, []);

  const filteredProjects = useMemo(() => {
    let source = selectedManager ? selectedManager.projects : (selectedDept ? selectedDept.managers.flatMap(m => m.projects) : allProjects);
    return source.filter(p => {
      const matchesSearch = p.title.includes(searchQuery) || p.description.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [selectedDept, selectedManager, allProjects, searchQuery, statusFilter, priorityFilter]);

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
    <div className={`min-h-screen font-sans antialiased text-right transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'}`} dir="rtl">
      
      {/* Header */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-300'}`}>
        <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-950'}`}>سامانه جامع داشبورد تحلیل مدیریت پروژه‌ها</h1>
              <p className={`text-xs font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>امروز: ۳۰ اردیبهشت ۱۴۰۵</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0">
            <div className="relative w-full max-w-xs">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="جستجو در پروژه‌ها..." 
                className={`w-full pr-9 pl-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-400 text-slate-950 placeholder-slate-700 font-bold'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-400 bg-slate-200 hover:bg-slate-300 text-slate-950'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className={`w-64 max-lg:hidden shrink-0 min-h-[calc(100vh-4rem)] border-l transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-300'}`}>
          <div className="p-4 space-y-1">
            <button onClick={() => { setSelectedDeptId(null); setSelectedManagerId(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-black transition-all ${!selectedDeptId ? 'bg-blue-600 text-white' : 'text-slate-950 dark:text-slate-400 hover:bg-slate-200'}`}>
              <Layers size={18} />
              <span>نمای کل سازمان</span>
            </button>
            <div className={`pt-4 pb-2 px-3 text-xs font-black uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>دپارتمان‌ها</div>
            {mockDepartments.map((d) => (
              <button 
                key={d.id} 
                onClick={() => { setSelectedDeptId(d.id); setSelectedManagerId(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${selectedDeptId === d.id ? 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-950 dark:text-slate-400 hover:bg-slate-200/50'}`}
              >
                <span>{d.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-300 text-slate-950 font-black'}`}>{d.managers.flatMap(m => m.projects).length}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-hidden">
          
          {/* Breadcrumbs */}
          <div className={`flex items-center gap-2 text-xs font-black ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>
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
                <span className="font-black">{selectedManager.name}</span>
              </>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'پروژه‌های فعال سازمان', val: stats.totalProjects, color: 'text-blue-600', icon: <Layers size={18} /> },
              { title: 'میانگین امتیاز عملکرد', val: `${stats.avgScore}٪`, color: 'text-amber-500', icon: <Activity size={18} /> },
              { title: 'نرخ نهایی‌سازی پروژه‌ها', val: `${stats.completionRate}٪`, color: 'text-emerald-600', icon: <Users size={18} /> },
              { title: 'پروژه‌های دارای تاخیر', val: stats.delayedCount, color: 'text-rose-600', icon: <Activity size={18} /> }
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>{card.title}</span>
                  <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${card.color}`}>{card.icon}</div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`text-2xl font-black font-mono ${darkMode ? 'text-white' : 'text-slate-950'}`}>{card.val}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart & Activity */}
          {!selectedDeptId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-4 sm:p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className="mb-4">
                  <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>نمودار ترکیبی بارگذاری دپارتمان‌ها و شاخص کیفی</h3>
                  <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>برای دپارتمان‌ها روی ستون کلیک کنید (در گوشی برای دیدن بقیه حتماً به چپ و راست بکشید ↔️)</p>
                </div>
                
                {/* Horizontal Scroll Enabled */}
                <div className="w-full overflow-x-auto pb-4 pt-2 touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="h-80 w-[850px] pr-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} onClick={(state) => { if(state && state.activePayload) { const found = mockDepartments.find(d => d.name === state.activePayload?.[0].payload.name); if(found) setSelectedDeptId(found.id); } }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#cbd5e1'} />
                        <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#0f172a'} fontSize={12} tickLine={true} fontWeight="black" dy={10} />
                        <YAxis yAxisId="left" stroke="#2563eb" fontSize={12} fontWeight="bold" tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={12} fontWeight="bold" tickLine={false} />
                        <Tooltip contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: '8px', fontWeight: 'bold' }} />
                        <Bar yAxisId="left" dataKey="تعداد پروژه‌ها" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={38} />
                        <Line yAxisId="right" type="monotone" dataKey="میانگین امتیاز" stroke="#d97706" strokeWidth={4} dot={{ r: 6, fill: '#d97706' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* System Activities */}
              <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <h3 className={`text-base font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-950'}`}>آخرین وقایع و فعالیت سیستم</h3>
                <div className="space-y-4">
                  {mockActivities.map(act => (
                    <div key={act.id} className={`flex gap-3 text-xs border-b pb-3 last:border-none last:pb-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div className="space-y-1">
                        <p className={`font-black ${darkMode ? 'text-slate-300' : 'text-black'}`}>{act.managerName}</p>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-950 font-bold'}`}>{act.action}: <span className={`font-black ${darkMode ? 'text-slate-200' : 'text-black'}`}>{act.projectTitle}</span></p>
                        <span className="text-[10px] text-slate-500 font-bold block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Department View */}
          {selectedDeptId && !selectedManagerId && (
            <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-300 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-blue-600 dark:text-blue-400">دپارتمان {selectedDept?.name}</h2>
                  <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>لیست مدیران پروژه فعال و شاخص‌ها</p>
                </div>
                <button onClick={() => setSelectedDeptId(null)} className={`text-xs font-black px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-200 text-slate-950 border-slate-400 hover:bg-slate-300'}`}>بازگشت به سازمان</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDept?.managers.map(mng => {
                  const mngProjects = mng.projects;
                  const mngAvgScore = Math.round(mngProjects.reduce((acc, p) => acc + p.score, 0) / (mngProjects.length || 1));
                  return (
                    <div key={mng.id} onClick={() => setSelectedManagerId(mng.id)} className={`p-4 rounded-xl border cursor-pointer hover:border-blue-500 transition-all ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <img className="w-11 h-11 rounded-full object-cover" src={mng.avatar} alt={mng.name} />
                        <div>
                          <h4 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>{mng.name}</h4>
                          <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-800'}`}>{mng.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 border-slate-300 dark:border-slate-800">
                        <div>
                          <span className="text-slate-950 dark:text-slate-400 font-bold">تعداد پروژه‌ها:</span>
                          <span className={`font-black font-mono block text-sm ${darkMode ? 'text-white' : 'text-slate-950'}`}>{mngProjects.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-950 dark:text-slate-400 font-bold">میانگین امتیاز:</span>
                          <span className="font-black font-mono block text-sm text-amber-600">{mngAvgScore}٪</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters & Projects List */}
          {(selectedManagerId || !selectedDeptId) && (
            <div className={`p-4 sm:p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-blue-500" />
                    <h3 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>فیلترهای پیشرفته سیستم مدیریت تسک‌ها و پروژه‌ها</h3>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <button onClick={exportToCSV} className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-emerald-600 text-white rounded-lg shadow-sm">
                      <Download size={14} />
                      <span>خروجی اطلاعات (CSV)</span>
                    </button>
                    {selectedManagerId && (
                      <button onClick={() => setSelectedManagerId(null)} className={`text-xs font-black px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-200 text-slate-950 border-slate-400'}`}>نمای دپارتمان</button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'وضعیت پروژه', val: statusFilter, set: setStatusFilter, opt: [{v:'all',t:'تمامی وضعیت‌ها'},{v:'active',t:'در حال اجرا'},{v:'completed',t:'تکمیل شده'},{v:'delayed',t:'دارای تاخیر'}] },
                    { label: 'سطح اولویت', val: priorityFilter, set: setPriorityFilter, opt: [{v:'all',t:'تمامی اولویت‌ها'},{v:'high',t:'بالا'},{v:'medium',t:'متوسط'},{v:'low',t:'پایین'}] }
                  ].map((f, i) => (
                    <div key={i}>
                      <label className={`text-xs font-black block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>{f.label}</label>
                      <select value={f.val} onChange={(e) => f.set(e.target.value)} className={`w-full p-2.5 text-xs font-black rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-200 border-slate-400 text-slate-950'}`}>
                        {f.opt.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
                      </select>
                    </div>
                  ))}
                  <div className="flex items-end">
                    <button onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery(''); }} className={`flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-black rounded-lg border border-dashed ${darkMode ? 'border-slate-700 text-slate-400 bg-slate-800/40' : 'border-slate-400 text-slate-950 bg-slate-100'}`}>
                      <RefreshCw size={12} />
                      <span>ریست کردن فیلترها</span>
                    </button>
                  </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {filteredProjects.map(project => (
                    <div key={project.id} className={`p-4 rounded-xl border flex flex-col justify-between ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={`text-sm font-black ${darkMode ? 'text-slate-100' : 'text-black'}`}>{project.title}</h4>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-900' : project.status === 'delayed' ? 'bg-rose-100 text-rose-900' : 'bg-blue-100 text-blue-900'}`}>
                            {project.status === 'completed' ? 'تکمیل شده' : project.status === 'delayed' ? 'تاخیر خورده' : 'در حال اجرا'}
                          </span>
                        </div>
                        <p className={`text-xs mb-4 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-950 font-black'}`}>{project.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className={`flex justify-between text-[11px] font-black mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>
                            <span>پیشرفت پروژه</span>
                            <span className="font-mono">{project.progress}%</span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-300'}`}>
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {project.tags.map(t => (
                            <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-black ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-950 border border-slate-300'}`}>{t}</span>
                          ))}
                        </div>

                        <div className={`flex items-center justify-between text-[11px] pt-3 border-t font-black ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-950'}`}>
                          <span>بودجه: <span className={`font-mono ${darkMode ? 'text-slate-200' : 'text-black font-black'}`}>{(project.budget / 10000000).toLocaleString('fa-IR')} م تومان</span></span>
                          <span>امتیاز کیفی: <span className="text-amber-600 font-mono font-black">{project.score}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
