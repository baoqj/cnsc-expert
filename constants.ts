import { Language } from './types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    qa: 'AI Expert Q&A',
    search: 'Regulatory Search',
    compliance: 'Compliance Check',
    library: 'My Library',
    adminSettings: 'System Settings',
    knowledgeBase: 'Knowledge Base',
    userMgmt: 'User Management',
    welcome: 'Welcome back, Officer',
    searchPlaceholder: 'Search regulations, documents, or projects...',
    upload: 'Upload Document',
    analyzing: 'Analyzing...',
    complianceScore: 'Compliance Score',
    ragSettings: 'Retrieval & RAG Settings',
    hybridWeight: 'Hybrid Search Weight',
    crawlerSettings: 'Crawler Configuration',
    users: 'Users',
    logout: 'Logout'
  },
  fr: {
    dashboard: 'Tableau de bord',
    qa: 'Q&R Expert IA',
    search: 'Recherche réglementaire',
    compliance: 'Conformité',
    library: 'Ma bibliothèque',
    adminSettings: 'Paramètres système',
    knowledgeBase: 'Base de connaissances',
    userMgmt: 'Gestion des utilisateurs',
    welcome: 'Bon retour, Officier',
    searchPlaceholder: 'Rechercher des règlements, documents...',
    upload: 'Télécharger',
    analyzing: 'Analyse en cours...',
    complianceScore: 'Score de conformité',
    ragSettings: 'Paramètres RAG',
    hybridWeight: 'Poids de recherche hybride',
    crawlerSettings: 'Configuration du crawler',
    users: 'Utilisateurs',
    logout: 'Déconnexion'
  },
  es: {
    dashboard: 'Panel de control',
    qa: 'IA Experta P&R',
    search: 'Búsqueda regulatoria',
    compliance: 'Verificación de cumplimiento',
    library: 'Mi biblioteca',
    adminSettings: 'Configuración del sistema',
    knowledgeBase: 'Base de conocimientos',
    userMgmt: 'Gestión de usuarios',
    welcome: 'Bienvenido, Oficial',
    searchPlaceholder: 'Buscar regulaciones, documentos...',
    upload: 'Subir documento',
    analyzing: 'Analizando...',
    complianceScore: 'Puntaje de cumplimiento',
    ragSettings: 'Configuración RAG',
    hybridWeight: 'Peso de búsqueda híbrida',
    crawlerSettings: 'Configuración de rastreador',
    users: 'Usuarios',
    logout: 'Cerrar sesión'
  },
  zh: {
    dashboard: '仪表盘',
    qa: 'AI 专家问答',
    search: '法规检索',
    compliance: '合规检查',
    library: '我的资料库',
    adminSettings: '系统设置',
    knowledgeBase: '知识库管理',
    userMgmt: '用户管理',
    welcome: '欢迎回来，长官',
    searchPlaceholder: '搜索法规、文档或项目...',
    upload: '上传文档',
    analyzing: '分析中...',
    complianceScore: '合规评分',
    ragSettings: '检索增强生成 (RAG) 设置',
    hybridWeight: '混合检索权重',
    crawlerSettings: '爬虫配置',
    users: '用户列表',
    logout: '退出登录'
  }
};

export const MOCK_USERS = [
  { id: '1', name: 'Dr. Sarah Connor', role: 'admin', email: 's.connor@cnsc.gc.ca', status: 'active', lastActive: '2 mins ago' },
  { id: '2', name: 'Jean-Luc Picard', role: 'user', email: 'j.picard@nuclear.ca', status: 'active', lastActive: '1 hour ago' },
  { id: '3', name: 'Wei Zhang', role: 'user', email: 'w.zhang@energy.ca', status: 'inactive', lastActive: '2 days ago' },
];

export const MOCK_DOCS = [
  { id: '1', title: 'REGDOC-2.5.2: Design of Reactor Facilities', type: 'pdf', date: '2023-10-15', status: 'indexed', tags: ['Safety', 'Design'] },
  { id: '2', title: 'Nuclear Safety and Control Act', type: 'web', date: '2023-09-01', status: 'indexed', tags: ['Legislation'] },
  { id: '3', title: 'Bruce Power Annual Report 2023', type: 'pdf', date: '2024-01-10', status: 'processing', tags: ['Report', 'External'] },
];

export const MOCK_REPORTS = [
  { id: '1', projectName: 'Darlington Refurbishment Unit 3', score: 98, status: 'compliant', date: 'Oct 24, 2023' },
  { id: '2', projectName: 'Point Lepreau Waste Management', score: 85, status: 'warning', date: 'Oct 22, 2023' },
  { id: '3', projectName: 'Chalk River Lab Expansion', score: 92, status: 'compliant', date: 'Oct 20, 2023' },
];
