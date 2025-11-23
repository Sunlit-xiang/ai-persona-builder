
export interface Person {
  id: string; // Internal ID for React keys
  alias: string;
  role_to_me: string;
  closeness: '非常熟' | '一般熟' | '较陌生' | '';
  preferred_tone: '非常正式' | '正式但友好' | '轻松随和' | '半开玩笑' | '';
  focus_points: string;
  my_goal_with_this_role: string;
}

export interface RelationshipCategory {
  id: string; // Internal ID
  label: string;
  people: Person[];
}

export interface UseCase {
  id: string;
  name: string;
  expected_outcome: string;
  special_requirements: string;
}

export interface ExampleDialogue {
  id: string;
  user_question: string;
  what_went_wrong_before: string;
  ideal_answer_description: string;
}

export interface UserProfile {
  version: string;
  last_updated: string;
  owner_basic: {
    name: string;
    preferred_name: string;
    city: string;
    timezone: string;
    role: string;
    industry: string;
    years_of_experience: string;
    working_languages: string[]; // Handled as string in form, split for JSON
  };
  professional_profile: {
    one_sentence_bio: string;
    core_skills: string[]; // Handled as comma-separated string in form
    typical_scenarios: string[]; // Handled as newline-separated string in form
  };
  organization: {
    org_name: string;
    industry: string;
    stage: string;
    products_services: string;
    target_customers: string;
    business_model: string;
  };
  relationships: RelationshipCategory[];
  communication_preferences: {
    default_tone: string;
    length_preference: string;
    style_traits: string[];
    avoid_phrases: string;
    avoid_behaviors: string;
  };
  constraints: {
    forbidden_topics: string;
    confidentiality_rules: string;
    do_not_do_list: string;
  };
  goals_and_use_cases: {
    short_term_goals: string;
    long_term_goals: string;
    typical_ai_use_cases: UseCase[];
  };
  example_dialogues: ExampleDialogue[];
  system_prompt_summary_zh: string;
}

// Initial State Factory
export const createInitialState = (): UserProfile => ({
  version: "1.0",
  last_updated: new Date().toISOString().split('T')[0],
  owner_basic: {
    name: "",
    preferred_name: "",
    city: "",
    timezone: "GMT+8",
    role: "",
    industry: "",
    years_of_experience: "",
    working_languages: ["中文"],
  },
  professional_profile: {
    one_sentence_bio: "",
    core_skills: [],
    typical_scenarios: [],
  },
  organization: {
    org_name: "",
    industry: "",
    stage: "",
    products_services: "",
    target_customers: "",
    business_model: "",
  },
  relationships: [
    { id: 'rel-1', label: "上级/老板", people: [] },
    { id: 'rel-2', label: "同级同事", people: [] },
    { id: 'rel-3', label: "下属/团队成员", people: [] },
    { id: 'rel-4', label: "重要客户/甲方", people: [] },
    { id: 'rel-5', label: "合作伙伴/供应商", people: [] },
    { id: 'rel-6', label: "投资人/顾问", people: [] },
    { id: 'rel-8', label: "个人人脉 (家人/朋友/导师)", people: [] },
    { id: 'rel-7', label: "其他", people: [] }
  ],
  communication_preferences: {
    default_tone: "专业但亲和",
    length_preference: "中等长度，有结构有逻辑",
    style_traits: [],
    avoid_phrases: "",
    avoid_behaviors: "",
  },
  constraints: {
    forbidden_topics: "",
    confidentiality_rules: "默认假设所有具体公司名称都应做匿名化处理",
    do_not_do_list: "不直接帮我写谎言、不伪造经历",
  },
  goals_and_use_cases: {
    short_term_goals: "",
    long_term_goals: "",
    typical_ai_use_cases: [],
  },
  example_dialogues: [],
  system_prompt_summary_zh: "",
});
