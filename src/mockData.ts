import { Department, ActivityLog } from './types';

export const mockDepartments: Department[] = [
  {
    id: 'dept-it',
    name: 'فناوری اطلاعات',
    icon: 'Laptop',
    managers: [
      {
        id: 'mng-1',
        name: 'علیرضا رضایی',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        role: 'مدیر ارشد زیرساخت',
        projects: [
          { id: 'p-1', title: 'توسعه هسته پلتفرم ابری', status: 'active', score: 92, startDate: '۱۴۰۴/۰۱/۱۵', endDate: '۱۴۰۵/۰۴/۳۰', budget: 4500000000, progress: 68, teamSize: 12, priority: 'high', description: 'انتقال معماری یکپارچه قدیمی به میکروسرویس‌های توزیع شده ابری با قابلیت مقیاس‌پذیری خودکار.', tags: ['Docker', 'Kubernetes', 'Go'], riskLevel: 'medium' },
          { id: 'p-2', title: 'ارتقای امنیت فایروال سازمانی', status: 'completed', score: 96, startDate: '۱۴۰۳/۰۸/۱۰', endDate: '۱۴۰۴/۰۲/۱۵', budget: 1200000000, progress: 100, teamSize: 5, priority: 'high', description: 'پیاده‌سازی مکانیزم دسترسی زیرو-تراست در تمامی لایه‌های شبکه داخلی سازمان.', tags: ['Security', 'Zero-Trust'], riskLevel: 'low' },
          { id: 'p-3', title: 'پیاده‌سازی هوش تجاری (BI)', status: 'delayed', score: 74, startDate: '۱۴۰۴/۰۲/۰۱', endDate: '۱۴۰۴/۱۲/۲۹', budget: 2800000000, progress: 45, teamSize: 8, priority: 'medium', description: 'انبارش داده‌ها و ساخت داشبوردهای تحلیلی سلف‌سرویس برای مدیران ارشد خطوط کسب‌وکار.', tags: ['PowerBI', 'SQL Server'], riskLevel: 'high' }
        ]
      },
      {
        id: 'mng-2',
        name: 'سارا احمدی',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
        role: 'سرپرست توسعه نرم‌افزار',
        projects: [
          { id: 'p-4', title: 'اپلیکیشن موبایل نسخه جدید', status: 'active', score: 88, startDate: '۱۴۰۴/۰۵/۰۱', endDate: '۱۴۰۵/۰۱/۲۰', budget: 1900000000, progress: 55, teamSize: 9, priority: 'high', description: 'بازنویسی فرانت‌اند موبایل با فریم‌ورک فلاتر جهت بهبود نرخ تبدیل کاربران.', tags: ['Flutter', 'Redux'], riskLevel: 'low' }
        ]
      }
    ]
  },
  {
    id: 'dept-rd',
    name: 'تحقیق و توسعه',
    icon: 'Atom',
    managers: [
      {
        id: 'mng-3',
        name: 'محمد امیری',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
        role: 'پژوهشگر ارشد هوش مصنوعی',
        projects: [
          { id: 'p-5', title: 'بومی‌سازی مدل زبانی بزرگ (LLM)', status: 'active', score: 95, startDate: '۱۴۰۳/۱۰/۰۱', endDate: '۱۴۰۵/۰۶/۳۱', budget: 8500000000, progress: 72, teamSize: 14, priority: 'high', description: 'آموزش و تنظیم دقیق مدل زبانی تخصصی برای درک اصطلاحات حقوقی و مالی زبان فارسی.', tags: ['PyTorch', 'Transformers'], riskLevel: 'high' }
        ]
      }
    ]
  },
  {
    id: 'dept-mkt',
    name: 'بازاریابی و فروش',
    icon: 'Megaphone',
    managers: [
      {
        id: 'mng-4',
        name: 'مریم حسینی',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
        role: 'مدیر هک رشد',
        projects: [
          { id: 'p-6', title: 'کمپین جامع بازبرندسازی سالانه', status: 'completed', score: 91, startDate: '۱۴۰۴/۰۱/۱۰', endDate: '۱۴۰۴/۰۷/۱۵', budget: 3100000000, progress: 100, teamSize: 22, priority: 'medium', description: 'تغییر هویت بصری سازمان و اجرای مسابقات محیطی و دیجیتال عیدانه.', tags: ['SEO', 'PR', 'Branding'], riskLevel: 'low' }
        ]
      }
    ]
  },
  {
    id: 'dept-fin',
    name: 'مالی و حسابداری',
    icon: 'Coins',
    managers: [
      {
        id: 'mng-5',
        name: 'حمید کریمی',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
        role: 'رئیس حسابداری صنعتی',
        projects: [
          { id: 'p-7', title: 'اتوماسیون تخصیص بودجه واحدها', status: 'active', score: 82, startDate: '۱۴۰۴/۰۶/۰۱', endDate: '۱۴۰۵/۰۲/۱۵', budget: 1400000000, progress: 38, teamSize: 4, priority: 'low', description: 'یکپارچه‌سازی سیستم مالی صف و ستاد جهت حذف مغایرت‌های هفتگی ترازنامه‌ها.', tags: ['ERP', 'Auditing'], riskLevel: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'dept-hr',
    name: 'منابع انسانی',
    icon: 'Users',
    managers: []
  },
  {
    id: 'dept-ops',
    name: 'عملیات و لجستیک',
    icon: 'Briefcase',
    managers: []
  },
  {
    id: 'dept-support',
    name: 'پشتیبانی مشتریان',
    icon: 'Headphones',
    managers: []
  },
  {
    id: 'dept-sales',
    name: 'توسعه بازار',
    icon: 'TrendingUp',
    managers: []
  }
];

export const mockActivities: ActivityLog[] = [
  { id: 'act-1', managerName: 'علیرضا رضایی', action: 'وضعیت پروژه را به تاخیر خورده تغییر داد', projectTitle: 'پیاده‌سازی هوش تجاری (BI)', time: '۱۰ دقیقه پیش' },
  { id: 'act-2', managerName: 'سارا احمدی', action: 'یک تگ جدید اضافه کرد', projectTitle: 'اپلیکیشن موبایل نسخه جدید', time: '۱ ساعت پیش' },
  { id: 'act-3', managerName: 'مریم حسینی', action: 'پروژه را با موفقیت خاتمه داد', projectTitle: 'کمپین جامع بازبرندسازی سالانه', time: 'دیروز' }
];
