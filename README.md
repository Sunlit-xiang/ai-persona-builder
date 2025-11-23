# 拥有你全部社会关系的 AI 人格秘书 (AI Persona Builder)

这是一个帮助用户构建“个人语境”的工具，生成的 JSON 档案可以让 ChatGPT、Claude、Gemini 等 AI 更好地理解你的职业背景和社会关系。

## 🔒 安全声明

**本项目是纯前端应用 (Client-side Only)。**

*   **无需 API Key**：本项目不直接调用任何大模型 API，因此不需要您配置 `GEMINI_API_KEY` 或 `OPENAI_API_KEY`。
*   **本地处理**：所有数据生成均在您的浏览器本地完成，不会上传到任何服务器。
*   **隐私安全**：生成的档案由您自己掌控，通过复制或下载的方式使用。

## 🚀 如何部署

本项目适配 Vercel 一键部署。

1. Fork 本仓库到你的 GitHub。
2. 在 Vercel 中点击 "Add New Project"。
3. 导入本仓库。
4. Framework Preset 选择 **Vite**。
5. 点击 Deploy。

无需配置环境变量。

## 🛠️ 本地开发

1. `npm install`
2. `npm run dev`
