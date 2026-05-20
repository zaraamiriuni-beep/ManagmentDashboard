import React, { useState, useMemo } from 'react';
import { mockDepartments, mockActivities } from './mockData';
import { Department, ProjectManager, Project } from './types';
import { 
  LayoutDashboard, Layers, Users, Activity, BarChart3, LineChart, 
  Search, Bell, Sun, Moon, ChevronLeft, ArrowUpRight, ArrowDownRight, 
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
      const deptManagers = dept.managers;
      const deptProjects = deptManagers.flatMap(m => m.projects);
      const avgScore = deptProjects.reduce((acc, p) => acc + p.score, 0) / (deptProjects.length || 1);
      return {
        name: dept.name,
        id: dept.id,
        'تعداد پروژه‌ها': deptProjects.length,
        'میانگین امتیاز': Math.round(avgScore)
      };
    });
  }, []);

  // Filter pipeline for deeply nested project cards
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
    <div className={`min-h-screen font-sans antialiased text-right ${darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50/50 text-slate-900'}`} dir="rtl">
      
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur border-b transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">سامانه جامع داشبورد تحلیل مدیریت پروژه‌ها</h1>
              <p className="text-xs text-slate-500 font-medium">امروز: ۳۰ اردیبهشت ۱۴۰۵</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64 max-md:hidden">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="جستجو در سراسر داشبورد..." 
                className={`w-full pr-9 pl-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <img className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60" alt="حساب کاربری" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Navigation Sidebar */}
        <aside className={`w-64 max-lg:hidden shrink-0 min-h-[calc(100vh-4rem)] border-l ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-4 space-y-1">
            <button onClick={() => { setSelectedDeptId(null); setSelectedManagerId(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${!selectedDeptId ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}>
              <Layers size={18} />
              <span>نمای کل سازمان</span>
            </button>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">دپارتمان‌ها</div>
            {mockDepartments.map((d) => (
              <button 
                key={d.id} 
                onClick={() => { setSelectedDeptId(d.id); setSelectedManagerId(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${selectedDeptId === d.id ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
              >
                <span>{d.name}</span>
                <span className="text-xs bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md font-mono">{d.managers.flatMap(m => m.projects).length}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Dashboard Workstation Canvas */}
        <main className="flex-1 p-6 space-y-6 overflow-hidden">
          
          {/* Breadcrumbs Tier Index Map */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
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
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedManager.name}</span>
              </>
            )}
          </div>

          {/* Premium Animated KPI Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border shadow-sm transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">پروژه‌های فعال سازمان</span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg"><Layers size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight font-mono">{stats.totalProjects}</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5" dir="ltr"><ArrowUpRight size={12}/>+12%</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">میانگین امتیاز عملکرد</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg"><Activity size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight font-mono">{stats.avgScore}٪</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5" dir="ltr"><ArrowUpRight size={12}/>+4%</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">نرخ نهایی‌سازی پروژه‌ها</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg"><Users size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight font-mono">{stats.completionRate}٪</span>
                <span className="text-xs font-semibold text-slate-400">مطلوب</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">پروژه‌های دارای تاخیر</span>
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg"><Activity size={18} /></div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight font-mono text-rose-600">{stats.delayedCount}</span>
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5" dir="ltr"><ArrowDownRight size={12}/>-2%</span>
              </div>
            </div>
          </div>

          {/* Core Visual Analytics Engine Panels */}
          {!selectedDeptId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold">نمودار ترکیبی بارگذاری دپارتمان‌ها و شاخص کیفی</h3>
                    <p className="text-xs text-slate-400">برای فیلتر روی هر ستون کلیک کنید</p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} onClick={(state) => { if(state && state.activePayload) { const found = mockDepartments.find(d => d.name === state.activePayload?.[0].payload.name); if(found) setSelectedDeptId(found.id); } }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} tickLine={false} />
                      <Tooltip cursor={{ fill: darkMode ? 'rgba(30,41,59,0.4)' : 'rgba(241,245,249,0.6)' }} />
                      <Bar yAxisId="left" dataKey="تعداد پروژه‌ها" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                      <Line yAxisId="right" type="monotone" dataKey="میانگین امتیاز" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sidebar Mini Analytics Component */}
              <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                <h3 className="text-base font-bold mb-4">آخرین وقایع و فعالیت سیستم</h3>
                <div className="space-y-4">
                  {mockActivities.map(act => (
                    <div key={act.id} className="flex gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3 last:border-none last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{act.managerName}</p>
                        <p className="text-slate-500">{act.action}: <span className="font-medium text-slate-800 dark:text-slate-200">{act.projectTitle}</span></p>
                        <span className="text-[10px] text-slate-400 block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Department Detail Interactive Dashboard Drawer Node */}
          {selectedDeptId && !selectedManagerId && (
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">دپارتمان {selectedDept?.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">لیست مدیران پروژه فعال و وضعیت واگذاری زیرمجموعه</p>
                </div>
                <button onClick={() => setSelectedDeptId(null)} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-all">بازگشت به سطح بالا</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDept?.managers.map(mng => {
                  const mngProjects = mng.projects;
                  const mngAvgScore = Math.round(mngProjects.reduce((acc, p) => acc + p.score, 0) / (mngProjects.length || 1));
                  return (
                    <div key={mng.id} onClick={() => setSelectedManagerId(mng.id)} className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <img className="w-10 h-10 rounded-full object-cover" src={mng.avatar} alt={mng.name} />
                        <div>
                          <h4 className="text-sm font-bold">{mng.name}</h4>
                          <p className="text-xs text-slate-400">{mng.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400">تعداد پروژه‌ها:</span>
                          <span className="font-bold font-mono block text-sm">{mngProjects.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">میانگین امتیاز:</span>
                          <span className="font-bold font-mono block text-sm text-amber-500">{mngAvgScore}٪</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {selectedDept?.managers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 text-sm">هیچ مدیر پروژه‌ای در این دپارتمان تعریف نشده است.</div>
                )}
              </div>
            </div>
          )}

          {/* Deep Dynamic Filter & Tab Engine Frame */}
          {(selectedManagerId || !selectedDeptId) && (
            <div className={`p-5 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-blue-500" />
                    <h3 className="text-sm font-bold">فیلترهای پیشرفته سیستم مدیریت تسک‌ها</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={exportToCSV} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                      <Download size={14} />
                      <span>خروجی اطلاعات (CSV)</span>
                    </button>
                    {selectedManagerId && (
                      <button onClick={() => setSelectedManagerId(null)} className="text-xs font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-all">نمای دپارتمان</button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">وضعیت پروژه</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`w-full p-2 text-xs rounded-lg border focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <option value="all">تمامی وضعیت‌ها</option>
                      <option value="active">در حال اجرا</option>
                      <option value="completed">تکمیل شده</option>
                      <option value="delayed">دارای تاخیر</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">سطح اولویت</label>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`w-full p-2 text-xs rounded-lg border focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <option value="all">تمامی اولویت‌ها</option>
                      <option value="high">بالا</option>
                      <option value="medium">متوسط</option>
                      <option value="low">پایین</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery(''); }} className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500">
                      <RefreshCw size={12} />
                      <span>ریست کردن فیلترها</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Projects Matrix Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {filteredProjects.map(project => (
                    <div key={project.id} className={`p-4 rounded-xl border transition-all hover:shadow-sm flex flex-col justify-between ${darkMode ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{project.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            project.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            project.status === 'delayed' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                          }`}>
                            {project.status === 'completed' ? 'تکمیل شده' : project.status === 'delayed' ? 'تاخیر خورده' : 'در حال اجرا'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                            <span>پیشرفت پروژه</span>
                            <span className="font-mono">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {project.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-mono">{t}</span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-3 border-t dark:border-slate-800 text-slate-400 font-medium">
                          <span>بودجه: <span className="text-slate-700 dark:text-slate-300 font-mono">{(project.budget / 10000000).toLocaleString('fa-IR')} م تومان</span></span>
                          <span>امتیاز کیفی: <span className="text-amber-500 font-mono">{project.score}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 text-sm">هیچ پروژه‌ای مطابق با فیلترهای انتخابی یافت نشد.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
