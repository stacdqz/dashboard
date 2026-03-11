"use client";
import { useState, useEffect, useRef, useCallback } from 'react';

import { PROJECTS_CONFIG } from '@/lib/config';

const CHANGELOG_DATA: { commit: string; date: string; message: string; version: string; isMilestone?: boolean }[] = [
  { commit: 'bc418a0', date: '2026-03-08', version: 'v1.4.0', message: '集成：完成 UX 与安全架构升级，包含延迟预览、行为审计日志及边缘下载管控。' },
  { commit: '82bbc8e', date: '2026-02-28', version: 'v1.3.0', isMilestone: true, message: '系统：更新跨项目的全栈数据大盘，完善并统合系统变更记录的时间轴组件。' },
  { commit: '2987c0c', date: '2026-02-28', version: 'v1.2.9', message: '系统：全面集成 v1.0 到 v1.2 的各项演变记录，在面板顶层增加版本控制徽章。' },
  { commit: 'f4af374', date: '2026-02-28', version: 'v1.2.8', message: '界面：注入系统版本号状态实时展示，并添加了全新的聚合更新日志弹出视窗交互。' },
  { commit: 'b88cd25', date: '2026-02-28', version: 'v1.2.7', isMilestone: true, message: '修复：优化并重构跳转机制，彻底解决了移动端浏览器拦截 Cloudflare 下载页代理弹窗的问题。' },
  { commit: '0db06b6', date: '2026-02-27', version: 'v1.2.6', isMilestone: true, message: '修复：填补高危遗漏，由于缺失 sign 参数导致部分直链下载抛出 403 阻断拒绝请求修复。' },
  { commit: '5a9ff26', date: '2026-02-27', version: 'v1.2.5', message: '系统：战略性放弃暂不稳定的 Web-NDM 引擎试验，全面回滚至兼容性最强的经典直链代理分发模式。' },
  { commit: 'b425416', date: '2026-02-26', version: 'v1.2.4', message: '网盘：针对小体积请求进行特判防 403 路由疏浚；在 Web NDM 中新增加速中断取消按钮。' },
  { commit: '276f54c', date: '2026-02-26', version: 'v1.2.3', message: '修复：规避 Cloudflare 代理节点缺失 Range 头缓存响应带来的底层文件大小检测受限 Bug。' },
  { commit: 'a161677', date: '2026-02-26', version: 'v1.2.2', message: '网络：加入突发流量重连并发策略，以强制手段打通部分地区针对多并发的分流掐断制裁。' },
  { commit: 'd5a9091', date: '2026-02-26', version: 'v1.2.1', message: '底层：撤回 Web NDM 的 IO 到盘缓存机制，改回全速无限制内存汇流传输；修复线程配置面板传值的 Bug。' },
  { commit: 'bbbbc7a', date: '2026-02-26', version: 'v1.2.0', message: '界面：提供高度开放配置，将底层的多线程数量参数通过滑块接口彻底放权给管理员自由调整。' },
  { commit: '1e475b0', date: '2026-02-26', version: 'v1.1.9', message: '修复：修补部分数据块龟速拖慢全图局面的隐患，为了减缓内存压力强转回磁盘模式，精简至3线程容错。' },
  { commit: 'ceee006', date: '2026-02-26', version: 'v1.1.8', isMilestone: true, message: '界面：进一步革新全站的多线程响应式操作视图布局，解决手机端直连状态下操作堆叠问题。' },
  { commit: '405d446', date: '2026-02-26', version: 'v1.1.7', message: '安全：加入针对 AList 专属主机的自由环境热切换以及服务器管理权限功能。' },
  { commit: '54b683a', date: '2026-02-26', version: 'v1.1.6', message: '网盘：加入一个备选的保守派单线程请求后备下载通道，保证环境极其恶劣下的下限。' },
  { commit: 'ce97770', date: '2026-02-26', version: 'v1.1.5', message: '系统：在核心 Dashboard 画廊总控中嵌入百度网盘专用的强力型多线程并发控制系统部件。' },
  { commit: '4ea312d', date: '2026-02-26', version: 'v1.1.4', message: '核心：自主研发并初现多线程 Web NDM 黑客级下载器逻辑构建框架。' },
  { commit: 'bf928dd', date: '2026-02-26', version: 'v1.1.3', isMilestone: true, message: '修复：绕过一切系统弹窗拦截机制——在触发 Cloudflare 无头浏览前以预生成标签页占据视图制高点。' },
  { commit: '573f68a', date: '2026-02-26', version: 'v1.1.2', message: '网盘：纠正阿里云等服务商走原载直连引发的签名劫持拦截报错，强行引流至原生独立 /p/ 代理引擎。' },
  { commit: 'd7f5968', date: '2026-02-26', version: 'v1.1.1', message: '网盘：修补对特供版 /aliyun_new 高级代理路由的动态探测抓取识别能力。' },
  { commit: '8899a17', date: '2026-02-26', version: 'v1.1.0', isMilestone: true, message: '核心：突围跨域死锁！成功使用经过后台鉴权签名并二次包裹头的服务端特种解析转发手段进行免限速投递。' },
  { commit: 'df597f5', date: '2026-02-26', version: 'v1.0.9', message: '网络：重构决策分发枢纽，其他通用网格走绿通直链，唯遇到极大参数量文件时触发调度器窗口。' },
  { commit: 'b022dba', date: '2026-02-26', version: 'v1.0.8', message: '网络：因基础 Workers.dev 域名大面积超时，全面更换主力加速通道至稳定定制域名 cf.ryantan.fun。' },
  { commit: '68766af', date: '2026-02-26', version: 'v1.0.7', message: '网络：惊艳亮相——首度嵌入全球泛播 Cloudflare Workers 边缘计算节点，真正实现无痛代理。' },
  { commit: '54ab4ba', date: '2026-02-26', version: 'v1.0.6', message: '核心：服务端强制染色，智能注入泛解析 pan.baidu.com 标的 User-Agent 防封锁识别机制。' },
  { commit: '1898d0a', date: '2026-02-26', version: 'v1.0.5', isMilestone: true, message: '试验：首发基于 HTML5 引擎的极快 32 原生并发切分下载实验室特性架构测试。' },
  { commit: '9505da3', date: '2026-02-25', version: 'v1.0.4', message: '功能：实装动态体量路由探测针，小对象一键下达直连，大质量文件呼出智能对策包窗口。' },
  { commit: '0214efa', date: '2026-02-25', version: 'v1.0.3', isMilestone: true, message: '系统：在首页搭建可视化地域流量分析监控屏；补全批量下载与勾选全选控件全家桶。' },
  { commit: '7c8068e', date: '2026-02-25', version: 'v1.0.2', message: '界面：精锐减负！移除历史死代码陈旧弹窗资产，并消灭所有 TypeScript 严格类型推导错误。' },
  { commit: 'a3a5e98', date: '2026-02-25', version: 'v1.0.2', message: '网络：免浏览器附加组件——以无头后端特异形态构建原生代理响应 UA 桥接。' },
  { commit: 'b6cfcd1', date: '2026-02-25', version: 'v1.0.1', message: '界面：扩建网盘下载面板选项体系，使直链极速通道与高隐匿代理信道并存。' },
  { commit: 'ba9c6a6', date: '2026-02-25', version: 'v1.0.1', message: '修复：阻截官方安全拦截锁，将大流量文件强制导流至纯净安全的 /p/ AList 隐身域控代理模式。' },
  { commit: '62e3f5e', date: '2026-02-25', version: 'v1.0.1', message: '网盘：规避严密封锁圈，灵活运用 /d/ 标准授权 URL 完成合法突破重定向桥梁架设。' },
  { commit: '584207f', date: '2026-02-25', version: 'v1.0.1', isMilestone: true, message: '集成：从 0 到 1 飞越：正式将强大的百度网盘· AList 集成中枢深度打散并入主控制台数据大屏内置独立工作组件内。' },
  { commit: '86655b8', date: '2026-02-25', version: 'v1.0.0', message: '修复：开放线上最高权限，允许 Vercel 生产强控环境下依然能直插终端调配后端 SQL 桥。' },
  { commit: '9c26c0b', date: '2026-02-25', version: 'v1.0.0', message: '修复：绕过远端跨域隔离，授予核心引擎针对生产主机的强制作出代码 GitHub Commit 变动的生杀大权。' },
  { commit: '25ea2a6', date: '2026-02-25', version: 'v1.0.0', message: '网络：极致压缩 GitHub API 底层管道交互指令，完美吞吐二进位流巨无霸大文件。' },
  { commit: '5559d8f', date: '2026-02-25', version: 'v1.0.0', message: '界面：彻底实施多端自适应手术改造计划，完成全屏幕宽度的弹性兼容与布局翻新。' },
  { commit: '5d69123', date: '2026-02-25', version: 'v1.0.0', message: '配置：注入 PostCSS 与 ESLint 基座守护底层框架样式生成稳定性。' },
  { commit: '378d1be', date: '2026-02-25', version: 'v1.0.0', message: '系统：基石竣工，包含样式库、安全鉴权密钥库、图标与部署映射图正式拼装入网。' },
  { commit: '46d1068', date: '2026-02-25', version: 'v1.0.0', isMilestone: true, message: '肇始：向浩瀚开源世界刻下包含 Vercel 域名解析、GitHub 代码推送及 Supabase SQL 阵列大盘的初代原型控制枢纽。' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [context, setContext] = useState<string>("home"); // 当前所在目录
  const [termOpen, setTermOpen] = useState(true);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [viewLogs, setViewLogs] = useState<any[]>([]);
  const [totalRequests, setTotalRequests] = useState<number | null>(null);
  const [sqlCmd, setSqlCmd] = useState("");
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [ghFilename, setGhFilename] = useState("");
  const [ghContent, setGhContent] = useState("");
  const [ghUploadMode, setGhUploadMode] = useState<'text' | 'file'>('text');
  const [ghFileBase64, setGhFileBase64] = useState<string>("");
  const [ghUploading, setGhUploading] = useState(false);
  const [ghUploadMsg, setGhUploadMsg] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [logLimit, setLogLimit] = useState<string>("10");
  const [ipStats, setIpStats] = useState<any[]>([]);
  const [ipStatsLimit, setIpStatsLimit] = useState<string>("10");
  const [ipStatsSummary, setIpStatsSummary] = useState<{ totalIPs: number; totalVisits: number } | null>(null);
  const [alistSelected, setAlistSelected] = useState<Set<string>>(new Set());

  // === 真实数据状态 ===
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [vercelDomains, setVercelDomains] = useState<any[]>([]);
  const [githubFiles, setGithubFiles] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [domainAdding, setDomainAdding] = useState(false);
  const [domainAddMsg, setDomainAddMsg] = useState<string | null>(null);

  const [systemInfo, setSystemInfo] = useState<any>(null);

  // === AList 网盘状态 ===
  const [alistPath, setAlistPath] = useState('/');
  const [alistFiles, setAlistFiles] = useState<any[]>([]);
  const [alistLoading, setAlistLoading] = useState(false);
  const [alistError, setAlistError] = useState<string | null>(null);
  const [alistMkdirName, setAlistMkdirName] = useState('');
  const [alistShowMkdir, setAlistShowMkdir] = useState(false);
  const [alistUploadFile, setAlistUploadFile] = useState<File | null>(null);
  const [alistUploading, setAlistUploading] = useState(false);
  const [alistMsg, setAlistMsg] = useState<string | null>(null);
  const [alistRenaming, setAlistRenaming] = useState<string | null>(null);
  const [alistNewName, setAlistNewName] = useState('');
  const [alistDownloadModal, setAlistDownloadModal] = useState<{ name: string; filePath: string; sign?: string } | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  // 文件预览
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: 'image' | 'video' | 'text' | 'pdf' | 'archive'; filePath: string; sign?: string; size?: number } | null>(null);
  const [previewItemMeta, setPreviewItemMeta] = useState<{ name: string; filePath: string; sign?: string; size?: number; type?: 'image' | 'video' | 'text' | 'pdf' | 'archive' } | null>(null);
  const [previewText, setPreviewText] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [globalDisableThird, setGlobalDisableThird] = useState(false);
  const [vercelUsage, setVercelUsage] = useState<any>(null);

  // 科协网盘集成
  const [panChangelog, setPanChangelog] = useState<any[]>([]);
  const [panChangelogLimit, setPanChangelogLimit] = useState(5);
  const [panAdminData, setPanAdminData] = useState<{ users: any[], settings: any } | null>(null);
  const [panAdminLoading, setPanAdminLoading] = useState(false);
  const [panAdminMsg, setPanAdminMsg] = useState("");
  const [panActionLogs, setPanActionLogs] = useState<any[]>([]);
  const [panActionLogsLimit, setPanActionLogsLimit] = useState(10);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 初始化
  useEffect(() => {
    setMounted(true);
    setLogs(["[SYSTEM] ZERO_OS v2.1 内核加载完毕...", "[AUTH] 哥哥酱身份验证通过喵！", "Supabase 链路已校准...", "输入 'ls' 查看项目，'cd magic' 进入魔法计算器。"]);
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('ZERO_ADMIN_TOKEN');
      if (saved) setAdminToken(saved);
    }

    // 获取系统信息与全局设置
    const fetchLoop = async () => {
      try {
        const res = await fetch('/api/system-info');
        const data = await res.json();
        setSystemInfo(data);

        const sRes = await fetch('/api/global-settings');
        const sData = await sRes.json();
        if (sData && typeof sData.disableThirdDownload === 'boolean') {
          setGlobalDisableThird(sData.disableThirdDownload);
        }
      } catch { }
    };
    fetchLoop();
    const sysTimer = setInterval(fetchLoop, 5000);

    // 获取Vercel用量数据
    fetch('/api/vercel-usage').then(r => r.json()).then(d => {
      if (d.status === 200) setVercelUsage(d.data);
    }).catch(() => {});

    // 获取科协网盘更新日志
    fetch('/api/pan/changelog').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setPanChangelog(d);
    }).catch(() => {});

    // 初始化时加载网盘根目录
    alistListDir('/');

    return () => clearInterval(sysTimer);
  }, []);

  const fetchPanAdmin = useCallback(async () => {
    if (!adminToken) return;
    setPanAdminLoading(true);
    try {
      const res = await fetch('/api/pan/admin', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPanAdminData(data);
      } else {
        setPanAdminMsg(`❌ ${data.error || '获取网盘数据失败'}`);
      }
    } catch {
      setPanAdminMsg('❌ 接口连接异常');
    } finally {
      setPanAdminLoading(false);
    }
  }, [adminToken]);

  const fetchPanActionLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/pan/action-logs?limit=${panActionLogsLimit}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPanActionLogs(data);
      }
    } catch (e) {
      console.error("Fetch action logs error:", e);
    }
  }, [panActionLogsLimit]);

  const handlePanAdminAction = async (action: string, payload: any) => {
    if (!adminToken) return;
    try {
      setPanAdminMsg("⏳ 正在同步指令到网盘...");
      const res = await fetch('/api/pan/admin', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (res.ok) {
        setPanAdminMsg("✅ 操作已成功同步！");
        if (data.users || data.settings) {
          setPanAdminData(prev => ({
            users: data.users || prev?.users || [],
            settings: data.settings || prev?.settings || {}
          }));
        }
        if (action === 'changeAdminPassword') setPanAdminMsg("✅ 管理员密码修改成功");
      } else {
        setPanAdminMsg(`❌ 同步失败: ${data.error || '未知错误'}`);
      }
    } catch {
      setPanAdminMsg("❌ 网络请求异常");
    }
  };

  useEffect(() => {
    if (context === 'pan') {
      fetchPanActionLogs();
      if (adminToken) {
        fetchPanAdmin();
      }
    }
  }, [context, adminToken, fetchPanAdmin, fetchPanActionLogs]);

  // 2. 真实数据抓取逻辑 (核心喵！)
  useEffect(() => {
    // 只有进入具体项目时才去抓数据，主页不需要抓喵
    if (context !== 'home' && PROJECTS_CONFIG[context]) {
      setLoading(true);
      setRealData(null); // 切换时先清空旧数据

      const fetchData = async () => {
        try {
          // 调用我们刚才写的 API
          const res = await fetch(`/api/status?project=${context}`);
          const data = await res.json();
          setRealData(data);
          setLogs(prev => [...prev, `[NETWORK] 成功同步 ${context} 的 GitHub 和 Vercel 数据喵！`]);
        } catch (e) {
          setLogs(prev => [...prev, `[ERROR] 数据抓取失败，请检查 Token 喵...`]);
        } finally {
          setLoading(false);
        }
      };

      const fetchViewLogs = async () => {
        try {
          const res = await fetch(`/api/view-logs?project=${context}&limit=${logLimit}`);
          const data = await res.json();
          if (Array.isArray(data.logs)) {
            setViewLogs(data.logs);
          } else {
            setViewLogs([]);
          }
        } catch (e) {
          setLogs(prev => [...prev, `[ERROR] 访问日志加载失败喵...`]);
        }
      };

      const fetchTotalRequests = async () => {
        try {
          const res = await fetch('/api/total-requests?project=' + context);
          const data = await res.json();
          if (typeof data.totalRequests === 'number') {
            setTotalRequests(data.totalRequests);
          }
        } catch (e) {
          setLogs(prev => [...prev, `[ERROR] 总请求数加载失败喵...`]);
        }
      };

      const fetchIpStats = async () => {
        try {
          const res = await fetch(`/api/ip-stats?project=${context}&limit=${ipStatsLimit}`);
          const data = await res.json();
          if (Array.isArray(data.stats)) {
            setIpStats(data.stats);
            setIpStatsSummary({ totalIPs: data.totalIPs, totalVisits: data.totalVisits });
          }
        } catch (e) {
          setLogs(prev => [...prev, `[ERROR] IP统计加载失败喵...`]);
        }
      };

      const fetchDomains = async () => {
        try {
          const res = await fetch('/api/vercel-domains?project=' + context);
          const data = await res.json();
          if (Array.isArray(data.domains)) setVercelDomains(data.domains);
        } catch (e) {
          setLogs(prev => [...prev, `[ERROR] Vercel Domains 抓取失败喵...`]);
        }
      };

      const fetchFiles = async () => {
        try {
          const res = await fetch(`/api/github-files?repo=${PROJECTS_CONFIG[context].github_repo}`);
          const data = await res.json();
          if (Array.isArray(data.files)) setGithubFiles(data.files);
        } catch (e) {
          setLogs(prev => [...prev, `[ERROR] GitHub Files 抓取失败喵...`]);
        }
      };

      fetchData();
      fetchViewLogs();
      fetchTotalRequests();
      fetchDomains();
      fetchFiles();
      fetchIpStats();
      // 设置 60秒 自动刷新一次数据 & 访问日志
      const timer = setInterval(() => {
        fetchData();
        fetchViewLogs();
        fetchTotalRequests();
        fetchDomains();
        fetchFiles();
        fetchIpStats();
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [context, logLimit, ipStatsLimit]);

  // 3. 终端自动滚动
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const handleLogin = async () => {
    const pwd = authPassword.trim();
    if (!pwd) {
      setAuthError("密码不能为空喵...");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setAuthError(data.error || "登录失败喵...");
        return;
      }
      setAdminToken(data.token);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ZERO_ADMIN_TOKEN', data.token);
      }
      setAuthPassword("");
      setLogs(prev => [...prev, "[AUTH] 控制核心接入成功喵！"]);
    } catch {
      setAuthError("远程控制链路响应异常喵...");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('ZERO_ADMIN_TOKEN');
    }
    setLogs(prev => [...prev, "[AUTH] 已退出控制核心喵。"]);
  };

  // === AList 操作函数 ===
  const getPreviewType = (name: string): 'image' | 'video' | 'text' | 'pdf' | 'archive' | null => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp','svg','bmp','ico'].includes(ext)) return 'image';
    if (['mp4','webm','ogg','mov'].includes(ext)) return 'video';
    if (['txt','md','log','json','csv','xml','html','css','js','ts','tsx','py','java','c','cpp','h','yaml','yml','ini','cfg','conf','sh','bat','sql','go','rs','rb','php','swift','kt'].includes(ext)) return 'text';
    if (ext === 'pdf') return 'pdf';
    if (['zip','rar','7z','tar','gz'].includes(ext)) return 'archive';
    return null;
  };

  const logUserAction = async (action_type: string, action_item: string) => {
    try {
      await fetch('/api/log-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           username: adminToken ? '数据控制台(DataPanel)' : '匿名终端(DataPanel)',
           action_type,
           action_item
        })
      });
    } catch {}
  };

  const openPreview = async (item: any, filePath: string) => {
    const type = getPreviewType(item.name);
    if (!type) return false;
    
    setPreviewItemMeta({ name: item.name, filePath, sign: item.sign, size: item.size, type });
    setPreviewStarted(false);
    setPreviewFile(null);
    setPreviewText('');
    return true;
  };

  const loadPreviewContent = async () => {
    if (!previewItemMeta || !previewItemMeta.type) return;
    const { name, filePath, sign, size, type } = previewItemMeta;
    
    setPreviewLoading(true);
    setPreviewStarted(true);
    setPreviewText('');

    logUserAction('预览', filePath);

    const isBaidu = alistPath.startsWith('/百度网盘') || alistPath.startsWith('/baidu');
    try {
      if (type === 'archive') {
         const ext = name.split('.').pop()?.toLowerCase();
         setPreviewText(`⚠️ 不支持前端解析格式: ${ext?.toUpperCase() || '未知'}\n为保证浏览稳定性，系统已将提取引擎卸载。\n请点击底部下载按钮直接下载，或在后端开启压缩包解压支持。`);
         setPreviewFile({ name, url: '', type, filePath, sign, size });
         setPreviewLoading(false);
         return true;
      }

      const res = await fetch('/api/alist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify({ action: 'get', path: filePath }),
      });
      const data = await res.json();
      if (data.code !== 200 || !data.data?.raw_url) {
        setAlistMsg('❌ 获取文件预览链接失败');
        setPreviewLoading(false);
        return false;
      }
      let previewUrl = data.data.raw_url;
      
      if (isBaidu && (type === 'text' || type === 'pdf')) {
        if ((size || 0) >= SIZE_THRESHOLD) {
          previewUrl = `https://cf.ryantan.fun/?url=${encodeURIComponent(previewUrl)}`;
        } else {
          previewUrl = `/api/alist-download?path=${encodeURIComponent(filePath)}`;
        }
      }

      if (type === 'text') {
        if ((size || 0) > 2 * 1024 * 1024) {
          setPreviewText('⚠️ 文件超过 2MB，无法在线预览。请下载后查看。');
        } else {
          try {
            const textRes = await fetch(previewUrl);
            const text = await textRes.text();
            setPreviewText(text);
          } catch {
            setPreviewText('⚠️ 无法加载文件内容。');
          }
        }
      }
      setPreviewFile({ name, url: previewUrl, type, filePath, sign, size });
      setPreviewLoading(false);
      return true;
    } catch {
      setAlistMsg('❌ 预览加载失败');
      setPreviewLoading(false);
      return false;
    }
  };

  const ALIST_BASE = 'http://47.108.222.119:5244';
  const SIZE_THRESHOLD = 20 * 1024 * 1024; // 20MB

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const alistListDir = async (path: string) => {
    setAlistLoading(true);
    setAlistError(null);
    try {
      const res = await fetch('/api/alist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', path }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setAlistFiles(data.data?.content || []);
        setAlistPath(path);
      } else {
        setAlistError(data.message || '加载失败喵...');
      }
    } catch {
      setAlistError('网盘接口异常喵...');
    } finally {
      setAlistLoading(false);
    }
  };

  // 小文件直接走 AList /d/ 302重定向（最快）
  const alistDirectDownload = (filePath: string, fileSign?: string) => {
    logUserAction('直连下载', filePath);
    const url = fileSign ? `${ALIST_BASE}/d${filePath}?sign=${fileSign}` : `${ALIST_BASE}/d${filePath}`;
    window.open(url, '_blank');
  };

  // 服务端代理下载
  const alistProxyDownload = (filePath: string, fileName: string) => {
    logUserAction('代理下载', filePath);
    let downloadUrl = `/api/alist-download?path=${encodeURIComponent(filePath)}`;
    const ccConfigStr = localStorage.getItem('ALIST_CUSTOM_CONFIG');
    if (ccConfigStr) {
      downloadUrl += `&c=${btoa(encodeURIComponent(ccConfigStr))}`;
    }
    window.location.href = downloadUrl; // 移动端直接跳转
  };

  const alistNavigate = (item: any) => {
    if (item.is_dir) {
      const newPath = `${alistPath.replace(/\/+$/, '')}/${item.name}`;
      setAlistSelected(new Set());
      alistListDir(newPath);
    } else {
      const filePath = `${alistPath.replace(/\/+$/, '')}/${item.name}`;
      const isBaidu = alistPath.startsWith('/百度网盘') || alistPath.startsWith('/baidu');
      const isAliyun = alistPath.startsWith('/阿里云盘') || alistPath.startsWith('/aliyun') || alistPath.startsWith('/aliyun_new');

      // 检测是否可预览
      const previewType = getPreviewType(item.name);
      if (previewType) {
        openPreview(item, filePath);
        return;
      }

      if (isBaidu && (item.size || 0) >= SIZE_THRESHOLD) {
        setAlistDownloadModal({ name: item.name, filePath, sign: item.sign });
      } else if (isAliyun) {
        alistProxyDownload(filePath, item.name);
      } else {
        alistDirectDownload(filePath, item.sign);
      }
    }
  };

  const alistBatchDownload = () => {
    const isBaidu = alistPath.startsWith('/百度网盘') || alistPath.startsWith('/baidu');
    const isAliyun = alistPath.startsWith('/阿里云盘') || alistPath.startsWith('/aliyun') || alistPath.startsWith('/aliyun_new');
    alistSelected.forEach(name => {
      const file = alistFiles.find((f: any) => f.name === name);
      const filePath = `${alistPath.replace(/\/+$/, '')}/${name}`;
      if (isAliyun || (isBaidu && file && (file.size || 0) >= SIZE_THRESHOLD)) {
        alistProxyDownload(filePath, name);
      } else {
        alistDirectDownload(filePath, file?.sign);
      }
    });
    setAlistSelected(new Set());
  };

  const alistToggleSelect = (name: string) => {
    setAlistSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const alistSelectAll = () => {
    const fileNames = alistFiles.filter((f: any) => !f.is_dir).map((f: any) => f.name);
    if (alistSelected.size === fileNames.length) {
      setAlistSelected(new Set()); // 取消全选
    } else {
      setAlistSelected(new Set(fileNames)); // 全选文件
    }
  };

  const alistMkdir = async () => {
    if (!alistMkdirName.trim()) return;
    setAlistMsg(null);
    try {
      const res = await fetch('/api/alist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'mkdir', path: alistPath, dir_name: alistMkdirName.trim() }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setAlistMsg('✅ 文件夹创建成功喵！');
        setAlistMkdirName('');
        setAlistShowMkdir(false);
        alistListDir(alistPath);
      } else {
        setAlistMsg(`❌ ${data.message}`);
      }
    } catch { setAlistMsg('❌ 接口异常'); }
  };

  const alistRemove = async (name: string) => {
    if (!confirm(`确认删除 ${name} 吗？`)) return;
    setAlistMsg(null);
    try {
      const res = await fetch('/api/alist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'remove', path: alistPath, names: [name] }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setAlistMsg('✅ 删除成功喵！');
        logUserAction('删除', `${alistPath.replace(/\/+$/, '')}/${name}`);
        alistListDir(alistPath);
      } else {
        setAlistMsg(`❌ ${data.message}`);
      }
    } catch { setAlistMsg('❌ 接口异常'); }
  };

  const alistRename = async (filePath: string) => {
    if (!alistNewName.trim()) return;
    setAlistMsg(null);
    try {
      const res = await fetch('/api/alist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'rename', path: filePath, newName: alistNewName.trim() }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setAlistMsg('✅ 重命名成功喵！');
        logUserAction('重命名', `${filePath} -> ${alistNewName.trim()}`);
        setAlistRenaming(null);
        setAlistNewName('');
        alistListDir(alistPath);
      } else {
        setAlistMsg(`❌ ${data.message}`);
      }
    } catch { setAlistMsg('❌ 接口异常'); }
  };

  const alistUpload = async () => {
    if (!alistUploadFile || !adminToken) return;
    setAlistUploading(true);
    setAlistMsg(null);
    try {
      // AList 的上传接口需要直接请求（前端直接到 AList，需先登录返回 Token）
      const uploadPath = alistPath.replace(/\/+$/, '') + '/' + alistUploadFile.name;
      // 需要对每一段路径进行独立 URI 编码，避免 / 也被转义导致找不到目录
      const encodedFilePath = uploadPath.split('/').map(encodeURIComponent).join('/');

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${adminToken}`,
        'File-Path': encodedFilePath,
        'Content-Type': alistUploadFile.type || 'application/octet-stream',
        'Content-Length': String(alistUploadFile.size),
      };

      const uploadRes = await fetch('/api/alist-upload', {
        method: 'PUT',
        headers,
        body: alistUploadFile,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.code === 200) {
        setAlistMsg('✅ 上传成功喵！');
        logUserAction('上传', uploadPath);
        setAlistUploadFile(null);
        alistListDir(alistPath);
      } else {
        setAlistMsg(`❌ ${uploadData.message}`);
      }
    } catch (e: any) {
      setAlistMsg(`❌ 上传失败: ${e.message}`);
    } finally {
      setAlistUploading(false);
    }
  };

  if (!mounted) return <div className="bg-[#050506] min-h-screen" />;

  if (!adminToken) {
    return (
      <div className="min-h-screen bg-[#050506] text-zinc-300 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-black/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-[10px] font-black tracking-widest uppercase italic text-zinc-500 mb-4">
            ZERO_OS Admin Login
          </div>
          <div className="space-y-3">
            <div className="text-xs text-zinc-400">
              请输入系统核心密码，解锁 Supabase SQL 终端与 GitHub 上传控制台喵。
            </div>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              placeholder="控制核心密码"
              className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-pink-500 transition-colors"
            />
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className={`w-full text-xs font-bold py-2 rounded ${authLoading
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-400'
                }`}
            >
              {authLoading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
            {authError && (
              <div className="text-[11px] text-red-400 mt-1">
                {authError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeProject = PROJECTS_CONFIG[context];

  // === 终端指令处理 ===
  const runCmd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const fullCmd = command.trim();
      if (!fullCmd) return;

      const args = fullCmd.split(' ').filter(Boolean);
      const cmd = args[0]?.toLowerCase();

      setLogs(prev => [...prev, `哥哥酱@ZERO:${context} $ ${fullCmd}`]);
      setCommand("");

      if (!cmd) return;

      let response = "";

      switch (cmd) {
        case 'ls':
          response = `📁 领地列表: ${Object.keys(PROJECTS_CONFIG).join(', ')}`;
          break;
        case 'cd':
          const cdArg = args[1]?.toLowerCase();
          if (!cdArg || cdArg === '~') { setContext('home'); response = "已返回主目录喵。"; }
          else if (PROJECTS_CONFIG[cdArg]) { setContext(cdArg); response = `>> 进入项目: ${PROJECTS_CONFIG[cdArg].name}`; }
          else response = `❌ 找不到目录 '${cdArg}' 喵！`;
          break;
        case 'status':
          if (context !== 'home' && realData) {
            response = `📊 [REALTIME] GitHub: ${realData.github.lastCommit} | Vercel: ${realData.vercel.status}`;
          } else {
            response = "🌡️ 系统状态: 系统运行平稳，等待进入项目...";
          }
          break;
        case 'clear':
          setLogs(["[日志已清空]"]); return;
        case 'whoami':
          response = adminToken ? "👑 ROOT (Administrator)" : "👤 GUEST (Read-Only)";
          break;
        case 'system':
          if (args[1]?.toLowerCase() === 'reboot') {
            setLogs(prev => [...prev, "🔄 System rebooting..."]);
            setTimeout(() => window.location.reload(), 500);
            return;
          }
          response = `❌ 未知 system 参数: ${args[1]}`;
          break;
        case 'ping':
          response = `🏓 Pong! ${Math.floor(Math.random() * 50) + 10}ms`;
          break;
        case 'date':
          response = `🕒 ${new Date().toLocaleString()}`;
          break;
        case 'echo':
          response = args.slice(1).join(' ');
          break;
        case 'domain':
          if (context === 'home') { response = "❌ 请先进入具体项目再操作域名 (示例: cd magic)"; break; }
          if (args[1] === 'ls') {
            if (vercelDomains.length === 0) { response = "📭 当前项目未绑定任何域名喵。"; }
            else {
              response = "🌐 Vercel 域名列表:\n" + vercelDomains.map(d => `  - ${d.name} [${d.verified ? 'VERIFIED' : 'PENDING'}]`).join('\n');
            }
          } else if (args[1] === 'add') {
            if (!adminToken) { response = "权限不足，请先 login。"; break; }
            const dom = args[2];
            if (!dom) { response = "用法: domain add <域名>"; break; }
            setLogs(prev => [...prev, `[CLI] 正在请求绑定 ${dom}...`]);
            try {
              const res = await fetch('/api/vercel-domains/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ project: context, domain: dom, ali_dns_root: PROJECTS_CONFIG[context]?.ali_dns })
              });
              if (res.ok) { response = `[CLI] 域名 ${dom} 成功注入并解析！`; fetch('/api/vercel-domains?project=' + context).then(r => r.json()).then(d => { if (Array.isArray(d.domains)) setVercelDomains(d.domains); }); }
              else response = `[CLI] ❌ 添加失败。`;
            } catch (e) { response = `[CLI] ❌ 接口异常。`; }
          } else if (args[1] === 'rm') {
            if (!adminToken) { response = "权限不足，请先 login。"; break; }
            const dom = args[2];
            if (!dom) { response = "用法: domain rm <域名>"; break; }
            setLogs(prev => [...prev, `[CLI] 正在解绑 ${dom}...`]);
            setVercelDomains(prev => prev.filter(d => d.name !== dom));
            try {
              const res = await fetch(`/api/vercel-domains/delete?domain=${encodeURIComponent(dom)}&project=${context}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` } });
              if (res.ok) response = `[CLI] 域名 ${dom} 成功解绑！`;
              else { response = `[CLI] ❌ 删除失败。`; fetch('/api/vercel-domains?project=' + context).then(r => r.json()).then(d => { if (Array.isArray(d.domains)) setVercelDomains(d.domains); }); }
            } catch (e) { response = `[CLI] ❌ 接口异常。`; }
          } else {
            response = "用法: domain ls | add <域名> | rm <域名>";
          }
          break;
        case 'file':
          if (context === 'home') { response = "❌ 请先进入具体项目再操作文件"; break; }
          const repo = PROJECTS_CONFIG[context].github_repo;
          if (args[1] === 'ls') {
            if (githubFiles.length === 0) { response = "📭 当前仓库没有任何文件喵。"; }
            else {
              response = "📁 仓库文件列表:\n" + githubFiles.map(f => `  - ${f.name} [${f.size} B]`).join('\n');
            }
          } else if (args[1] === 'rm') {
            if (!adminToken) { response = "权限不足，请先 login。"; break; }
            const fname = args[2];
            if (!fname) { response = "用法: file rm <文件名>"; break; }
            const target = githubFiles.find(f => f.path === fname || f.name === fname);
            if (!target) { response = `❌ 找不到文件 ${fname}`; break; }
            setLogs(prev => [...prev, `[CLI] 正在删除文件 ${fname}...`]);
            setGithubFiles(prev => prev.filter(f => f.path !== target.path));
            try {
              const res = await fetch(`/api/github-files/delete`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo, path: target.path, sha: target.sha })
              });
              if (res.ok) response = `[CLI] 文件 ${fname} 删除成功！`;
              else { response = `[CLI] ❌ 删除失败。`; fetch(`/api/github-files?repo=${repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); }); }
            } catch (e) { response = `[CLI] ❌ 接口异常。`; }
          } else if (args[1] === 'mv') {
            if (!adminToken) { response = "权限不足，请先 login。"; break; }
            const oldPath = args[2];
            const newPath = args[3];
            if (!oldPath || !newPath) { response = "用法: file mv <旧文件名> <新文件名>"; break; }
            const target = githubFiles.find(f => f.path === oldPath || f.name === oldPath);
            if (!target) { response = `❌ 找不到文件 ${oldPath}`; break; }
            setLogs(prev => [...prev, `[CLI] 将 ${oldPath} 重命名为 ${newPath}...`]);
            setGithubFiles(prev => prev.map(f => f.path === target.path ? { ...f, name: newPath, path: newPath } : f));
            try {
              const res = await fetch(`/api/github-files/rename`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo, oldPath: target.path, newPath, sha: target.sha })
              });
              if (res.ok) { response = `[CLI] 重命名成功！`; fetch(`/api/github-files?repo=${repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); }); }
              else { response = `[CLI] ❌ 重命名失败。`; fetch(`/api/github-files?repo=${repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); }); }
            } catch (e) { response = `[CLI] ❌ 接口异常。`; }
          } else if (args[1] === 'upload') {
            if (!adminToken) { response = "权限不足，请先 login。"; break; }
            const fname = args[2];
            if (!fname) { response = "用法: file upload <文件名> <内容>"; break; }
            const content = args.slice(3).join(' ');
            if (!content) { response = "❌ 内容不能为空！"; break; }
            setLogs(prev => [...prev, `[CLI] 上传 ${fname} 到代码库...`]);
            try {
              const res = await fetch('/api/github-upload', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ repo, filename: fname, content })
              });
              if (res.ok) { response = `[CLI] 上传成功！`; fetch(`/api/github-files?repo=${repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); }); }
              else response = `[CLI] ❌ 上传失败。`;
            } catch (e) { response = `[CLI] ❌ 接口异常。`; }
          } else {
            response = "用法: file ls | rm <文件> | mv <旧> <新> | upload <文件名> <内容>";
          }
          break;
        case 'help':
          response = "📖 系统指令:\n - 基础: ls, cd [项目名], status, clear, help\n - 系统: whoami, system reboot, ping, date, echo\n - 域名: domain [ls|add|rm]\n - 文件: file [ls|rm|mv|upload]";
          break;
        default:
          response = `❌ 未知指令: ${cmd}, 输入 help 查看所有指令`;
      }

      if (response) {
        if (response.includes('\n')) {
          setLogs(prev => [...prev, ...response.split('\n')]);
        } else {
          setLogs(prev => [...prev, response]);
        }
      }
    }
  };

  const runSqlCmd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const sql = sqlCmd.trim();
      if (!sql) return;
      if (!adminToken) {
        setSqlError("等待获取控制核心权限喵...");
        return;
      }
      setLogs(prev => [...prev, `[SQL_EDITOR] ${sql}`]);
      setSqlCmd("");
      setSqlError(null);
      setSqlResult(null);

      try {
        const res = await fetch('/api/sql-run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ sql }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSqlError(data.error || 'SQL 执行失败喵...');
          if (res.status === 401) {
            setAdminToken(null);
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('ZERO_ADMIN_TOKEN');
            }
          }
          return;
        }
        if (Array.isArray(data.rows)) {
          setSqlResult(data.rows);
        } else {
          setSqlResult([]);
        }
      } catch (err) {
        setSqlError('SQL 接口调用异常喵...');
      }
    }
  };

  const uploadToGithub = async () => {
    if (!adminToken) {
      setGhUploadMsg("未能检测到认证密钥，需要先对接控制核心喵...");
      return;
    }
    if (!context || context === 'home') {
      setGhUploadMsg("请先在左侧选择一个具体项目喵...");
      return;
    }
    const proj = PROJECTS_CONFIG[context];
    if (!proj?.github_repo) {
      setGhUploadMsg("当前项目没有配置 github_repo 喵...");
      return;
    }
    const filename = ghFilename.trim();
    if (!filename) {
      setGhUploadMsg("文件名不能为空喵...");
      return;
    }
    if (ghUploadMode === 'text' && !ghContent.trim()) {
      setGhUploadMsg("文件内容不能为空喵...");
      return;
    }
    if (ghUploadMode === 'file' && !ghFileBase64) {
      setGhUploadMsg("请选择上传的文件喵...");
      return;
    }

    setGhUploading(true);
    setGhUploadMsg(null);
    try {
      const payload: any = { repo: proj.github_repo, filename };
      if (ghUploadMode === 'text') {
        payload.content = ghContent;
      } else {
        payload.base64 = ghFileBase64;
      }

      const res = await fetch('/api/github-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setGhUploadMsg(data.error || '上传失败喵...');
        if (res.status === 401) {
          setAdminToken(null);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('ZERO_ADMIN_TOKEN');
          }
        }
        return;
      }
      setGhUploadMsg("上传成功喵！");
      setLogs(prev => [...prev, `[GITHUB] 已上传 ${filename} 到 ${proj.github_repo}`]);
      setGhFilename("");
      setGhContent("");
      setGhFileBase64("");
    } catch (e) {
      setGhUploadMsg("GitHub 上传接口异常喵...");
    } finally {
      setGhUploading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!adminToken) {
      setDomainAddMsg("需要核心控制权限喵...");
      return;
    }
    const domain = newDomain.trim();
    if (!domain) {
      setDomainAddMsg("请输入要添加的域名喵...");
      return;
    }
    const ali_dns_root = PROJECTS_CONFIG[context]?.ali_dns;
    if (!ali_dns_root) {
      setDomainAddMsg("当前项目未配置 ali_dns，无法自动解析喵...");
      return;
    }

    setDomainAdding(true);
    setDomainAddMsg(null);
    try {
      const res = await fetch('/api/vercel-domains/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ project: context, domain, ali_dns_root })
      });
      const data = await res.json();
      if (!res.ok) {
        setDomainAddMsg(data.error || '添加失败喵...');
        if (res.status === 401) {
          setAdminToken(null);
          if (typeof window !== 'undefined') window.localStorage.removeItem('ZERO_ADMIN_TOKEN');
        }
        return;
      }
      setDomainAddMsg("✅ 域名添加并解析成功喵！");
      setLogs(prev => [...prev, `[VERCEL] 成功绑定域名 ${domain} 并设置 CNAME 解析！`]);
      setNewDomain("");

      // 重新拉取域名列表
      setTimeout(() => {
        fetch('/api/vercel-domains?project=' + context)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d.domains)) setVercelDomains(d.domains); });
      }, 2000);

    } catch (e) {
      setDomainAddMsg("请求接口异常喵...");
    } finally {
      setDomainAdding(false);
    }
  };

  const handleDeleteDomain = async (domain: string) => {
    if (!adminToken) return;
    if (!confirm(`您确定要删除域名 ${domain} 吗？`)) return;
    if (!confirm(`警告：删除后将无法通过此域名访问网站，确认继续？（不可逆）`)) return;

    // Optimistic Update
    setVercelDomains(prev => prev.filter(d => d.name !== domain));
    setLogs(prev => [...prev, `[VERCEL] 正在请求解除绑定 ${domain}...`]);

    try {
      const res = await fetch(`/api/vercel-domains/delete?domain=${encodeURIComponent(domain)}&project=${context}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setLogs(prev => [...prev, `[ERROR] ${data.error || '删除域名失败喵...'}`]);
        if (res.status === 401) setAdminToken(null);
        fetch('/api/vercel-domains?project=' + context).then(r => r.json()).then(d => { if (Array.isArray(d.domains)) setVercelDomains(d.domains); });
        return;
      }
      setLogs(prev => [...prev, `[VERCEL] 域名 ${domain} 已成功解绑！`]);
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] 删除接口异常喵...`]);
      fetch('/api/vercel-domains').then(r => r.json()).then(d => { if (Array.isArray(d.domains)) setVercelDomains(d.domains); });
    }
  };

  const handleDeleteFile = async (path: string, sha: string) => {
    if (!adminToken) return;
    if (!confirm(`您确定要彻底删除文件 ${path} 吗？`)) return;

    // Optimistic Update
    setGithubFiles(prev => prev.filter(f => f.path !== path));
    setLogs(prev => [...prev, `[GITHUB] 正在删除文件 ${path}...`]);

    try {
      const proj = PROJECTS_CONFIG[context];
      const res = await fetch(`/api/github-files/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: proj.github_repo, path, sha })
      });
      if (!res.ok) {
        setLogs(prev => [...prev, `[ERROR] 文件删除失败喵...`]);
        if (res.status === 401) setAdminToken(null);
        fetch(`/api/github-files?repo=${proj.github_repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); });
        return;
      }
      setLogs(prev => [...prev, `[GITHUB] 文件 ${path} 删除成功！`]);
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] 文件删除接口异常...`]);
      fetch(`/api/github-files?repo=${PROJECTS_CONFIG[context].github_repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); });
    }
  };

  const handleRenameFile = async (oldPath: string, sha: string) => {
    if (!adminToken) return;
    const newPath = prompt(`请输入 ${oldPath} 的新文件名：`, oldPath);
    if (!newPath || newPath === oldPath) return;

    // Optimistic Update
    setGithubFiles(prev => prev.map(f => f.path === oldPath ? { ...f, name: newPath, path: newPath } : f));
    setLogs(prev => [...prev, `[GITHUB] 正在将文件 ${oldPath} 重命名为 ${newPath}...`]);

    try {
      const proj = PROJECTS_CONFIG[context];
      const res = await fetch(`/api/github-files/rename`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: proj.github_repo, oldPath, newPath, sha })
      });
      if (!res.ok) {
        setLogs(prev => [...prev, `[ERROR] 文件重命名失败喵...`]);
        if (res.status === 401) setAdminToken(null);
        fetch(`/api/github-files?repo=${proj.github_repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); });
        return;
      }
      setLogs(prev => [...prev, `[GITHUB] 文件重命名成功！`]);
      // 拉取最新列表以获取新的 SHA 
      fetch(`/api/github-files?repo=${proj.github_repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); });
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] 文件重命名接口异常...`]);
      fetch(`/api/github-files?repo=${PROJECTS_CONFIG[context].github_repo}`).then(r => r.json()).then(d => { if (Array.isArray(d.files)) setGithubFiles(d.files); });
    }
  };

  const handleGhFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setGhFileBase64("");
      return;
    }
    setGhFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl && dataUrl.includes(',')) {
        setGhFileBase64(dataUrl.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);

  };

  return (
    <div className="h-screen bg-[#050506] text-zinc-300 font-mono flex flex-col overflow-hidden selection:bg-pink-500/30">

      {/* 顶部状态栏 */}
      <header className="h-10 bg-[#0c0c0e] border-b border-zinc-800 flex items-center justify-between px-3 md:px-6 text-[10px] font-bold tracking-widest text-zinc-500">
        <div className="flex items-center gap-2 md:gap-4">
          <span>USER: <span className="text-pink-500">哥哥酱</span></span>
          <span className="opacity-30">|</span>
          <span>ENV: <span className="text-emerald-500">PROD</span></span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:inline">RAM: 8GB (OPT)</span>
          <span className="opacity-30 hidden md:inline">|</span>
          <span className="hidden sm:inline">UPTIME: 99.9%</span>
          <span className="opacity-30 hidden sm:inline">|</span>
          <button
            onClick={handleLogout}
            className="text-[10px] text-zinc-500 hover:text-pink-400 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* 侧边栏 (移动端变顶部导航) */}
        <aside className="w-full md:w-20 border-b md:border-b-0 md:border-r border-zinc-800 bg-[#08080a] flex flex-row md:flex-col items-center justify-center md:justify-start py-2 md:py-6 gap-2 md:gap-6 shadow-2xl z-10 overflow-x-auto">
          <button onClick={() => setContext('home')} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${context === 'home' ? 'bg-pink-500/20 border border-pink-500/50 text-white' : 'hover:bg-zinc-800 text-zinc-600'}`}>
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <div className="w-[1px] h-6 md:w-8 md:h-[1px] bg-zinc-800 shrink-0" />
          {Object.entries(PROJECTS_CONFIG).map(([id, p]: any) => (
            <button
              key={id} onClick={() => setContext(id)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all group relative shrink-0 ${context === id ? 'bg-zinc-800 border-b-4 md:border-b-0 md:border-l-4 border-pink-500 text-white' : 'hover:bg-zinc-800 text-zinc-600'}`}
            >
              <span className="text-lg md:text-xl">🪄</span>
              {/* 悬停提示 (仅 PC 端) */}
              <div className="absolute left-14 bg-black border border-zinc-800 px-3 py-1 rounded text-[10px] hidden md:group-hover:block whitespace-nowrap z-50 text-white shadow-xl">
                {p.name}
              </div>
            </button>
          ))}
        </aside>

        {/* 中央主工作区 */}
        <main className="flex-1 bg-[#050506] p-4 md:p-10 overflow-y-auto relative">
          {context === 'home' ? (
            /* --- 全局主页 --- */
            <section className="animate-in fade-in duration-500 max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">SYSTEM_ROOT</h1>
                <button
                  onClick={() => setShowChangelog(true)}
                  className="text-[12px] px-2 py-0.5 rounded-full bg-zinc-900 border border-pink-500/40 text-pink-400 hover:bg-zinc-800 hover:border-pink-300 transition-colors shadow-lg cursor-pointer"
                  title="查看完整系统更新日志"
                >
                  v1.3.0 ✨
                </button>
              </div>
              <p className="text-zinc-500 mb-6 md:mb-10 text-sm md:text-base">欢迎回来，哥哥。所有数据分析大盘模块运行正常。</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
                <GlobalCard label="PROJECTS" value={Object.keys(PROJECTS_CONFIG).length} sub="Active Repos" />
                <GlobalCard label="API STATUS" value="ONLINE" sub="Connected" color="text-green-400" />
                <GlobalCard label="CPU" value={systemInfo ? `${systemInfo.cpu.usage}%` : '...'} sub={systemInfo ? `${systemInfo.cpu.cores} Cores` : 'Loading'} color="text-orange-400" />
                <GlobalCard label="MEMORY" value={systemInfo ? `${systemInfo.memory.usagePercent}%` : '...'} sub={systemInfo ? `${(systemInfo.memory.used / 1073741824).toFixed(1)}GB / ${(systemInfo.memory.total / 1073741824).toFixed(1)}GB` : 'Loading'} color="text-blue-400" />
              </div>

              {/* 系统信息面板 */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 mb-6">
                <div className="text-[10px] text-zinc-500 uppercase font-bold mb-4 tracking-widest">System_Hardware_Info</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 shrink-0">Machine ID</span><span className="text-pink-400 font-mono truncate ml-2">{systemInfo?.machine?.id || '...'}</span></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 shrink-0">Hostname</span><span className="text-white font-mono truncate ml-2">{systemInfo?.machine?.hostname || '...'}</span></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 shrink-0">Platform</span><span className="text-white truncate ml-2">{systemInfo?.machine?.platform || '...'} ({systemInfo?.machine?.arch || '...'})</span></div>
                    <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 shrink-0">Node.js</span><span className="text-emerald-400 truncate ml-2">{systemInfo?.machine?.nodeVersion || '...'}</span></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 shrink-0">CPU Model</span><span className="text-white font-mono text-[11px] truncate ml-2">{systemInfo?.cpu?.model || '...'}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-zinc-500">CPU Usage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${systemInfo?.cpu?.usage || 0}%` }} /></div>
                        <span className="text-orange-400">{systemInfo?.cpu?.usage || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs"><span className="text-zinc-500">Memory</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${systemInfo?.memory?.usagePercent || 0}%` }} /></div>
                        <span className="text-blue-400">{systemInfo?.memory?.usagePercent || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs"><span className="text-zinc-500">Uptime</span><span className="text-white">{systemInfo ? `${Math.floor(systemInfo.machine.uptime / 3600)}h ${Math.floor((systemInfo.machine.uptime % 3600) / 60)}m` : '...'}</span></div>
                  </div>
                </div>
              </div>


              {/* 科协网盘更新日志 */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">💽</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Netdisk_Changelog_Stream</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600">Display_Count:</span>
                    <select
                      value={panChangelogLimit}
                      onChange={(e) => setPanChangelogLimit(Number(e.target.value))}
                      className="bg-black/40 border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-zinc-400 outline-none focus:border-pink-500 transition-colors"
                    >
                      <option value="5">5 Logs</option>
                      <option value="10">10 Logs</option>
                      <option value="20">20 Logs</option>
                      <option value="999">All Logs</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {panChangelog.length === 0 ? (
                    <div className="text-xs text-zinc-600 animate-pulse py-4">⏳ 正在同步网盘变更数据...</div>
                  ) : (
                    panChangelog.slice(0, panChangelogLimit).map((log, idx) => (
                      <div key={idx} className="relative pl-5 border-l border-zinc-800 py-1 hover:bg-zinc-800/20 transition-colors rounded-r">
                        <div className="absolute w-1.5 h-1.5 bg-blue-500/50 rounded-full -left-[3.5px] top-3"></div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-blue-400 font-mono">v{log.version}</span>
                          <span className="text-[9px] text-zinc-600 font-mono bg-zinc-900 px-1 rounded">{log.date}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{log.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>


              {/* 大文件下载方式选择弹窗 */}
              {alistDownloadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setAlistDownloadModal(null)}>
                  <div className="w-full max-w-sm bg-[#0c0c0e] border border-zinc-700 rounded-2xl p-4 shadow-2xl mx-4 glow-pink animate-in" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">大文件下载 ≥20MB</div>
                        <div className="text-xs text-white font-mono truncate max-w-[260px] mt-1">{alistDownloadModal.name}</div>
                      </div>
                      <button onClick={() => setAlistDownloadModal(null)} className="text-zinc-600 hover:text-zinc-300 text-lg">✕</button>
                    </div>

                    <div className="space-y-2">
                      {/* Cloudflare Workers 边缘代理 (方法1) */}
                      <button
                        onClick={() => {
                          setAlistMsg('⏳ 正在连接 cf.ryantan.fun 代理节点...');
                          fetch('/api/alist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'get', path: alistDownloadModal!.filePath }),
                          }).then(r => r.json()).then(data => {
                            if (data.code === 200 && data.data?.raw_url) {
                              const cfUrl = `https://cf.ryantan.fun/?url=${encodeURIComponent(data.data.raw_url)}`;
                              window.location.href = cfUrl;
                            } else {
                              setAlistMsg('❌ 获取直链失败');
                            }
                          }).catch(() => setAlistMsg('❌ 接口异常'));
                          setAlistDownloadModal(null);
                        }}
                        className="w-full flex items-center justify-between transition-all duration-300 bg-zinc-900 border rounded-xl px-4 py-3 text-left hover:scale-[1.02] active:scale-[0.98] group"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                          borderColor: 'rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <div>
                          <div className="text-[12px] font-bold text-blue-400 group-hover:text-blue-300 transition-colors">🌟 Cloudflare 边缘加速 (强烈推荐)</div>
                          <div className="text-[10px] text-zinc-500">通过海外节点无痕中转，全球加速，不耗服务器流量</div>
                        </div>
                        <div className="text-blue-500/30 group-hover:text-blue-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        </div>
                      </button>

                      {/* 复制直链 (方法2) */}
                      <button
                        onClick={() => {
                          fetch('/api/alist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
                            body: JSON.stringify({ action: 'get', path: alistDownloadModal.filePath }),
                          }).then(r => r.json()).then(data => {
                            if (data.code === 200 && data.data?.raw_url) {
                              navigator.clipboard.writeText(data.data.raw_url);
                              setAlistMsg('✅ 百度CDN真实直链已复制！粘贴到IDM/NDM即可满速下载');
                            } else {
                              const sign = data.code === 200 ? (data.data?.sign || '') : '';
                              const url = sign ? `${ALIST_BASE}/d${alistDownloadModal!.filePath}?sign=${sign}` : `${ALIST_BASE}/d${alistDownloadModal!.filePath}`;
                              navigator.clipboard.writeText(url);
                              setAlistMsg('✅ 链接已复制（备用）');
                            }
                          }).catch(() => {
                            navigator.clipboard.writeText(`${ALIST_BASE}/d${alistDownloadModal!.filePath}`);
                            setAlistMsg('✅ 链接已复制');
                          });
                          setAlistDownloadModal(null);
                        }}
                        className="w-full flex items-center justify-between bg-zinc-900 border rounded-xl px-4 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left group"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                          borderColor: 'rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <div>
                          <div className="text-[12px] font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">🚀 复制直链 (迅雷/IDM/NDM)</div>
                          <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400">搭配 IDM/NDM 并设置 UA 为 pan.baidu.com 可满速</div>
                        </div>
                        <div className="text-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </div>
                      </button>

                      {/* 自动加UA直接下载 (方法3 - 可禁用) */}
                      <button
                        onClick={() => {
                          if (globalDisableThird) return;
                          const downloadUrl = `/api/alist-download?path=${encodeURIComponent(alistDownloadModal.filePath)}`;
                          window.open(downloadUrl, '_blank');
                          setAlistDownloadModal(null);
                        }}
                        disabled={globalDisableThird}
                        className={`w-full flex items-center justify-between transition-all bg-zinc-900 border rounded-lg px-3 py-2.5 text-left ${globalDisableThird ? 'border-zinc-800 opacity-50 cursor-not-allowed' : 'border-pink-500/40 hover:border-pink-400'}`}
                      >
                        <div>
                          <div className={`text-[11px] font-bold ${globalDisableThird ? 'text-zinc-500' : 'text-pink-400'}`}>
                            🔥 服务器直接下载 {globalDisableThird ? '(已被系统禁用)' : '(备用)'}
                          </div>
                          <div className="text-[10px] text-zinc-500">消耗服务器流量，服务器注入 UA 授权</div>
                          {vercelUsage && vercelUsage.metrics && vercelUsage.metrics.fastOriginTransfer && (
                             <div className="text-[9px] text-zinc-600 mt-1">
                               ⚡ Vercel Fast Origin Transfer: {(vercelUsage.metrics.fastOriginTransfer.value / 1073741824).toFixed(2)}GB / 100GB
                             </div>
                          )}
                        </div>
                      </button>

                      {/* ⚡ 302 直链 (方法4) */}
                      <button
                        onClick={() => { alistDirectDownload(alistDownloadModal.filePath, alistDownloadModal.sign); setAlistDownloadModal(null); }}
                        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 hover:border-zinc-600 transition-colors text-left"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-zinc-400">⚡ 302直链跳转（不加UA）</div>
                          <div className="text-[10px] text-zinc-600">直接跳转百度CDN，大文件可能被拦截</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 文件预览弹窗 */}
              {(previewItemMeta) && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => { setPreviewFile(null); setPreviewText(''); setPreviewItemMeta(null); setPreviewStarted(false); }}>
                  <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-zinc-800" style={{ background: '#0a0a0b' }} onClick={e => e.stopPropagation()}>
                    {/* 顶部栏 */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0 bg-black/60">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base shrink-0">
                          {previewItemMeta?.type === 'image' ? '🖼️' : previewItemMeta?.type === 'video' ? '🎬' : previewItemMeta?.type === 'pdf' ? '📄' : previewItemMeta?.type === 'archive' ? '📦' : '📝'}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-zinc-200 truncate">{previewItemMeta?.name || '加载中...'}</h3>
                          <div className="text-[10px] text-zinc-500">
                            {previewItemMeta?.size ? `${(previewItemMeta.size / 1024 / 1024).toFixed(2)} MB` : ''} · 在线预览
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {previewItemMeta && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const isBaidu = alistPath.startsWith('/百度网盘') || alistPath.startsWith('/baidu');
                              const isAliyun = alistPath.startsWith('/阿里云盘') || alistPath.startsWith('/aliyun');
                              if (isBaidu && (previewItemMeta.size || 0) >= SIZE_THRESHOLD) {
                                setAlistDownloadModal({ name: previewItemMeta.name, filePath: previewItemMeta.filePath, sign: previewItemMeta.sign });
                              } else if (isBaidu || isAliyun) {
                                alistProxyDownload(previewItemMeta.filePath, previewItemMeta.name);
                              } else {
                                alistDirectDownload(previewItemMeta.filePath, previewItemMeta.sign);
                              }
                              setPreviewFile(null); setPreviewText(''); setPreviewItemMeta(null); setPreviewStarted(false);
                            }}
                            className="text-[10px] font-bold px-3 py-1.5 rounded bg-pink-500 text-white hover:bg-pink-400 transition-colors"
                          >
                            ⬇️ 下载
                          </button>
                        )}
                        <button onClick={() => { setPreviewFile(null); setPreviewText(''); setPreviewItemMeta(null); setPreviewStarted(false); }} className="hover:text-white text-zinc-500 transition-colors p-1 text-lg">✕</button>
                      </div>
                    </div>
                    
                    {/* 预览主体 */}
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4" style={{ background: '#050506' }}>
                      {!previewStarted ? (
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="text-zinc-500 text-sm">点击下方按钮开始加载并预览文件</div>
                          <button onClick={loadPreviewContent} className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all">
                            ▶️ 点击加载预览
                          </button>
                        </div>
                      ) : previewLoading && !previewFile ? (
                        <div className="text-zinc-500 text-xs animate-pulse">⏳ 正在加载预览...</div>
                      ) : previewFile?.type === 'image' ? (
                        <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[78vh] object-contain rounded-lg" />
                      ) : previewFile?.type === 'video' ? (
                        <video src={previewFile.url} controls autoPlay className="max-w-full max-h-[78vh] rounded-lg" style={{ outline: 'none' }} />
                      ) : previewFile?.type === 'pdf' ? (
                        <iframe src={previewFile.url} className="w-full h-[78vh] rounded-lg border-0 bg-white" title={previewFile.name} />
                      ) : previewFile?.type === 'text' ? (
                        <pre className="w-full h-full overflow-auto text-xs leading-relaxed text-zinc-400 font-mono p-5 rounded-lg whitespace-pre-wrap break-words" style={{ background: '#0d0d0e', maxHeight: '78vh' }}>
                          {previewText || '加载中...'}
                        </pre>
                      ) : previewFile?.type === 'archive' ? (
                        <div className="w-full h-full overflow-auto flex flex-col items-center justify-center text-xs text-zinc-400 p-5 rounded-lg" style={{ background: '#0d0d0e', maxHeight: '78vh' }}>
                          <div className="font-bold text-sm mb-4 text-emerald-400 flex items-center gap-2"><span>📦</span> 压缩包内容预览</div>
                          <div className="text-zinc-500 whitespace-pre-wrap text-center">{previewText}</div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* 更新日志弹窗 */}
              {showChangelog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowChangelog(false)}>
                  <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-pink-500">📝</span>
                        <h3 className="text-sm font-bold text-zinc-200">更新日志 <span className="text-zinc-500 font-normal text-xs ml-1">Changelog</span></h3>
                      </div>
                      <button onClick={() => setShowChangelog(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-6">
                      <div className="space-y-3">
                        {CHANGELOG_DATA.map((log, index) => {
                          if (log.isMilestone) {
                            return (
                              <div key={log.commit + index} className="relative pl-5 border-l-2 border-pink-500/40 py-2 mt-4 first:mt-0">
                                <div className="absolute w-2.5 h-2.5 bg-pink-500 rounded-full left-[calc(-0.4rem)] top-3 ring-4 ring-zinc-950 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                                <div className="flex items-end gap-2 mb-1.5 pt-0.5">
                                  <span className="text-sm font-black text-pink-400 tracking-wide">{log.version}</span>
                                  <span className="text-[10px] bg-zinc-800/80 px-1 py-0.5 rounded font-mono text-zinc-500">{log.commit}</span>
                                  <span className="text-[10px] text-zinc-600 font-mono mb-[1px]">{log.date}</span>
                                </div>
                                <div className="text-[12px] text-zinc-300 font-medium mb-1 line-clamp-2 pr-2 leading-relaxed">
                                  {log.message}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={log.commit + index} className="relative pl-5 border-l-2 border-zinc-800/80 py-1.5">
                              <div className="absolute w-1.5 h-1.5 bg-zinc-700 rounded-full left-[calc(-0.25rem)] top-2.5 ring-2 ring-zinc-950"></div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold text-zinc-400">{log.version}</span>
                                <span className="text-[9px] text-zinc-500 font-mono">{log.commit}</span>
                                <span className="text-[9px] text-zinc-600 font-mono">{log.date}</span>
                              </div>
                              <div className="text-[11px] text-zinc-400 leading-tight pr-2">
                                {log.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cloud_Drive 网盘面板 */}

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* 头部 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest uppercase italic text-zinc-500">Cloud_Drive</span>
                    <span className="text-[10px] text-zinc-600">· AList</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {adminToken && (
                      <>
                        <button
                          onClick={() => setAlistShowMkdir(!alistShowMkdir)}
                          className="text-[10px] text-zinc-500 hover:text-pink-400 transition-colors px-2 py-1 border border-zinc-800 rounded"
                          title="新建文件夹"
                        >+ 文件夹</button>
                        <label className="text-[10px] text-zinc-500 hover:text-pink-400 transition-colors px-2 py-1 border border-zinc-800 rounded cursor-pointer" title="上传文件">
                          {alistUploading ? '上传中...' : '↑ 上传'}
                          <input type="file" className="hidden" onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) { setAlistUploadFile(f); }
                          }} />
                        </label>
                      </>
                    )}
                    <button onClick={() => alistListDir(alistPath)} className="text-zinc-600 hover:text-pink-400 transition-colors" title="刷新">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                </div>

                {/* 面包屑路径 */}
                <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800/50 overflow-x-auto">
                  {alistPath.split('/').filter(Boolean).length === 0 ? (
                    <span className="text-pink-400 text-[11px] font-mono font-bold">/ Root</span>
                  ) : (
                    ['', ...alistPath.split('/').filter(Boolean)].map((seg, idx, arr) => {
                      const crumbPath = '/' + arr.slice(1, idx + 1).join('/');
                      return (
                        <span key={idx} className="flex items-center gap-1">
                          {idx > 0 && <span className="text-zinc-700">/</span>}
                          <button
                            onClick={() => alistListDir(idx === 0 ? '/' : crumbPath)}
                            className={`text-[11px] font-mono hover:text-pink-400 transition-colors whitespace-nowrap ${idx === arr.length - 1 ? 'text-white font-bold' : 'text-zinc-500'}`}
                          >
                            {idx === 0 ? 'Root' : seg}
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* 新建文件夹输入框 */}
                {alistShowMkdir && (
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/60">
                    <input
                      value={alistMkdirName}
                      onChange={e => setAlistMkdirName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && alistMkdir()}
                      placeholder="新建文件夹名称..."
                      className="flex-1 bg-black/40 border border-zinc-700 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-pink-500 transition-colors"
                      autoFocus
                    />
                    <button onClick={alistMkdir} className="px-2 py-1 text-[10px] bg-pink-500 text-white rounded font-bold hover:bg-pink-400">创建</button>
                    <button onClick={() => { setAlistShowMkdir(false); setAlistMkdirName(''); }} className="px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300">取消</button>
                  </div>
                )}

                {/* 待上传文件确认 */}
                {alistUploadFile && (
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/60">
                    <span className="text-[11px] text-zinc-400 flex-1 truncate">📎 {alistUploadFile.name}</span>
                    <button onClick={alistUpload} disabled={alistUploading} className="px-2 py-1 text-[10px] bg-pink-500 text-white rounded font-bold hover:bg-pink-400 disabled:opacity-50">
                      {alistUploading ? '上传中...' : '确认上传'}
                    </button>
                    <button onClick={() => setAlistUploadFile(null)} className="px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300">取消</button>
                  </div>
                )}

                {/* 消息提示 */}
                {alistMsg && (
                  <div className={`px-4 py-1.5 text-[11px] font-bold border-b border-zinc-800/50 ${alistMsg.startsWith('✅') ? 'text-green-400 bg-green-500/5' : alistMsg.startsWith('🚀') ? 'text-blue-400 bg-blue-500/5' : 'text-yellow-400 bg-yellow-500/5'}`}>
                    {alistMsg}
                  </div>
                )}



                {/* 文件列表 */}
                <div className="max-h-96 overflow-y-auto">
                  {alistLoading ? (
                    <div className="flex items-center justify-center py-16 text-zinc-600 text-sm">
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Loading...
                    </div>
                  ) : alistError ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <span className="text-red-400 text-[11px]">{alistError}</span>
                      <button onClick={() => alistListDir(alistPath)} className="text-[10px] text-zinc-500 hover:text-pink-400 border border-zinc-700 px-2 py-1 rounded">重试</button>
                    </div>
                  ) : alistFiles.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-zinc-600 text-xs">📭 空目录</div>
                  ) : (
                    <div className="divide-y divide-zinc-800/50">
                      {/* 返回上级 */}
                      {alistPath !== '/' && (
                        <button
                          onClick={() => {
                            const parent = alistPath.replace(/\/[^/]+\/?$/, '') || '/';
                            alistListDir(parent);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/60 transition-colors text-left"
                        >
                          <span className="text-base">⬆️</span>
                          <span className="text-[11px] text-zinc-500 font-mono">..</span>
                        </button>
                      )}

                      {alistFiles.map((file: any, idx: number) => {
                        const filePath = `${alistPath.replace(/\/+$/, '')}/${file.name}`;
                        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(file.name);
                        const isVideo = /\.(mp4|mkv|avi|mov|webm)$/i.test(file.name);
                        const isAudio = /\.(mp3|flac|wav|ogg|aac)$/i.test(file.name);
                        const icon = file.is_dir ? '📁' : isImage ? '🖼️' : isVideo ? '🎬' : isAudio ? '🎵' : '📄';

                        return (
                          <div key={idx} className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800/40 transition-colors group">
                            {/* 复选框 */}
                            {!file.is_dir && (
                              <input
                                type="checkbox"
                                checked={alistSelected.has(file.name)}
                                onChange={() => alistToggleSelect(file.name)}
                                className="w-3 h-3 accent-pink-500 shrink-0 cursor-pointer"
                              />
                            )}
                            {file.is_dir && <span className="w-3 shrink-0" />}
                            {/* 缩略图或图标 */}
                            <span className="text-base shrink-0">{icon}</span>

                            {/* 重命名状态 */}
                            {alistRenaming === filePath ? (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  value={alistNewName}
                                  onChange={e => setAlistNewName(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') alistRename(filePath); if (e.key === 'Escape') setAlistRenaming(null); }}
                                  className="flex-1 bg-black/60 border border-zinc-700 rounded px-2 py-0.5 text-[11px] text-white outline-none focus:border-pink-500"
                                  autoFocus
                                />
                                <button onClick={() => alistRename(filePath)} className="text-[10px] text-pink-400 font-bold hover:text-pink-300">✓</button>
                                <button onClick={() => setAlistRenaming(null)} className="text-[10px] text-zinc-500 hover:text-zinc-300">✕</button>
                              </div>
                            ) : (
                              <>
                                {/* 文件名（可点击） */}
                                <button
                                  onClick={() => alistNavigate(file)}
                                  className="flex-1 text-left text-[11px] font-mono text-zinc-300 hover:text-pink-400 transition-colors truncate"
                                >
                                  {file.name}
                                </button>

                                {/* 文件大小 */}
                                {!file.is_dir && (
                                  <span className="text-[10px] text-zinc-600 shrink-0 hidden sm:block">
                                    {file.size >= 1073741824 ? `${(file.size / 1073741824).toFixed(1)}GB`
                                      : file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)}MB`
                                        : file.size >= 1024 ? `${Math.round(file.size / 1024)}KB`
                                          : `${file.size}B`}
                                  </span>
                                )}

                                {/* 修改时间 */}
                                <span className="text-[10px] text-zinc-700 shrink-0 hidden md:block">
                                  {file.modified ? new Date(file.modified).toLocaleDateString() : ''}
                                </span>

                                {/* 核心操作按钮 */}
                                {adminToken && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                      onClick={() => { setAlistRenaming(filePath); setAlistNewName(file.name); }}
                                      className="text-zinc-600 hover:text-blue-400 transition-colors p-0.5" title="重命名"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => alistRemove(file.name)}
                                      className="text-zinc-600 hover:text-red-500 transition-colors p-0.5" title="删除"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 底部状态栏 */}
                <div className="px-4 py-2 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-600 bg-black/20">
                  <div className="flex items-center gap-3">
                    <button onClick={alistSelectAll} className="hover:text-pink-400 transition-colors" title="全选/取消全选">
                      {alistSelected.size > 0 ? `☑ ${alistSelected.size} 个文件` : `${alistFiles.length} 个项目`}
                    </button>
                    {alistSelected.size > 0 && (
                      <button
                        onClick={alistBatchDownload}
                        className="text-[10px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
                      >
                        ↓ 批量下载
                      </button>
                    )}
                  </div>
                  <button onClick={() => window.open('http://47.108.222.119:5244', '_blank')} className="hover:text-pink-400 transition-colors">
                    在 AList 中打开 ↗
                  </button>
                </div>
              </div>

              <div className="border border-dashed border-zinc-800/50 rounded-2xl p-6 text-center">
                <p className="text-zinc-600 italic text-sm">请点击左侧图标或在终端输入 `cd magic` 进入项目控制台喵...</p>
              </div>

            </section>
          ) : (
            /* --- 项目详情页 (带真实数据！) --- */
            <section className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
              <header className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-pink-500 font-bold text-xs uppercase tracking-[0.3em]">
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                    Live_Connection
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 break-all">{activeProject.name}</h1>
                  <p className="text-zinc-500 text-xs md:text-sm font-mono break-all">{activeProject.domain}</p>
                </div>
                {/* 右上角的大状态徽章 */}
                <div className={`w-full sm:w-auto px-4 py-2 rounded-lg border text-sm font-bold flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center ${realData?.vercel?.status === 'READY' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                  <span>VERCEL STATUS</span>
                  <span className="text-lg md:text-xl">{loading ? 'LOADING...' : (realData?.vercel?.status || 'UNKNOWN')}</span>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* 左侧：真实数据监控卡片 */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase italic">Realtime_Telemetry</h2>

                  {/* GitHub 真实数据卡片 */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-600 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl icon-github"></div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">GitHub Latest Commit</div>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-zinc-800 rounded w-2/3"></div>
                    ) : (
                      <>
                        <div className="text-xl text-white font-bold mb-1 line-clamp-2">
                          "{realData?.github?.lastCommit || "暂无数据"}"
                        </div>
                        <div className="text-xs text-zinc-400 font-mono flex items-center gap-3">
                          <span>By: <span className="text-pink-400">{realData?.github?.author || "Ghost"}</span></span>
                          {realData?.github?.date && (
                            <span className="text-zinc-500">
                              {new Date(realData.github.date).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    {context === 'pan' && panChangelog.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/50">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2 flex justify-between">
                          <span>🚀 Latest Release Note</span>
                          <span className="text-zinc-600 font-mono">v{panChangelog[0].version}</span>
                        </div>
                        <div className="text-xs text-pink-400/80 leading-relaxed italic">
                          "{panChangelog[0].message}"
                        </div>
                      </div>
                    )}
                    {context === 'pan' && panActionLogs.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/50">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2 flex justify-between">
                          <span>📜 Latest Netdisk Action</span>
                          <span className="text-zinc-600 font-mono text-[9px]">
                            {new Date(panActionLogs[0].created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                          </span>
                        </div>
                        <div className="text-xs text-blue-400/90 font-sans">
                          {panActionLogs[0].username}: {panActionLogs[0].action_type} {panActionLogs[0].action_item}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vercel & DNS 混合卡片 */}
                  <div className="grid grid-cols-2 gap-4">
                    <MonitorItem
                      label="Deployment URL"
                      value={loading ? "..." : (realData?.vercel?.url || "Pending")}
                      color="bg-blue-500"
                    />
                    <MonitorItem
                      label="DNS Resolution"
                      value="Active"
                      color="bg-green-500"
                    />
                  </div>

                  {/* Vercel Domains 卡片 */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-3 flex items-center justify-between">
                      <span>Vercel_Domains</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600">Total: {vercelDomains.length}</span>
                        <button
                          onClick={() => { setVercelDomains([]); fetch('/api/vercel-domains?project=' + context).then(r => r.json()).then(d => { if (Array.isArray(d.domains)) setVercelDomains(d.domains); }); }}
                          className="text-zinc-600 hover:text-pink-400 transition-colors" title="刷新域名列表"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                      {vercelDomains.length === 0 ? (
                        <div className="animate-pulse h-6 bg-zinc-800 rounded w-full"></div>
                      ) : (
                        vercelDomains.map((domain: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-black/40 border border-zinc-800/80 rounded px-3 py-2 text-xs group">
                            <span className="text-zinc-300 font-mono truncate mr-2" title={domain.name}>{domain.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${domain.verified ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}`}>
                                {domain.verified ? 'VERIFIED' : 'PENDING'}
                              </span>
                              {adminToken && (
                                <button onClick={() => handleDeleteDomain(domain.name)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-1" title="删除域名">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* Add Domain Section */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`如: sub.${activeProject.ali_dns || 'domain.com'}`}
                          value={newDomain}
                          onChange={e => setNewDomain(e.target.value)}
                          className="flex-1 bg-black/40 border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-pink-500 transition-colors"
                        />
                        <button
                          onClick={handleAddDomain}
                          disabled={domainAdding}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold whitespace-nowrap ${domainAdding ? 'bg-zinc-800 text-zinc-500' : 'bg-pink-500 text-white hover:bg-pink-400'}`}
                        >
                          {domainAdding ? 'ADDING...' : '添加并解析'}
                        </button>
                      </div>
                      {domainAddMsg && (
                        <div className={`mt-2 text-[10px] ${domainAddMsg.includes('✅') ? 'text-green-400' : 'text-yellow-400'}`}>
                          {domainAddMsg}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 深度链接区 */}
                  <h2 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase italic pt-4">Deep_Link_Gates</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <DeepLink label="GITHUB REPO" sub={activeProject.github_repo} onClick={() => window.open(`https://github.com/${activeProject.github_repo}`)} />
                    <DeepLink label="VERCEL DASH" sub="项目控制台" onClick={() => window.open(`https://vercel.com/${activeProject.vercel_project}`)} />
                    <DeepLink label="ALI DNS" sub="解析设置" onClick={() => window.open(`https://dnsnext.console.aliyun.com/authoritative/domains/${activeProject.ali_dns}`)} />
                    <DeepLink label="PRODUCTION" sub="访问线上版" onClick={() => window.open(`https://${activeProject.domain}`)} className="sm:col-span-2 border-pink-500/50 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20" />
                  </div>

                  {/* GitHub 文件概览 */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-3 flex items-center justify-between">
                      <span>Repository_Files</span>
                      <span className="text-zinc-600">{activeProject.github_repo}</span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {githubFiles.length === 0 ? (
                        <div className="animate-pulse h-20 bg-zinc-800 rounded w-full"></div>
                      ) : (
                        githubFiles.map((file: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-black/40 border border-zinc-800/80 rounded px-3 py-2 text-xs hover:border-zinc-600 transition-colors group">
                            <span className="text-lg">{file.type === 'dir' ? '📁' : '📄'}</span>
                            <div className="flex-1 overflow-hidden">
                              <div className="text-zinc-300 font-mono truncate">{file.name}</div>
                              <div className="text-[10px] text-zinc-600">{file.size} Bytes</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => window.open(file.html_url)} className="text-zinc-600 hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" title="在 GitHub 中查看">
                                ↗
                              </button>
                              {adminToken && file.type === 'file' && (
                                <>
                                  <button onClick={() => handleRenameFile(file.path, file.sha)} className="text-zinc-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="重命名">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button onClick={() => handleDeleteFile(file.path, file.sha)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="删除文件">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 科协网盘：超级权限管理中心 */}
                  {context === 'pan' && adminToken && (
                    <div className="space-y-6 pt-6">
                      <h2 className="text-pink-500 text-[10px] font-black tracking-widest uppercase italic flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                        Netdisk_Remote_Commander
                      </h2>
                      
                      {/* 全局开关与核心设置 */}
                      <div className="bg-zinc-900/40 border-2 border-pink-500/20 rounded-2xl p-6 glow-pink">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <div className="text-xs font-bold text-white mb-1">CORE COMMAND CENTER</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-mono">Control_Matrix_v2</div>
                          </div>
                          {panAdminLoading && <div className="text-[10px] text-pink-400 animate-pulse font-mono font-bold">同步中...</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <button 
                            onClick={() => handlePanAdminAction('updateSettings', { settings: { ...panAdminData?.settings, guestMode: !panAdminData?.settings?.guestMode } })}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${panAdminData?.settings?.guestMode ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}
                          >
                            <div className="text-left">
                              <div className="text-[11px] font-bold">访客公开模式</div>
                              <div className="text-[9px] opacity-60">GUEST_ACCESS_OVERRIDE</div>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${panAdminData?.settings?.guestMode ? 'bg-pink-500' : 'bg-zinc-700'}`}>
                              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${panAdminData?.settings?.guestMode ? 'right-1' : 'left-1'}`} />
                            </div>
                          </button>

                          <button 
                            onClick={() => handlePanAdminAction('updateSettings', { settings: { ...panAdminData?.settings, disableThirdDownload: !panAdminData?.settings?.disableThirdDownload } })}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${panAdminData?.settings?.disableThirdDownload ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}
                          >
                            <div className="text-left">
                              <div className="text-[11px] font-bold">禁用边缘加速</div>
                              <div className="text-[9px] opacity-60">CF_PROXY_GATE_KEEPER</div>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${panAdminData?.settings?.disableThirdDownload ? 'bg-yellow-500' : 'bg-zinc-700'}`}>
                              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${panAdminData?.settings?.disableThirdDownload ? 'right-1' : 'left-1'}`} />
                            </div>
                          </button>
                        </div>

                        {/* 用户列表 */}
                        <div className="bg-black/40 border border-zinc-800/50 rounded-xl p-4">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-4 tracking-widest flex justify-between">
                            <span>User_Identity_Register</span>
                            <button onClick={fetchPanAdmin} className="text-pink-500 hover:text-pink-400">REFRESH</button>
                          </div>
                          <div className="space-y-3">
                            {panAdminData?.users?.map((u: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg group">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role === 'admin' ? 'bg-pink-500/20 text-pink-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {u.username[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-bold text-zinc-200">{u.username}</div>
                                    <div className="text-[9px] text-zinc-600 font-mono tracking-tighter uppercase">{u.role}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {u.username !== 'admin' && (
                                    <>
                                      <select 
                                        value={u.role}
                                        onChange={(e) => handlePanAdminAction('updateRole', { username: u.username, role: e.target.value })}
                                        className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] text-zinc-400"
                                      >
                                        <option value="guest">GUEST</option>
                                        <option value="manager">MANAGER</option>
                                        <option value="admin">ADMIN</option>
                                      </select>
                                      <button 
                                        onClick={() => confirm(`确定要注销用户 ${u.username} 吗？`) && handlePanAdminAction('remove', { username: u.username })}
                                        className="text-zinc-600 hover:text-red-500 p-0.5"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* 快捷操作：新增用户与改密 */}
                          <div className="mt-6 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] text-zinc-600 uppercase mb-2">Add_New_Explorer</div>
                              <form 
                                autoComplete="off"
                                className="flex flex-col gap-2"
                                onSubmit={(e: any) => {
                                  e.preventDefault();
                                  const u = e.target.username.value;
                                  const p = e.target.password.value;
                                  if (u && p) {
                                    handlePanAdminAction('add', { username: u, password: p, role: 'guest' });
                                    e.target.reset();
                                  }
                                }}
                              >
                                <input name="username" placeholder="Username" className="bg-black/60 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-pink-500" />
                                <input name="password" type="password" placeholder="Password" className="bg-black/60 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-pink-500" />
                                <button type="submit" className="bg-zinc-800 hover:bg-pink-500 text-[9px] font-bold py-1 px-2 rounded transition-colors uppercase">Register_User</button>
                              </form>
                            </div>
                            <div>
                               <div className="text-[10px] text-zinc-600 uppercase mb-2">Change_Root_Key</div>
                               <form
                                 autoComplete="off"
                                 className="flex flex-col gap-2"
                                 onSubmit={(e: any) => {
                                   e.preventDefault();
                                   const p = e.target.new_password.value;
                                   if (p && confirm("警告：修改管理密码将立即同步到网盘生产环境，是否继续？")) {
                                     handlePanAdminAction('changeAdminPassword', { password: p });
                                     e.target.reset();
                                   }
                                 }}
                               >
                                 <input name="new_password" type="password" placeholder="New Admin Password" className="bg-black/60 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-pink-500" />
                                 <button type="submit" className="bg-pink-500/10 border border-pink-500/50 text-pink-400 hover:bg-pink-500 hover:text-white text-[9px] font-bold py-1 px-2 rounded transition-all uppercase">Overdrive_Root</button>
                               </form>
                            </div>
                          </div>
                        </div>

                        {panAdminMsg && (
                          <div className={`mt-4 p-3 rounded-lg border text-[10px] font-mono ${panAdminMsg.includes('✅') ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' : 'bg-pink-500/5 border-pink-500/30 text-pink-400'}`}>
                            {panAdminMsg}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 科协网盘：行为审计日志 */}
                  {context === 'pan' && (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase italic flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                          Netdisk_Action_Audit
                        </h2>
                        <div className="flex items-center gap-3">
                          <select 
                            value={panActionLogsLimit}
                            onChange={(e) => setPanActionLogsLimit(Number(e.target.value))}
                            className="bg-black/40 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400 outline-none focus:border-blue-500 transition-colors"
                          >
                            <option value={10}>10 Logs</option>
                            <option value={20}>20 Logs</option>
                            <option value={50}>50 Logs</option>
                            <option value={100}>100 Logs</option>
                          </select>
                          <button onClick={fetchPanActionLogs} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-tight">Sync_Logs</button>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {panActionLogs.length === 0 ? (
                          <div className="text-xs text-zinc-600 italic py-4 text-center">暂无审计记录喵...</div>
                        ) : (
                          panActionLogs.map((log: any, idx: number) => (
                            <div key={idx} className="bg-black/30 border border-zinc-800/50 rounded-xl p-3 hover:border-blue-500/30 transition-all group/log">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded uppercase border border-blue-500/20">{log.action_type}</span>
                                  <span className="text-[11px] font-bold text-zinc-300">{log.username}</span>
                                </div>
                                <span className="text-[9px] text-zinc-600 font-mono">
                                  {new Date(log.created_at).toLocaleString('zh-CN', { 
                                    year: 'numeric', 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    second: '2-digit',
                                    hour12: false 
                                  })}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 break-all mb-2 leading-relaxed">
                                <span className="text-zinc-500">Target: </span>{log.action_item}
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-zinc-600 font-mono">
                                <div className="flex items-center gap-1">
                                  <span>📍</span>
                                  <span>{log.location || 'Unknown_Location'}</span>
                                </div>
                                <span className="opacity-0 group-hover/log:opacity-100 transition-opacity bg-zinc-900 px-1 rounded">{log.ip}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* GitHub 一键上传文件 */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase italic text-zinc-500 mb-1">
                      <span>GitHub_Upload</span>
                      <span className="text-zinc-600 truncate ml-2 max-w-[150px]">{activeProject.github_repo}</span>
                    </div>

                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 text-[10px]">
                      <button onClick={() => setGhUploadMode('text')} className={`flex-1 py-1.5 text-center font-bold ${ghUploadMode === 'text' ? 'bg-pink-500 text-white' : 'bg-black/60 text-zinc-500 hover:bg-zinc-800'}`}>文本模式</button>
                      <button onClick={() => setGhUploadMode('file')} className={`flex-1 py-1.5 text-center font-bold ${ghUploadMode === 'file' ? 'bg-pink-500 text-white' : 'bg-black/60 text-zinc-500 hover:bg-zinc-800'}`}>图片/文件模式</button>
                    </div>

                    <div className="space-y-2">
                      <input
                        value={ghFilename}
                        onChange={(e) => setGhFilename(e.target.value)}
                        placeholder={ghUploadMode === 'text' ? "文件名（例如: src/test.ts）" : "文件名（自动填充）"}
                        className="w-full bg-black/40 border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-pink-500 transition-colors"
                      />

                      {ghUploadMode === 'text' ? (
                        <textarea
                          value={ghContent}
                          onChange={(e) => setGhContent(e.target.value)}
                          placeholder="在这里输入要上传到 GitHub 的文件内容喵..."
                          rows={4}
                          className="w-full bg-black/40 border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-pink-500 transition-colors resize-none mb-2"
                        />
                      ) : (
                        <div className="flex flex-col gap-2 mb-2">
                          <label className={`flex items-center justify-center w-full h-24 bg-black/40 border border-dashed rounded cursor-pointer transition-colors ${ghFileBase64 ? 'border-pink-500/50 text-pink-400 bg-pink-500/5' : 'border-zinc-600 text-zinc-500 hover:border-pink-500 hover:bg-zinc-800/50'}`}>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-lg">{ghFileBase64 ? '✅' : '📁'}</span>
                              <span className="text-[11px] font-mono font-bold mt-1 text-center px-4">
                                {ghFileBase64 ? '文件已就绪，可直接上传' : '点击选择或拖拽文件到此处'}
                              </span>
                            </div>
                            <input
                              type="file"
                              onChange={handleGhFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          onClick={uploadToGithub}
                          disabled={ghUploading}
                          className={`px-4 py-1.5 rounded text-[11px] font-bold ${ghUploading
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-pink-500 text-white hover:bg-pink-400 hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-pink-500/25'
                            }`}
                        >
                          {ghUploading ? 'UPLOADING...' : '一键上传'}
                        </button>
                        {ghUploadMsg && (
                          <span className={`text-[10px] font-bold ${ghUploadMsg.includes('成功') ? 'text-green-400' : 'text-yellow-400'} shrink-0 ml-2 truncate max-w-[140px]`} title={ghUploadMsg}>
                            {ghUploadMsg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧：访问日志控制台 */}
                <div className="space-y-6">
                  <h2 className="text-zinc-500 text-[10px] font-black tracking-widest uppercase italic">Database_Core</h2>
                  <div className="bg-black border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 text-xs text-zinc-500 font-bold">
                      <div className="flex flex-col">
                        <span>DATABASE METRICS</span>
                        <span className="text-[10px] text-zinc-600 mt-1">
                          TOTAL REQUESTS:{" "}
                          <span className="text-emerald-400 font-bold">
                            {totalRequests ?? '...'}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          window.open(`https://supabase.com/dashboard/project/${activeProject.supabase}`)
                        }
                        className="text-xs bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded text-zinc-400 transition-all"
                      >
                        Manage DB &rarr;
                      </button>
                    </div>
                    <div className="border-t border-zinc-800 pt-4 text-xs text-zinc-400 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black tracking-widest uppercase italic">View_Logs</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={logLimit}
                            onChange={(e) => setLogLimit(e.target.value)}
                            className="bg-black/40 border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-zinc-400 outline-none focus:border-pink-500 transition-colors"
                          >
                            <option value="5">5 Records</option>
                            <option value="10">10 Records</option>
                            <option value="20">20 Records</option>
                            <option value="50">50 Records</option>
                            <option value="all">All Records</option>
                          </select>
                          <button
                            onClick={() => { setViewLogs([]); setTotalRequests(null); fetch(`/api/view-logs?project=${context}&limit=${logLimit}`).then(r => r.json()).then(d => { if (Array.isArray(d.logs)) setViewLogs(d.logs); }); fetch(`/api/total-requests?project=${context}`).then(r => r.json()).then(d => { if (typeof d.totalRequests === 'number') setTotalRequests(d.totalRequests); }); }}
                            className="text-zinc-600 hover:text-pink-400 transition-colors" title="刷新日志"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        </div>
                      </div>
                      {/* 表头 */}
                      {viewLogs.length > 0 && (
                        <div className="grid grid-cols-[80px,1fr] gap-2 pb-1 mb-1 border-b border-zinc-800 text-[10px] text-zinc-500">
                          <span>ID</span>
                          <span>IP / 位置 / 时间</span>
                        </div>
                      )}
                      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {viewLogs.length === 0 ? (
                          <div className="text-[11px] text-zinc-600">暂无访问记录喵...</div>
                        ) : (
                          viewLogs.map((log: any, index: number) => (
                            <div key={log.id ?? index} className="grid grid-cols-[80px,1fr] gap-2 text-[11px] text-zinc-300">
                              <span className="text-zinc-500">#{log.id ?? index + 1}</span>
                              <div className="flex flex-col gap-0.5">
                                <span>
                                  {log.ip_address || '未知 IP'}
                                </span>
                                <span className="text-zinc-500">
                                  {(() => {
                                    const parts = [log.city, log.region, log.country].filter(Boolean);
                                    if (parts.length) {
                                      return parts.join(' / ');
                                    }
                                    return '未知地区';
                                  })()}
                                </span>
                                <span className="text-zinc-600">
                                  {log.visit_time
                                    ? new Date(log.visit_time).toLocaleString()
                                    : ''}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* IP 访问统计 */}
                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black tracking-widest uppercase italic text-zinc-400">IP_Stats</span>
                          <div className="flex items-center gap-2">
                            {ipStatsSummary && (
                              <span className="text-[9px] text-zinc-600">{ipStatsSummary.totalIPs} IPs · {ipStatsSummary.totalVisits} visits</span>
                            )}
                            <select
                              value={ipStatsLimit}
                              onChange={(e) => setIpStatsLimit(e.target.value)}
                              className="bg-black/40 border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-zinc-400 outline-none focus:border-pink-500 transition-colors"
                            >
                              <option value="1">1 IP</option>
                              <option value="5">5 IPs</option>
                              <option value="10">10 IPs</option>
                              <option value="20">20 IPs</option>
                              <option value="all">All IPs</option>
                            </select>
                            <button
                              onClick={() => { setIpStats([]); fetch(`/api/ip-stats?project=${context}&limit=${ipStatsLimit}`).then(r => r.json()).then(d => { if (Array.isArray(d.stats)) { setIpStats(d.stats); setIpStatsSummary({ totalIPs: d.totalIPs, totalVisits: d.totalVisits }); } }); }}
                              className="text-zinc-600 hover:text-pink-400 transition-colors" title="刷新IP统计"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                          </div>
                        </div>
                        {/* 表头 */}
                        {ipStats.length > 0 && (
                          <div className="grid grid-cols-[1fr,60px,1fr,1fr,1fr] gap-2 pb-1 mb-1 border-b border-zinc-800 text-[9px] text-zinc-600 uppercase">
                            <span>IP</span>
                            <span>次数</span>
                            <span>首次</span>
                            <span>最近</span>
                            <span>位置</span>
                          </div>
                        )}
                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                          {ipStats.length === 0 ? (
                            <div className="text-[11px] text-zinc-600">暂无统计数据喵...</div>
                          ) : (
                            ipStats.map((s: any, i: number) => (
                              <div key={i} className="grid grid-cols-[1fr,60px,1fr,1fr,1fr] gap-2 text-[10px] py-0.5 hover:bg-zinc-800/30 rounded transition-colors">
                                <span className="text-zinc-300 font-mono truncate" title={s.ip}>{s.ip}</span>
                                <span className="text-pink-400 font-bold">{s.count}</span>
                                <span className="text-zinc-600 truncate" title={s.firstVisit ? new Date(s.firstVisit).toLocaleString() : ''}>{s.firstVisit ? new Date(s.firstVisit).toLocaleDateString() : '-'}</span>
                                <span className="text-zinc-500 truncate" title={s.lastVisit ? new Date(s.lastVisit).toLocaleString() : ''}>{s.lastVisit ? new Date(s.lastVisit).toLocaleDateString() : '-'}</span>
                                <span className="text-zinc-500 truncate">{[s.city, s.region, s.country].filter(Boolean).join('/') || '-'}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* SQL Editor 命令行 */}
                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        <div className="text-[10px] font-black tracking-widest uppercase italic mb-1">
                          SQL_Editor_Cmd
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-pink-500 text-[11px]">sql&gt;</span>
                          <input
                            value={sqlCmd}
                            onChange={(e) => setSqlCmd(e.target.value)}
                            onKeyDown={runSqlCmd}
                            placeholder="在这里输入 SQL，回车在终端中执行"
                            className="flex-1 bg-transparent border border-zinc-800 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-pink-500 transition-colors"
                          />
                        </div>
                        {sqlError && (
                          <div className="mt-2 text-[11px] text-red-400">
                            {sqlError}
                          </div>
                        )}
                        {sqlResult && (
                          <div className="mt-2 max-h-40 overflow-y-auto bg-zinc-950/60 border border-zinc-800 rounded p-2 text-[11px] text-zinc-200">
                            {sqlResult.length === 0 ? (
                              <div className="text-zinc-500">无结果喵...</div>
                            ) : (
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(sqlResult, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
          }
        </main >
      </div >

      {/* 底部终端抽屉 */}
      < footer className={`border-t border-zinc-800 bg-black flex flex-col transition-all duration-300 ${termOpen ? 'h-64 md:h-64' : 'h-9'} z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        <div onClick={() => setTermOpen(!termOpen)} className="bg-[#0c0c0e] px-3 md:px-6 py-2 flex justify-between items-center cursor-pointer text-[10px] font-black text-zinc-500 hover:text-zinc-300 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
            <span className="truncate">{context.toUpperCase()} @ TERMINAL_V2</span>
          </div>
          <span className="shrink-0 ml-2">{termOpen ? 'MINIMIZE _' : 'EXPAND ^'}</span>
        </div>
        {
          termOpen && (
            <div ref={scrollRef} className="flex-1 p-2 md:p-4 overflow-y-auto text-xs md:text-sm font-mono bg-black/80 backdrop-blur-md">
              {logs.map((log, i) => (
                <div key={i} className={`mb-1 break-words ${log.includes('ERROR') ? 'text-red-500' : log.includes('哥哥') ? 'text-pink-400 font-bold' : log.includes('NETWORK') ? 'text-blue-400' : 'text-emerald-600'}`}>
                  {log}
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 items-start sm:items-center">
                <span className="text-blue-500 font-bold shrink-0">哥哥酱@ZERO:{context} $</span>
                <input
                  value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={runCmd}
                  className="bg-transparent border-none outline-none w-full flex-1 text-white caret-pink-500 font-bold"
                  placeholder="输入指令..." autoFocus
                />
              </div>
            </div>
          )
        }
      </footer >
    </div >
  );
}

// === 辅助组件 (让代码整洁点喵) ===
function GlobalCard({ label, value, sub, color = "text-white" }: any) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
      <div className="text-[10px] text-zinc-600 font-bold mb-2 tracking-widest">{label}</div>
      <div className={`text-3xl font-black ${color} tracking-tighter`}>{value}</div>
      <div className="text-[10px] text-zinc-700 mt-1 uppercase">{sub}</div>
    </div>
  );
}

function DeepLink({ label, sub, onClick, className }: any) {
  return (
    <button onClick={onClick} className={`bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-left hover:bg-zinc-800 hover:border-zinc-600 transition-all group ${className}`}>
      <div className="text-white font-bold text-xs mb-1 group-hover:text-pink-400 transition-colors">{label}</div>
      <div className="text-[10px] text-zinc-600 truncate font-mono">{sub}</div>
    </button>
  );
}

function MonitorItem({ label, value, color }: any) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
      <span className="text-[10px] text-zinc-500 uppercase font-bold">{label}</span>
      <div className="flex items-center gap-2 mt-2">
        <div className={`w-2 h-2 rounded-full ${color} animate-pulse shadow-[0_0_8px_currentColor]`} />
        <span className="text-white font-bold text-sm truncate">{value}</span>
      </div>
    </div>
  );
}