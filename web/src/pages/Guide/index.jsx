import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { copy, showSuccess } from '../../helpers/utils';
import './Guide.css';

const BASE_URL = 'https://new.wuxie233.com';
const API_BASE = `${BASE_URL}/v1`;
const DEFAULT_MODEL = 'claude-opus-4-6';

// ---- Reusable sub-components ----

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    const ok = await copy(text);
    if (ok) {
      showSuccess('已复制到剪贴板');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);
  return (
    <button className='gp-copy-btn' onClick={handleCopy}>
      {copied ? '已复制' : '复制'}
    </button>
  );
}

function InfoBox({ type = 'tip', children }) {
  return <div className={`gp-info-box ${type}`}>{children}</div>;
}

// ---- Tool panel content components ----

function PanelAPI() {
  return (
    <>
      <h3>通过 API 直接调用</h3>
      <p>
        兼容 OpenAI SDK 格式，只需将 <code>base_url</code> 改为本站地址即可。
      </p>

      <h4>Python（推荐）</h4>
      <div className='gp-code-block'>
        <CopyButton
          text={`from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="${API_BASE}"
)

response = client.chat.completions.create(
    model="${DEFAULT_MODEL}",
    messages=[{"role": "user", "content": "你好"}]
)
print(response.choices[0].message.content)`}
        />
        <span className='kw'>from</span> openai <span className='kw'>import</span> OpenAI
        {'\n\n'}client = OpenAI({'\n'}
        {'    '}api_key=<span className='str'>"sk-your-api-key"</span>,{'\n'}
        {'    '}base_url=<span className='url'>"{API_BASE}"</span>
        {'\n'}){'\n\n'}response = client.chat.completions.create({'\n'}
        {'    '}model=<span className='str'>"{DEFAULT_MODEL}"</span>,{'\n'}
        {'    '}messages=[{'{'}<span className='str'>"role"</span>:{' '}
        <span className='str'>"user"</span>, <span className='str'>"content"</span>:{' '}
        <span className='str'>"你好"</span>
        {'}'}]{'\n'}){'\n'}
        <span className='kw'>print</span>(response.choices[<span className='kw'>0</span>
        ].message.content)
      </div>

      <h4>cURL</h4>
      <div className='gp-code-block'>
        <CopyButton
          text={`curl ${API_BASE}/chat/completions \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${DEFAULT_MODEL}",
    "messages": [{"role": "user", "content": "你好"}]
  }'`}
        />
        curl <span className='url'>{API_BASE}/chat/completions</span> \{'\n'}
        {'  '}-H <span className='str'>"Authorization: Bearer sk-your-api-key"</span> \{'\n'}
        {'  '}-H <span className='str'>"Content-Type: application/json"</span> \{'\n'}
        {'  '}-d <span className='str'>
          {"'{"}
          {'\n'}
          {'    '}"model": "{DEFAULT_MODEL}",{'\n'}
          {'    '}"messages": [{'{'}"role": "user", "content": "你好"{'}'}]{'\n'}
          {"  }'"}
        </span>
      </div>

      <h4>Node.js</h4>
      <div className='gp-code-block'>
        <CopyButton
          text={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: '${API_BASE}',
});

const resp = await client.chat.completions.create({
  model: '${DEFAULT_MODEL}',
  messages: [{ role: 'user', content: '你好' }],
});
console.log(resp.choices[0].message.content);`}
        />
        <span className='kw'>import</span> OpenAI <span className='kw'>from</span>{' '}
        <span className='str'>'openai'</span>;{'\n\n'}
        <span className='kw'>const</span> client = <span className='kw'>new</span> OpenAI({'{'}
        {'\n'}
        {'  '}apiKey: <span className='str'>'sk-your-api-key'</span>,{'\n'}
        {'  '}baseURL: <span className='url'>'{API_BASE}'</span>,{'\n'}
        {'}'});{'\n\n'}
        <span className='kw'>const</span> resp = <span className='kw'>await</span>{' '}
        client.chat.completions.create({'{'}
        {'\n'}
        {'  '}model: <span className='str'>'{DEFAULT_MODEL}'</span>,{'\n'}
        {'  '}messages: [{'{'} role: <span className='str'>'user'</span>, content:{' '}
        <span className='str'>'你好'</span> {'}'}],{'\n'}
        {'}'});{'\n'}
        console.log(resp.choices[<span className='kw'>0</span>].message.content);
      </div>

      <InfoBox type='tip'>
        <strong>API 地址：</strong>
        <code>{BASE_URL}</code>
        <br />
        兼容所有支持 OpenAI API 格式的工具和 SDK。将 base_url / API Base 改为以上地址即可。
      </InfoBox>
    </>
  );
}

function PanelClaudeCode() {
  return (
    <>
      <h3>在 Claude Code 中使用</h3>
      <p>Claude Code 是 Anthropic 官方的 CLI 编程助手，支持自定义 API 端点。</p>

      <h4>方法一：配置环境变量（推荐）</h4>
      <p>适用于所有系统。设置以下环境变量后启动 Claude Code 即可。</p>

      <h4>Windows（PowerShell）</h4>
      <div className='gp-code-block'>
        <CopyButton
          text={`# 临时设置（仅当前终端生效）
$env:ANTHROPIC_BASE_URL = "${BASE_URL}"
$env:ANTHROPIC_API_KEY = "sk-your-api-key"
claude`}
        />
        <span className='cmt'># 临时设置（仅当前终端生效）</span>
        {'\n'}$env:ANTHROPIC_BASE_URL = <span className='url'>"{BASE_URL}"</span>
        {'\n'}$env:ANTHROPIC_API_KEY = <span className='str'>"sk-your-api-key"</span>
        {'\n'}claude
      </div>
      <div className='gp-code-block'>
        <CopyButton
          text={`# 永久设置（写入用户环境变量）
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "${BASE_URL}", "User")
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-your-api-key", "User")`}
        />
        <span className='cmt'># 永久设置（写入用户环境变量）</span>
        {'\n'}[System.Environment]::SetEnvironmentVariable(
        <span className='str'>"ANTHROPIC_BASE_URL"</span>,{' '}
        <span className='url'>"{BASE_URL}"</span>, <span className='str'>"User"</span>)
        {'\n'}[System.Environment]::SetEnvironmentVariable(
        <span className='str'>"ANTHROPIC_API_KEY"</span>,{' '}
        <span className='str'>"sk-your-api-key"</span>, <span className='str'>"User"</span>)
      </div>

      <h4>macOS / Linux</h4>
      <div className='gp-code-block'>
        <CopyButton
          text={`# 临时设置
export ANTHROPIC_BASE_URL="${BASE_URL}"
export ANTHROPIC_API_KEY="sk-your-api-key"
claude`}
        />
        <span className='cmt'># 临时设置</span>
        {'\n'}<span className='kw'>export</span> ANTHROPIC_BASE_URL=
        <span className='url'>"{BASE_URL}"</span>
        {'\n'}<span className='kw'>export</span> ANTHROPIC_API_KEY=
        <span className='str'>"sk-your-api-key"</span>
        {'\n'}claude
      </div>
      <div className='gp-code-block'>
        <CopyButton
          text={`# 永久设置（写入 ~/.bashrc 或 ~/.zshrc）
echo 'export ANTHROPIC_BASE_URL="${BASE_URL}"' >> ~/.zshrc
echo 'export ANTHROPIC_API_KEY="sk-your-api-key"' >> ~/.zshrc
source ~/.zshrc`}
        />
        <span className='cmt'># 永久设置（写入 ~/.bashrc 或 ~/.zshrc）</span>
        {'\n'}<span className='kw'>echo</span>{' '}
        <span className='str'>'export ANTHROPIC_BASE_URL="{BASE_URL}"'</span> {'>> ~/.zshrc'}
        {'\n'}<span className='kw'>echo</span>{' '}
        <span className='str'>'export ANTHROPIC_API_KEY="sk-your-api-key"'</span>{' '}
        {'>> ~/.zshrc'}
        {'\n'}<span className='kw'>source</span> ~/.zshrc
      </div>

      <h4>方法二：VS Code settings.json</h4>
      <p>如果你通过 VS Code 扩展使用 Claude Code，也可以在 settings.json 中配置：</p>
      <div className='gp-code-block'>
        <CopyButton text={`{\n  "claude-code.anthropicBaseUrl": "${BASE_URL}"\n}`} />
        {'{'}
        {'\n'}
        {'  '}<span className='str'>"claude-code.anthropicBaseUrl"</span>:{' '}
        <span className='url'>"{BASE_URL}"</span>
        {'\n'}
        {'}'}
      </div>

      <InfoBox type='tip'>
        <strong>模型选择：</strong>进入 Claude Code 后，使用 <code>/model</code>{' '}
        命令切换模型。可用模型取决于你令牌的模型权限。
      </InfoBox>
    </>
  );
}

function PanelCline() {
  return (
    <>
      <h3>在 Cline / Roo Code 中使用</h3>
      <p>Cline 和 Roo Code 是 VS Code 中流行的 AI 编程扩展，支持自定义 API 端点。</p>

      <ol>
        <li>
          安装 <strong>Cline</strong> 或 <strong>Roo Code</strong> 扩展（VS Code
          扩展市场搜索安装）
        </li>
        <li>
          打开扩展设置，API Provider 选择 <strong>OpenAI Compatible</strong>
        </li>
        <li>填入以下配置：</li>
      </ol>

      <div className='gp-code-block'>
        <CopyButton text={`API Base URL:  ${API_BASE}\nAPI Key:       sk-your-api-key\nModel ID:      ${DEFAULT_MODEL}`} />
        API Base URL:{'  '}<span className='url'>{API_BASE}</span>
        {'\n'}API Key:{'       '}<span className='str'>sk-your-api-key</span>
        {'\n'}Model ID:{'      '}<span className='str'>{DEFAULT_MODEL}</span>
      </div>

      <InfoBox type='tip'>
        <strong>查看可用模型：</strong>登录控制台后，在「模型」页面可查看所有可用模型的 ID。
      </InfoBox>
    </>
  );
}

function PanelOpenCode() {
  return (
    <>
      <h3>在 OpenCode 中使用</h3>
      <p>
        OpenCode
        是一款开源终端 AI 编程助手，支持通过 OpenAI
        兼容适配器接入自定义 API。配置比其他工具稍复杂，需要手动声明模型能力和上下文窗口。
      </p>

      <h4>第一步：安装适配器</h4>
      <p>OpenCode 使用 npm 适配器连接第三方 API，需要先全局安装：</p>
      <div className='gp-code-block'>
        <CopyButton text='npm install -g @ai-sdk/openai-compatible' />
        npm install -g @ai-sdk/openai-compatible
      </div>

      <h4>第二步：创建配置文件</h4>
      <p>
        在项目根目录创建 <code>opencode.json</code>（或全局配置{' '}
        <code>~/.config/opencode/opencode.json</code>）：
      </p>
      <div className='gp-code-block'>
        <CopyButton
          text={`{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "newapi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "NewAPI",
      "options": {
        "baseURL": "${API_BASE}",
        "apiKey": "{env:NEWAPI_API_KEY}"
      },
      "models": {
        "${DEFAULT_MODEL}": {
          "name": "Claude Opus 4",
          "limit": { "context": 200000, "output": 32000 }
        },
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 65536 }
        },
        "gpt-4o": {
          "name": "GPT-4o",
          "limit": { "context": 128000, "output": 16384 }
        }
      }
    }
  },
  "model": "newapi/${DEFAULT_MODEL}"
}`}
        />
        {'{'}
        {'\n'}{'  '}<span className='str'>"$schema"</span>: <span className='str'>"https://opencode.ai/config.json"</span>,
        {'\n'}{'  '}<span className='str'>"provider"</span>: {'{'}
        {'\n'}{'    '}<span className='str'>"newapi"</span>: {'{'}
        {'\n'}{'      '}<span className='str'>"npm"</span>: <span className='str'>"@ai-sdk/openai-compatible"</span>,
        {'\n'}{'      '}<span className='str'>"name"</span>: <span className='str'>"NewAPI"</span>,
        {'\n'}{'      '}<span className='str'>"options"</span>: {'{'}
        {'\n'}{'        '}<span className='str'>"baseURL"</span>: <span className='url'>"{API_BASE}"</span>,
        {'\n'}{'        '}<span className='str'>"apiKey"</span>: <span className='str'>'{'{'}env:NEWAPI_API_KEY{'}'}'</span>
        {'\n'}{'      '}
        {'},'}
        {'\n'}{'      '}<span className='str'>"models"</span>: {'{'}
        {'\n'}{'        '}<span className='str'>"{DEFAULT_MODEL}"</span>: {'{'}
        {'\n'}{'          '}<span className='str'>"name"</span>: <span className='str'>"Claude Opus 4"</span>,
        {'\n'}{'          '}<span className='str'>"limit"</span>: {'{'} <span className='str'>"context"</span>: <span className='kw'>200000</span>, <span className='str'>"output"</span>: <span className='kw'>32000</span> {'}'}
        {'\n'}{'        '}
        {'},'}
        {'\n'}{'        '}<span className='str'>"claude-sonnet-4-20250514"</span>: {'{'}
        {'\n'}{'          '}<span className='str'>"name"</span>: <span className='str'>"Claude Sonnet 4"</span>,
        {'\n'}{'          '}<span className='str'>"limit"</span>: {'{'} <span className='str'>"context"</span>: <span className='kw'>200000</span>, <span className='str'>"output"</span>: <span className='kw'>65536</span> {'}'}
        {'\n'}{'        '}
        {'},'}
        {'\n'}{'        '}<span className='str'>"gpt-4o"</span>: {'{'}
        {'\n'}{'          '}<span className='str'>"name"</span>: <span className='str'>"GPT-4o"</span>,
        {'\n'}{'          '}<span className='str'>"limit"</span>: {'{'} <span className='str'>"context"</span>: <span className='kw'>128000</span>, <span className='str'>"output"</span>: <span className='kw'>16384</span> {'}'}
        {'\n'}{'        '}{'}'}
        {'\n'}{'      '}{'}'}
        {'\n'}{'    '}{'}'}
        {'\n'}{'  '}{'}'},
        {'\n'}{'  '}<span className='str'>"model"</span>: <span className='str'>"newapi/{DEFAULT_MODEL}"</span>
        {'\n'}{'}'}
      </div>

      <h4>第三步：设置 API Key</h4>
      <p>
        通过环境变量设置密钥（对应配置中的 <code>{'{'}env:NEWAPI_API_KEY{'}'}</code>）：
      </p>
      <div className='gp-code-block'>
        <CopyButton
          text={`# macOS / Linux
export NEWAPI_API_KEY="sk-your-api-key"

# Windows PowerShell
$env:NEWAPI_API_KEY = "sk-your-api-key"`}
        />
        <span className='cmt'># macOS / Linux</span>
        {'\n'}<span className='kw'>export</span> NEWAPI_API_KEY=
        <span className='str'>"sk-your-api-key"</span>
        {'\n\n'}<span className='cmt'># Windows PowerShell</span>
        {'\n'}$env:NEWAPI_API_KEY = <span className='str'>"sk-your-api-key"</span>
      </div>
      <p>
        或者在 OpenCode 中运行 <code>/connect</code> 命令交互式设置。
      </p>

      <h4>使用与切换模型</h4>
      <p>
        配置完成后，启动 OpenCode 即可使用。在 OpenCode 中使用 <code>/models</code>{' '}
        命令切换模型。模型格式为 <code>provider-id/model-id</code>，例如{' '}
        <code>newapi/{DEFAULT_MODEL}</code>。
      </p>

      <InfoBox type='warn'>
        <strong>常见坑点：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 18 }}>
          <li>
            <code>baseURL</code> 必须以 <code>/v1</code> 结尾，不要写成{' '}
            <code>/v1/chat/completions</code>
          </li>
          <li>
            每个模型必须手动声明 <code>limit.context</code> 和 <code>limit.output</code>
            ，否则 OpenCode 无法正确管理对话窗口
          </li>
          <li>
            如果模型需要图片输入能力，需额外添加{' '}
            <code>"modalities": ["image"]</code> 属性（未写入官方文档的隐藏配置）
          </li>
          <li>
            确保已全局安装 <code>@ai-sdk/openai-compatible</code>，否则 OpenCode
            找不到适配器
          </li>
        </ul>
      </InfoBox>
    </>
  );
}

function PanelCursor() {
  return (
    <>
      <h3>在 Cursor 中使用</h3>
      <p>
        Cursor 是集成 AI 的代码编辑器，支持自定义 API Key（BYOK 模式）接入第三方 API 服务。
      </p>

      <h4>配置步骤</h4>
      <ol>
        <li>
          打开 Cursor，点击左下角 <strong>Settings</strong>（齿轮图标）
        </li>
        <li>
          进入 <strong>Models</strong> 设置页面
        </li>
        <li>
          找到 <strong>OpenAI API Keys</strong> 区域，粘贴你的 API Key
        </li>
        <li>
          开启 <strong>Override OpenAI Base URL</strong>，填入：
        </li>
      </ol>

      <div className='gp-code-block'>
        <CopyButton text={API_BASE} />
        <span className='url'>{API_BASE}</span>
      </div>

      <ol start={5}>
        <li>
          点击 <strong>Verify</strong> 验证连接
        </li>
        <li>
          在下方模型列表中勾选你需要的模型，或点击 <strong>+ Add model</strong> 手动添加模型
          ID：
        </li>
      </ol>

      <div className='gp-code-block'>
        <CopyButton text={`${DEFAULT_MODEL}\nclaude-sonnet-4-20250514\ngpt-4o\ndeepseek-chat`} />
        {DEFAULT_MODEL}{'\n'}claude-sonnet-4-20250514{'\n'}gpt-4o{'\n'}deepseek-chat
      </div>

      <ol start={7}>
        <li>保存设置，重启 Cursor 使配置生效</li>
      </ol>

      <InfoBox type='warn'>
        <strong>已知限制：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 18 }}>
          <li>Override Base URL 会对所有使用 OpenAI Key 的模型生效，无法单独指定</li>
          <li>部分特有功能（如 Tab 自动补全）需要特定模型，不支持自定义 Key</li>
          <li>如果遇到 TLS 或连接错误，可尝试在 Cursor 高级设置中关闭 HTTP/2</li>
        </ul>
      </InfoBox>

      <InfoBox type='tip'>
        <strong>推荐配置：</strong>在 Models 页面的 Anthropic API Keys 区域也可以单独填入
        Key，Cursor 会自动路由 Claude 系列模型。但使用 Override Base URL
        方式可以一个 Key 覆盖所有模型。
      </InfoBox>
    </>
  );
}

function PanelCherry() {
  return (
    <>
      <h3>在 Cherry Studio 中使用</h3>
      <p>Cherry Studio 是一款多模型桌面 AI 客户端，支持自定义 OpenAI 兼容接口。</p>

      <ol>
        <li>
          下载并安装{' '}
          <a href='https://cherry-ai.com' target='_blank' rel='noopener noreferrer'>
            Cherry Studio
          </a>
        </li>
        <li>打开设置 → 模型服务商 → 添加自定义服务商</li>
        <li>
          填写配置：
          <ul>
            <li>
              <strong>名称：</strong>NewAPI（自定义）
            </li>
            <li>
              <strong>API 地址：</strong>
              <code>{BASE_URL}</code>
            </li>
            <li>
              <strong>API 密钥：</strong>你的 API Key
            </li>
          </ul>
        </li>
        <li>
          点击「获取模型列表」或手动添加模型 ID，如 <code>{DEFAULT_MODEL}</code>
        </li>
        <li>在对话界面选择 NewAPI 服务商和对应模型开始使用</li>
      </ol>

      <InfoBox type='warn'>
        <strong>注意：</strong>Cherry Studio 的 API 地址末尾不需要加 <code>/v1</code>
        ，它会自动拼接。如果调用报错，检查是否重复添加了路径。
      </InfoBox>
    </>
  );
}

function PanelChatBox() {
  return (
    <>
      <h3>在 ChatBox 中使用</h3>
      <p>
        ChatBox 是一款跨平台 AI 桌面客户端，支持 Windows / macOS / Linux / iOS / Android。
      </p>

      <ol>
        <li>
          下载并安装{' '}
          <a href='https://chatboxai.app' target='_blank' rel='noopener noreferrer'>
            ChatBox
          </a>
        </li>
        <li>
          打开设置 → AI 模型提供商 → 选择 <strong>OpenAI API</strong>
        </li>
        <li>
          填写配置：
          <ul>
            <li>
              <strong>API Domain：</strong>
              <code>{BASE_URL}</code>
            </li>
            <li>
              <strong>API Key：</strong>你的 API Key
            </li>
            <li>
              <strong>Model：</strong>手动输入 <code>{DEFAULT_MODEL}</code>
            </li>
          </ul>
        </li>
        <li>保存后即可在对话页面使用</li>
      </ol>

      <InfoBox type='tip'>
        <strong>多模型切换：</strong>你可以添加多个模型配置（如 gpt-4o、deepseek-chat
        ），在对话时随时切换。
      </InfoBox>
    </>
  );
}

// ---- Tool tab definitions ----
const TOOLS = [
  { id: 'api', label: 'API 直接调用', Panel: PanelAPI },
  { id: 'claudecode', label: 'Claude Code', Panel: PanelClaudeCode },
  { id: 'cline', label: 'Cline / Roo Code', Panel: PanelCline },
  { id: 'opencode', label: 'OpenCode', Panel: PanelOpenCode },
  { id: 'cursor', label: 'Cursor', Panel: PanelCursor },
  { id: 'cherry', label: 'Cherry Studio', Panel: PanelCherry },
  { id: 'chatbox', label: 'ChatBox', Panel: PanelChatBox },
];

// ---- Feature definitions ----
const FEATURES = [
  {
    icon: (
      <svg viewBox='0 0 24 24'>
        <path d='M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' />
      </svg>
    ),
    title: '更优价格',
    desc: '聚合多家供应商，按量计费，无月费，用多少付多少',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24'>
        <path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' />
      </svg>
    ),
    title: '高可用',
    desc: '多通道智能路由，自动故障转移，持续稳定服务',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24'>
        <path d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71' />
        <path d='M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71' />
      </svg>
    ),
    title: '完全兼容',
    desc: '兼容 OpenAI API 格式，支持 30+ 模型，无需改代码',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24'>
        <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
      </svg>
    ),
    title: '安全可控',
    desc: '独立 API Key 管理，支持额度限制与模型白名单',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24'>
        <path d='M18 20V10M12 20V4M6 20v-6' />
      </svg>
    ),
    title: '实时监控',
    desc: '每笔调用都有详细日志，Token 消耗与费用一目了然',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='10' />
        <circle cx='12' cy='12' r='6' />
        <circle cx='12' cy='12' r='2' />
      </svg>
    ),
    title: '简单易用',
    desc: '5 分钟完成接入，多语言示例和教程，开箱即用',
  },
];

// ---- Steps ----
const STEPS = [
  { num: 1, title: '注册账号', desc: '使用邮箱注册，完成验证后即可登录控制台' },
  { num: 2, title: '充值额度', desc: '通过激活码充值，或使用其他支付方式获取额度' },
  { num: 3, title: '创建令牌', desc: '在「令牌」页面创建 API Key，可设置额度和模型范围' },
  { num: 4, title: '接入调用', desc: '将 API 地址改为本站，用你熟悉的工具开始调用' },
];

// ===== Main Component =====
function Guide() {
  const [activeTool, setActiveTool] = useState('api');
  const pageRef = useRef(null);

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('gp-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = root.querySelectorAll('.gp-animate-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const ActivePanel = TOOLS.find((t) => t.id === activeTool)?.Panel || PanelAPI;

  return (
    <div className='guide-page' ref={pageRef}>
      {/* ========== Hero ========== */}
      <section className='gp-hero'>
        <div className='gp-blur-ball gp-blur-ball-1' />
        <div className='gp-blur-ball gp-blur-ball-2' />
        <div className='gp-hero-content gp-animate-in'>
          <div className='gp-hero-badge'>
            <span className='gp-dot' />
            OpenAI 兼容接口 · 30+ 模型
          </div>
          <h1>
            <span className='gp-gradient'>NewAPI</span> 使用指南
          </h1>
          <p>
            一个 API Key 调用 Claude、GPT、Gemini、DeepSeek 等主流模型。
            <br />
            兼容 OpenAI 格式，零改动接入。
          </p>
          <div className='gp-hero-actions'>
            <Link to='/register' className='gp-btn gp-btn-primary'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path d='M5 12h14M12 5l7 7-7 7' />
              </svg>
              注册账号
            </Link>
            <Link to='/pricing' className='gp-btn gp-btn-outline'>
              查看定价
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Quick Start ========== */}
      <div className='gp-container'>
        <section className='gp-section'>
          <div className='gp-section-header gp-animate-in'>
            <h2 className='gp-section-title'>快速开始</h2>
            <p className='gp-section-desc'>4 步完成接入，开始调用 AI 模型</p>
          </div>
          <div className='gp-steps-grid'>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`gp-step-card gp-animate-in gp-delay-${i + 1}`}
              >
                <div className='gp-step-number'>{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <hr className='gp-section-divider' />

      {/* ========== Tool Guides ========== */}
      <div className='gp-container'>
        <section className='gp-section'>
          <div className='gp-section-header gp-animate-in'>
            <h2 className='gp-section-title'>接入教程</h2>
            <p className='gp-section-desc'>选择你的使用方式，按步骤完成配置</p>
          </div>

          <div className='gp-tool-card'>
            <div className='gp-tool-tabs'>
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  className={`gp-tool-tab${activeTool === tool.id ? ' active' : ''}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <div className='gp-tool-panel'>
              <ActivePanel />
            </div>
          </div>
        </section>
      </div>

      <hr className='gp-section-divider' />

      {/* ========== Features ========== */}
      <div className='gp-container'>
        <section className='gp-section'>
          <div className='gp-section-header gp-animate-in'>
            <h2 className='gp-section-title'>平台优势</h2>
            <p className='gp-section-desc'>一站式解决 AI API 接入需求</p>
          </div>
          <div className='gp-features-grid'>
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className={`gp-feature-item gp-animate-in gp-delay-${(i % 4) + 1}`}
              >
                <div className='gp-feature-icon'>{feat.icon}</div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ========== CTA ========== */}
      <section className='gp-cta'>
        <div className='gp-cta-blur' />
        <div className='gp-cta-content gp-animate-in'>
          <h2>准备好开始了吗？</h2>
          <p>注册即可免费体验，无需信用卡</p>
          <div className='gp-hero-actions'>
            <Link to='/register' className='gp-btn gp-btn-primary'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path d='M5 12h14M12 5l7 7-7 7' />
              </svg>
              免费注册
            </Link>
            <Link to='/console' className='gp-btn gp-btn-outline'>
              进入控制台
            </Link>
          </div>
        </div>
      </section>

      <footer className='gp-footer'>
        <p>&copy; 2025 NewAPI</p>
      </footer>
    </div>
  );
}

export default Guide;
