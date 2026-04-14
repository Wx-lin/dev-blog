import {
  LockOutlined,
  UserOutlined,
  EditOutlined,
  BarChartOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Form, Input, message } from 'antd';
import { authLogin } from '@/services/api';
import { setAdminToken } from '@/utils/token';

const FEATURES = [
  { icon: <EditOutlined />, text: '文章管理，一站式内容创作与发布' },
  { icon: <BarChartOutlined />, text: '数据看板，实时掌握博客运营状态' },
  { icon: <MessageOutlined />, text: '评论审核，维护健康的社区环境' },
  { icon: <TeamOutlined />, text: '用户管理，高效管理注册用户' },
];

export default function LoginPage() {
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      const res = await authLogin(values);
      const user = res.data;
      if (user.role !== 1) {
        message.error('该账号无管理员权限');
        return;
      }
      if (user.token) {
        setAdminToken(user.token);
      }
      message.success('登录成功');
      const searchParams = new URLSearchParams(history.location.search);
      const redirect = searchParams.get('redirect') || '/';
      window.location.href = redirect;
    } catch (err: any) {
      message.error(err.message || '登录失败，请检查账号密码');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* ── 左侧品牌区 ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 72px',
          background: 'linear-gradient(145deg, #1d1d42 0%, #2d2b6b 40%, #1a1a3e 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景光晕 */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', right: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo + 品牌名 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(99,102,241,0.5)',
            flexShrink: 0,
          }}>
            <EditOutlined style={{ fontSize: 22, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            ArchitectBlog
          </span>
        </div>

        {/* 标语 */}
        <h1 style={{
          fontSize: 38, fontWeight: 800, color: '#fff',
          lineHeight: 1.25, margin: '0 0 16px',
        }}>
          内容管理<br />
          <span style={{
            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            尽在掌握
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginBottom: 48, maxWidth: 360 }}>
          高效管理你的博客内容、用户与数据，专注于创作，让工具打理一切。
        </p>

        {/* 特性列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#818cf8', fontSize: 16 }}>{f.icon}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* 底部版权 */}
        <p style={{
          position: 'absolute', bottom: 32, left: 72,
          color: 'rgba(255,255,255,0.25)', fontSize: 12,
          margin: 0,
        }}>
          © {new Date().getFullYear()} ArchitectBlog · Admin Panel
        </p>
      </div>

      {/* ── 右侧登录区 ── */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        flexShrink: 0,
      }}>
        <div style={{ width: 360 }}>
          {/* 标题 */}
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}>
              <LockOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>
              欢迎回来
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
              使用管理员账号登录后台
            </p>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                placeholder="请输入用户名"
                size="large"
                style={{ borderRadius: 10, height: 48 }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
              style={{ marginBottom: 24 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                placeholder="请输入密码"
                size="large"
                style={{ borderRadius: 10, height: 48 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{
                  height: 48,
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
