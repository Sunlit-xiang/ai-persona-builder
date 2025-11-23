
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Briefcase, Building2, Users, MessageSquare, 
  ShieldAlert, Target, MessagesSquare, ChevronRight, 
  ChevronLeft, Download, Copy, Save, CheckCircle, 
  AlertCircle, Lock, Menu, X, KeyRound, Upload, Mail, RefreshCw
} from 'lucide-react';
import { UserProfile, createInitialState, Person, RelationshipCategory, UseCase, ExampleDialogue } from './types';

// --- Constants ---

const ACTIVATION_KEY = "ai_profile_activated_v1";
const DATA_CACHE_KEY = "ai_profile_form_data_autosave";
const VALID_CODE = "EARLY-USER-01";
const AUTHOR_EMAIL = "578043545@qq.com";

const PSYCH_FRAMEWORKS = [
  "《人性的弱点》换位思考 (Empathy)",
  "《非暴力沟通》观察而非评论 (NVC)",
  "《金字塔原理》结论先行 (Conciseness)",
  "《影响力》互惠原则 (Reciprocity)",
  "《思考，快与慢》系统二思维 (Rationality)",
  "《原则》极度求真 (Radical Truth)",
  "苏格拉底式提问 (Socratic Method)",
  "建设性反馈 (SBI Model)",
  "结果导向 (Result Oriented)",
  "成长型思维 (Growth Mindset)"
];

// --- Components ---

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 rounded-full transition-all duration-300 ${
            idx + 1 === currentStep ? 'w-8 bg-brand-600' : idx + 1 < currentStep ? 'w-4 bg-brand-400' : 'w-2 bg-slate-200'
          }`}
        />
      ))}
      <span className="text-xs text-slate-400 ml-2">步骤 {currentStep} / {totalSteps}</span>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Initialize form data from Auto-Save or Default
  const [formData, setFormData] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DATA_CACHE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
    }
    return createInitialState();
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  
  // ACTIVATION STATE
  const [isActivated, setIsActivated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACTIVATION_KEY) === "true";
    }
    return false;
  });
  const [activationInput, setActivationInput] = useState("");
  const [activationError, setActivationError] = useState("");

  const totalSteps = 8;
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // Auto-Save Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(formData));
      setLastSavedTime(new Date().toLocaleTimeString());
    }, 1000); // Debounce save every 1s

    return () => clearTimeout(timer);
  }, [formData]);

  // --- Handlers ---

  const handleActivationSubmit = () => {
    if (activationInput.trim() === VALID_CODE) {
      localStorage.setItem(ACTIVATION_KEY, "true");
      setIsActivated(true);
      setActivationError("");
    } else {
      setActivationError("激活码无效或已过期。如已付款，请联系作者重新获取。");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation to check if it's our format
        if (json.version && json.owner_basic) {
          setFormData(json);
          alert("✅ 档案导入成功！");
          // Optional: Reset to step 1 or stay
        } else {
          alert("❌ 文件格式不正确，请上传本工具生成的 JSON 文件。");
        }
      } catch (err) {
        alert("❌ 解析 JSON 失败，文件可能已损坏。");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleSendToAuthor = () => {
    const subject = encodeURIComponent(`[AI Persona Share] 用户档案分享: ${formData.owner_basic.name}`);
    const body = encodeURIComponent(`Hi Sunlit,\n\n我愿意分享我生成的 System Prompt 以帮助优化产品：\n\n${formData.system_prompt_summary_zh}\n\n----------------\n来自 AI Persona Builder`);
    window.location.href = `mailto:${AUTHOR_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleBasicChange = (field: keyof typeof formData.owner_basic, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      owner_basic: { ...prev.owner_basic, [field]: value }
    }));
  };

  const handleProfessionalChange = (field: keyof typeof formData.professional_profile, value: any) => {
    setFormData(prev => ({
      ...prev,
      professional_profile: { ...prev.professional_profile, [field]: value }
    }));
  };

  const handleOrgChange = (field: keyof typeof formData.organization, value: string) => {
    setFormData(prev => ({
      ...prev,
      organization: { ...prev.organization, [field]: value }
    }));
  };

  const handleTraitToggle = (trait: string) => {
    setFormData(prev => {
      const currentTraits = prev.communication_preferences.style_traits;
      const newTraits = currentTraits.includes(trait)
        ? currentTraits.filter(t => t !== trait)
        : [...currentTraits, trait];
      return {
        ...prev,
        communication_preferences: {
          ...prev.communication_preferences,
          style_traits: newTraits
        }
      };
    });
  };

  // Relationship Logic
  const addPerson = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            people: [
              ...cat.people, 
              { 
                id: Math.random().toString(36).substr(2, 9), 
                alias: '', role_to_me: '', closeness: '', preferred_tone: '', focus_points: '', my_goal_with_this_role: '' 
              }
            ]
          };
        }
        return cat;
      })
    }));
  };

  const removePerson = (catId: string, personId: string) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.map(cat => {
        if (cat.id === catId) {
          return { ...cat, people: cat.people.filter(p => p.id !== personId) };
        }
        return cat;
      })
    }));
  };

  const updatePerson = (catId: string, personId: string, field: keyof Person, value: string) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            people: cat.people.map(p => p.id === personId ? { ...p, [field]: value } : p)
          };
        }
        return cat;
      })
    }));
  };

  // Use Cases Logic
  const addUseCase = () => {
    setFormData(prev => ({
      ...prev,
      goals_and_use_cases: {
        ...prev.goals_and_use_cases,
        typical_ai_use_cases: [
          ...prev.goals_and_use_cases.typical_ai_use_cases,
          { id: Math.random().toString(36).substr(2, 9), name: '', expected_outcome: '', special_requirements: '' }
        ]
      }
    }));
  };

  const updateUseCase = (id: string, field: keyof UseCase, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals_and_use_cases: {
        ...prev.goals_and_use_cases,
        typical_ai_use_cases: prev.goals_and_use_cases.typical_ai_use_cases.map(u => 
          u.id === id ? { ...u, [field]: value } : u
        )
      }
    }));
  };

  const removeUseCase = (id: string) => {
    setFormData(prev => ({
      ...prev,
      goals_and_use_cases: {
        ...prev.goals_and_use_cases,
        typical_ai_use_cases: prev.goals_and_use_cases.typical_ai_use_cases.filter(u => u.id !== id)
      }
    }));
  };

  // Example Dialogues Logic
  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      example_dialogues: [
        ...prev.example_dialogues,
        { id: Math.random().toString(36).substr(2, 9), user_question: '', what_went_wrong_before: '', ideal_answer_description: '' }
      ]
    }));
  };

  const updateExample = (id: string, field: keyof ExampleDialogue, value: string) => {
    setFormData(prev => ({
      ...prev,
      example_dialogues: prev.example_dialogues.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

   const removeExample = (id: string) => {
    setFormData(prev => ({
      ...prev,
      example_dialogues: prev.example_dialogues.filter(e => e.id !== id)
    }));
  };

  // Generation Logic
  const generateSystemPrompt = () => {
    const { owner_basic, professional_profile, organization, relationships, communication_preferences, constraints, goals_and_use_cases } = formData;
    
    // Summary of Relationships
    const relSummary = relationships
      .filter(cat => cat.people.length > 0)
      .map(cat => {
        const peopleDesc = cat.people.map(p => `${p.alias}（${p.role_to_me}）：重点关注${p.focus_points}，沟通偏好${p.preferred_tone}。`).join(" ");
        return `[${cat.label}]: ${peopleDesc}`;
      }).join("\n");

    const prompt = `
# Role Setting
你不仅是一个 AI 助手，更是 ${owner_basic.name}（${owner_basic.role}）的专属“数字人格秘书”。你非常了解我的职业背景、社会关系网、沟通习惯和目标。

## 1. 关于我 (User Profile)
- **姓名**: ${owner_basic.name} (请叫我: ${owner_basic.preferred_name})
- **职业/角色**: ${owner_basic.role}，拥有 ${owner_basic.years_of_experience} 经验。
- **所在地**: ${owner_basic.city} (${owner_basic.timezone})
- **个人深度介绍**: ${professional_profile.one_sentence_bio}
- **核心技能**: ${professional_profile.core_skills.join(", ")}
- **典型工作场景**: ${professional_profile.typical_scenarios.join("; ")}

## 2. 业务背景 (Context)
- **组织**: ${organization.org_name} (${organization.industry} - ${organization.stage})
- **主要产品**: ${organization.products_services}
- **客户群体**: ${organization.target_customers}
- **商业模式**: ${organization.business_model}

## 3. 关键社会关系 (Social Graph)
你需要根据我提到的对象，调整你的建议策略和拟稿语气：
${relSummary}

## 4. 沟通偏好 (Communication Style)
- **默认语气**: ${communication_preferences.default_tone}
- **长度偏好**: ${communication_preferences.length_preference}
- **沟通心理模型**: ${communication_preferences.style_traits.join(", ")}
- **绝对避免**: ${communication_preferences.avoid_phrases}

## 5. 约束与边界 (Constraints)
- ${constraints.confidentiality_rules}
- 禁止话题: ${constraints.forbidden_topics}
- 禁止行为: ${constraints.do_not_do_list}

## 6. 我的目标 (Goals)
- 短期目标: ${goals_and_use_cases.short_term_goals}
- 长期目标: ${goals_and_use_cases.long_term_goals}

## Instruction
在接下来的对话中，请基于以上“全息语境”来理解我的每一个请求。不要把我当成陌生用户，要当成你的长期雇主。
    `.trim();

    return prompt;
  };

  const handleGenerate = () => {
    if (!isActivated) return;
    
    const summary = generateSystemPrompt();
    setFormData(prev => ({
      ...prev,
      last_updated: new Date().toISOString().split('T')[0],
      system_prompt_summary_zh: summary
    }));
    setIsGenerated(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ai_persona_${formData.owner_basic.name || 'user'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(formData.system_prompt_summary_zh);
    alert("System Prompt 已复制！可直接粘贴到 ChatGPT / Claude / Gemini。");
  };

  // --- Rendering Steps ---

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-brand-600"/> 基础身份信息</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-gray-700">中文名/化名 *</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.owner_basic.name} onChange={e => handleBasicChange('name', e.target.value)} placeholder="例：张伟 或 Alex" />
              </label>
              <label className="block">
                <span className="text-gray-700">希望AI如何称呼你 *</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.owner_basic.preferred_name} onChange={e => handleBasicChange('preferred_name', e.target.value)} placeholder="例：张总、老张、Alex" />
              </label>
              <label className="block">
                <span className="text-gray-700">当前职业身份 *</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.owner_basic.role} onChange={e => handleBasicChange('role', e.target.value)} placeholder="例：产品经理" />
              </label>
              <label className="block">
                <span className="text-gray-700">所在行业 *</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.owner_basic.industry} onChange={e => handleBasicChange('industry', e.target.value)} placeholder="例：SaaS / 电商" />
              </label>
              <label className="block">
                <span className="text-gray-700">城市 & 时区</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.owner_basic.city} onChange={e => handleBasicChange('city', e.target.value)} placeholder="例：北京, GMT+8" />
              </label>
               <label className="block">
                <span className="text-gray-700">工作年限</span>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.owner_basic.years_of_experience} onChange={e => handleBasicChange('years_of_experience', e.target.value)}>
                    <option value="">请选择</option>
                    <option value="0-2年">0-2年 (职场新人)</option>
                    <option value="3-5年">3-5年 (骨干/资深)</option>
                    <option value="6-10年">6-10年 (专家/管理)</option>
                    <option value="10年以上">10年以上 (高管/老兵)</option>
                </select>
              </label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-brand-600"/> 职业画像与专长</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700">详细自我介绍 (含个人信息、性格、评价与规划)</span>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border h-32" 
                  value={formData.professional_profile.one_sentence_bio} onChange={e => handleProfessionalChange('one_sentence_bio', e.target.value)} 
                  placeholder="例：我是一名 INTP 性格的产品经理，专注 B 端 SaaS。我性格沉稳，擅长逻辑分析但有时忽略情绪。我的自我评价是... 未来我计划..." />
              </label>
              <label className="block">
                <span className="text-gray-700">核心技能 (逗号分隔)</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.professional_profile.core_skills.join(", ")} 
                  onChange={e => handleProfessionalChange('core_skills', e.target.value.split(/[,，]\s*/))} 
                  placeholder="数据分析, 团队管理, 商业路演" />
              </label>
              <label className="block">
                <span className="text-gray-700">3个典型工作场景 (分号或换行分隔)</span>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border h-24" 
                  value={formData.professional_profile.typical_scenarios.join("\n")} 
                  onChange={e => handleProfessionalChange('typical_scenarios', e.target.value.split(/\n|;|；/))} 
                  placeholder="给大客户写方案&#10;向老板汇报月度数据&#10;招聘面试" />
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-brand-600"/> 公司与业务简介</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block md:col-span-2">
                <span className="text-gray-700">公司/组织名称 (可匿名)</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.organization.org_name} onChange={e => handleOrgChange('org_name', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-gray-700">行业细分赛道</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.organization.industry} onChange={e => handleOrgChange('industry', e.target.value)} placeholder="例：跨境电商 SaaS" />
              </label>
              <label className="block">
                <span className="text-gray-700">发展阶段</span>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                  value={formData.organization.stage} onChange={e => handleOrgChange('stage', e.target.value)}>
                    <option value="">请选择</option>
                    <option value="初创">初创 (0-1)</option>
                    <option value="成长期">成长期 (快速扩张)</option>
                    <option value="成熟期">成熟期/上市公司</option>
                    <option value="工作室">自由职业工作室</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-gray-700">主要产品/服务</span>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border h-20" 
                  value={formData.organization.products_services} onChange={e => handleOrgChange('products_services', e.target.value)} 
                  placeholder="我们提供..." />
              </label>
              <label className="block">
                <span className="text-gray-700">目标客户</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.organization.target_customers} onChange={e => handleOrgChange('target_customers', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-gray-700">商业模式</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.organization.business_model} onChange={e => handleOrgChange('business_model', e.target.value)} placeholder="例：订阅费 / 项目制" />
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-brand-600"/> 人脉与社会关系</h2>
            <p className="text-sm text-gray-500">添加你工作中常接触的关键角色，帮助 AI 理解你的职场生态。建议使用代号（如 A总）。</p>
            
            <div className="space-y-6">
              {formData.relationships.map((cat) => (
                <div key={cat.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-slate-800">{cat.label}</h3>
                    <button onClick={() => addPerson(cat.id)} className="text-sm px-3 py-1 bg-brand-50 text-brand-600 rounded-full hover:bg-brand-100 transition">
                      + 添加人物
                    </button>
                  </div>
                  
                  {cat.people.length === 0 && (
                    <p className="text-xs text-slate-400 italic">暂无记录 (可跳过)</p>
                  )}

                  <div className="space-y-4">
                    {cat.people.map((person) => (
                      <div key={person.id} className="bg-slate-50 p-3 rounded-md border border-slate-200 relative">
                        <button onClick={() => removePerson(cat.id, person.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                           <input placeholder="代号 (A总)" className="p-2 border rounded text-sm" 
                            value={person.alias} onChange={e => updatePerson(cat.id, person.id, 'alias', e.target.value)} />
                           <input placeholder="具体角色 (分管副总/朋友)" className="p-2 border rounded text-sm" 
                            value={person.role_to_me} onChange={e => updatePerson(cat.id, person.id, 'role_to_me', e.target.value)} />
                           <select className="p-2 border rounded text-sm" 
                            value={person.closeness} onChange={e => updatePerson(cat.id, person.id, 'closeness', e.target.value as any)}>
                              <option value="">关系亲密度</option>
                              <option value="非常熟">非常熟</option>
                              <option value="一般熟">一般熟</option>
                              <option value="较陌生">较陌生</option>
                           </select>
                           <select className="p-2 border rounded text-sm" 
                            value={person.preferred_tone} onChange={e => updatePerson(cat.id, person.id, 'preferred_tone', e.target.value as any)}>
                              <option value="">沟通语气</option>
                              <option value="非常正式">非常正式</option>
                              <option value="正式但友好">正式但友好</option>
                              <option value="轻松随和">轻松随和</option>
                              <option value="半开玩笑">半开玩笑</option>
                           </select>
                           <input placeholder="对方最看重什么？(结果/细节/面子)" className="p-2 border rounded text-sm md:col-span-2" 
                            value={person.focus_points} onChange={e => updatePerson(cat.id, person.id, 'focus_points', e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
             <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6 text-brand-600"/> 沟通风格与表达偏好</h2>
             <div className="grid md:grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-gray-700">默认语气</span>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                    value={formData.communication_preferences.default_tone} 
                    onChange={e => setFormData(prev => ({...prev, communication_preferences: {...prev.communication_preferences, default_tone: e.target.value}}))}>
                      <option value="正式、商务">正式、商务</option>
                      <option value="专业但亲和">专业但亲和</option>
                      <option value="轻松、口语化">轻松、口语化</option>
                      <option value="视情况自动调整">视情况自动调整</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-gray-700">文本长度偏好</span>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                    value={formData.communication_preferences.length_preference} 
                    onChange={e => setFormData(prev => ({...prev, communication_preferences: {...prev.communication_preferences, length_preference: e.target.value}}))}>
                      <option value="尽量简短，直奔主题">尽量简短，直奔主题</option>
                      <option value="中等长度，有结构有逻辑">中等长度，有结构有逻辑</option>
                      <option value="详细展开，适合 PPT/长文">详细展开，适合 PPT/长文</option>
                  </select>
                </label>
                
                {/* Modified to Multi-Select Grid */}
                <label className="block">
                  <span className="text-gray-700 block mb-2">沟通心理模型与原则 (多选)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PSYCH_FRAMEWORKS.map(trait => {
                       const isSelected = formData.communication_preferences.style_traits.includes(trait);
                       return (
                         <button
                           key={trait}
                           onClick={() => handleTraitToggle(trait)}
                           className={`px-3 py-2 text-sm rounded-md border text-left transition-all flex items-center ${
                             isSelected
                               ? 'bg-brand-50 border-brand-500 text-brand-700 font-medium shadow-sm ring-1 ring-brand-500'
                               : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-slate-50'
                           }`}
                         >
                           {isSelected ? (
                             <CheckCircle size={16} className="mr-2 text-brand-600 flex-shrink-0" />
                           ) : (
                             <div className="w-4 h-4 mr-2 rounded-full border border-gray-300 flex-shrink-0"></div>
                           )}
                           {trait}
                         </button>
                       )
                    })}
                  </div>
                </label>

                 <label className="block mt-4">
                  <span className="text-gray-700">绝对避免的词汇或行为</span>
                   <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.communication_preferences.avoid_phrases} 
                  onChange={e => setFormData(prev => ({...prev, communication_preferences: {...prev.communication_preferences, avoid_phrases: e.target.value}}))} 
                  placeholder="避免爹味说教、避免使用“赋能/抓手”等黑话" />
                </label>
             </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-brand-600"/> 原则、边界与禁区</h2>
             <div className="space-y-4">
               <label className="block">
                <span className="text-gray-700">不得触碰的话题</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.constraints.forbidden_topics} 
                  onChange={e => setFormData(prev => ({...prev, constraints: {...prev.constraints, forbidden_topics: e.target.value}}))} 
                  placeholder="公司内部政治, 薪资隐私" />
              </label>
              <label className="block">
                <span className="text-gray-700">保密级别说明</span>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border h-20" 
                  value={formData.constraints.confidentiality_rules} 
                  onChange={e => setFormData(prev => ({...prev, constraints: {...prev.constraints, confidentiality_rules: e.target.value}}))} 
                  placeholder="默认假设所有具体公司名称都应做匿名化处理..." />
              </label>
              <label className="block">
                <span className="text-gray-700">不希望AI替你做的事</span>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                  value={formData.constraints.do_not_do_list} 
                  onChange={e => setFormData(prev => ({...prev, constraints: {...prev.constraints, do_not_do_list: e.target.value}}))} 
                  placeholder="不撒谎、不伪造数据" />
              </label>
             </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-fadeIn">
             <h2 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-brand-600"/> 目标与典型场景</h2>
             <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-700">未来3-6个月目标</span>
                  <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                    value={formData.goals_and_use_cases.short_term_goals} 
                    onChange={e => setFormData(prev => ({...prev, goals_and_use_cases: {...prev.goals_and_use_cases, short_term_goals: e.target.value}}))} />
                </label>
                 <label className="block">
                  <span className="text-gray-700">未来1-3年发展方向</span>
                  <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border" 
                    value={formData.goals_and_use_cases.long_term_goals} 
                    onChange={e => setFormData(prev => ({...prev, goals_and_use_cases: {...prev.goals_and_use_cases, long_term_goals: e.target.value}}))} />
                </label>
                
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">最常见的 AI 使用场景</span>
                    <button onClick={addUseCase} className="text-sm px-3 py-1 bg-brand-50 text-brand-600 rounded-full hover:bg-brand-100">+ 添加场景</button>
                  </div>
                  <div className="space-y-3">
                    {formData.goals_and_use_cases.typical_ai_use_cases.map(uc => (
                      <div key={uc.id} className="bg-slate-50 p-3 rounded border border-slate-200 relative">
                        <button onClick={() => removeUseCase(uc.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X size={16}/></button>
                        <div className="grid md:grid-cols-2 gap-2 pr-6">
                           <input placeholder="场景名称 (写周报)" className="p-2 border rounded text-sm" 
                            value={uc.name} onChange={e => updateUseCase(uc.id, 'name', e.target.value)}/>
                           <input placeholder="期望结果 (更有条理)" className="p-2 border rounded text-sm" 
                            value={uc.expected_outcome} onChange={e => updateUseCase(uc.id, 'expected_outcome', e.target.value)}/>
                           <input placeholder="特别要求 (必须包含数据表格)" className="p-2 border rounded text-sm md:col-span-2" 
                            value={uc.special_requirements} onChange={e => updateUseCase(uc.id, 'special_requirements', e.target.value)}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        );
      case 8:
        return (
           <div className="space-y-6 animate-fadeIn">
             <h2 className="text-2xl font-bold flex items-center gap-2"><MessagesSquare className="w-6 h-6 text-brand-600"/> 示例对话 (可选)</h2>
             <p className="text-sm text-gray-500">通过“反面教材”告诉 AI 你不想要什么，以及你理想的回答是什么。</p>
             
             <div className="space-y-4">
               {formData.example_dialogues.map(ex => (
                 <div key={ex.id} className="bg-white p-4 rounded-lg border shadow-sm relative">
                    <button onClick={() => removeExample(ex.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X size={16}/></button>
                    <div className="space-y-3">
                      <input placeholder="你曾经问过的问题..." className="w-full p-2 border rounded bg-slate-50" 
                        value={ex.user_question} onChange={e => updateExample(ex.id, 'user_question', e.target.value)}/>
                      <textarea placeholder="以前 AI 回答的哪里不好？" className="w-full p-2 border rounded h-16 text-sm"
                        value={ex.what_went_wrong_before} onChange={e => updateExample(ex.id, 'what_went_wrong_before', e.target.value)}/>
                      <textarea placeholder="你理想中的回答应该是什么样？" className="w-full p-2 border rounded h-16 text-sm bg-green-50 border-green-200"
                        value={ex.ideal_answer_description} onChange={e => updateExample(ex.id, 'ideal_answer_description', e.target.value)}/>
                    </div>
                 </div>
               ))}
               <button onClick={addExample} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-400 hover:text-brand-600 transition">
                 + 添加一个对比示例
               </button>
             </div>
           </div>
        );
      default: return null;
    }
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 relative">
      
      {/* --- ACTIVATION OVERLAY (HARD GATE) --- */}
      {!isActivated && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="bg-brand-600 p-6 text-center">
              <Lock className="w-12 h-12 text-white/90 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">请输入激活码</h2>
              <p className="text-brand-100 text-sm mt-1">解锁『拥有你全部社会关系的 AI 人格秘书』</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3 text-sm text-slate-600 text-center leading-relaxed">
                <p>这个工具会帮你生成一份专属的『AI 数字档案』，让 任何AI在回答之前，先真正理解你是谁。</p>
                <p className="font-medium text-slate-800">为了控制内测范围，目前仅通过激活码方式开放使用。</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Activation Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={activationInput}
                    onChange={(e) => setActivationInput(e.target.value)}
                    placeholder="在此输入你的激活码"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                  />
                </div>
                {activationError && (
                  <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {activationError}
                  </p>
                )}
              </div>

              <button 
                onClick={handleActivationSubmit}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition transform active:scale-95"
              >
                立刻激活
              </button>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 leading-normal mb-3">
                  没有激活码？请联系作者获取：
                </p>
                <div className="text-sm text-slate-600 font-medium space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <p>作者：格局打开的Sunlit</p>
                   <p>小红书号：9476976322</p>
                   <p>微信：18605399269</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <User size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">AI Persona Builder <span className="text-xs font-normal text-slate-500 ml-2 hidden sm:inline">拥有你全部社会关系的 AI 人格秘书</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />
             <button 
              onClick={handleImportClick} 
              className="hidden md:flex items-center gap-1 text-slate-500 hover:text-brand-600 transition"
              title="导入之前的 JSON 档案以继续编辑"
             >
                <Upload size={16}/> 导入旧档案
             </button>
             
             {lastSavedTime && (
                <span className="text-xs text-slate-400 hidden lg:flex items-center gap-1">
                   <RefreshCw size={10}/> 已自动保存 {lastSavedTime}
                </span>
             )}

             <button className="md:hidden" onClick={() => setShowMobilePreview(!showMobilePreview)}>
                {showMobilePreview ? <X/> : <Menu/>}
             </button>
             <span className="hidden md:inline">v1.0 Beta</span>
          </div>
        </div>
      </header>

      {/* Hero (Permanent) */}
      <div className="relative bg-slate-900 text-white py-16 px-4 shadow-lg overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-30">
             <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1600"
                  className="w-full h-full object-cover"
                  alt="Network background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/95"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6 z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-serif drop-shadow-2xl leading-tight">
            “人的本质是一切社会关系的总和”
          </h2>
          <p className="text-base md:text-xl text-slate-200 font-light italic tracking-wide drop-shadow-md">
            —— Karl Marx《关于费尔巴哈的提纲》
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6 text-sm text-brand-100 pt-6">
            <div className="flex items-center justify-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full"><CheckCircle size={16} className="text-brand-400"/> 一次填写，生成你的 AI 数字档案</div>
            <div className="flex items-center justify-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full"><CheckCircle size={16} className="text-brand-400"/> 让 AI 真正读懂你的语境</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex gap-8">
        
        {/* Left: Form Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 relative">
          
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-2 rounded-lg border ${currentStep === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'}`}
            >
              <ChevronLeft size={18} className="mr-1"/> 上一步
            </button>

            {currentStep < totalSteps ? (
              <button 
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                disabled={currentStep === 1 && !formData.owner_basic.name} // Simple validation example
                className="flex items-center px-6 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-lg shadow-brand-500/20"
              >
                下一步 <ChevronRight size={18} className="ml-1"/>
              </button>
            ) : (
              <button 
                onClick={handleGenerate}
                className="flex items-center px-8 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition font-bold shadow-lg shadow-brand-500/30"
              >
                <Save size={18} className="mr-2"/> 生成 AI 数字档案
              </button>
            )}
          </div>
        </div>

        {/* Right: Preview (Desktop) */}
        <div className={`
          fixed inset-0 z-40 bg-white md:static md:bg-transparent md:block md:w-80 lg:w-96 flex-shrink-0
          ${showMobilePreview ? 'block overflow-y-auto p-4' : 'hidden'}
        `}>
          <div className="md:sticky md:top-24 space-y-4">
             {/* Mobile Close Button */}
             <div className="md:hidden flex justify-end mb-4">
                <button onClick={() => setShowMobilePreview(false)} className="p-2 bg-slate-100 rounded-full"><X/></button>
             </div>

            <div className="bg-slate-900 text-slate-300 rounded-xl p-6 shadow-xl border border-slate-800">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Target size={18}/> 实时预览</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">WHO</div>
                  <p className="text-white font-medium">{formData.owner_basic.name || "你的名字"}</p>
                  <p>{formData.owner_basic.role} {formData.owner_basic.industry ? `| ${formData.owner_basic.industry}` : ""}</p>
                </div>
                
                {formData.professional_profile.one_sentence_bio && (
                  <div>
                     <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">BIO</div>
                     <p className="italic text-slate-400">"{formData.professional_profile.one_sentence_bio.substring(0, 80)}..."</p>
                  </div>
                )}

                <div>
                   <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">CONTEXT</div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800 p-2 rounded">
                        <span className="block text-xl font-bold text-brand-400">{formData.relationships.reduce((acc, cat) => acc + cat.people.length, 0)}</span>
                        <span className="text-xs">社会关系</span>
                      </div>
                      <div className="bg-slate-800 p-2 rounded">
                        <span className="block text-xl font-bold text-brand-400">{formData.goals_and_use_cases.typical_ai_use_cases.length}</span>
                        <span className="text-xs">场景目标</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Results Section */}
      {isGenerated && (
        <div ref={bottomRef} className="bg-slate-50 border-t border-slate-200 py-12 px-4 animate-slideUp">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">你的 AI 语境档案已就绪</h2>
              <p className="text-slate-600">现在，你可以复制 Prompt 去调教 AI，或者下载 JSON 存档。</p>
            </div>

            {/* Tab 1: System Prompt */}
            <div className="bg-white rounded-xl shadow-lg border border-brand-100 overflow-hidden">
              <div className="bg-brand-50 p-4 border-b border-brand-100 flex justify-between items-center">
                <h3 className="font-bold text-brand-800 flex items-center gap-2">
                  <MessageSquare size={18}/> System Prompt (中文)
                </h3>
                <div className="flex gap-2">
                  <button onClick={handleSendToAuthor} className="text-sm bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 px-3 py-1 rounded flex items-center transition" title="通过邮件分享给作者">
                    <Mail size={14} className="mr-1"/> 分享给作者
                  </button>
                  <button onClick={copyPrompt} className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded flex items-center transition shadow-sm">
                    <Copy size={14} className="mr-1"/> 复制内容
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 overflow-x-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed p-2">
                  {formData.system_prompt_summary_zh}
                </pre>
              </div>
            </div>

            {/* Tab 2: JSON */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
               <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Download size={18}/> 完整 JSON 档案
                </h3>
                <button onClick={downloadJson} className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded flex items-center transition">
                  <Download size={14} className="mr-1"/> 下载 .json
                </button>
              </div>
              <div className="p-4 bg-slate-900 overflow-x-auto max-h-96">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} AI Context Persona Builder. Local processing only.</p>
      </footer>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
