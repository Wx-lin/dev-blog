import { history, RequestConfig } from '@umijs/max';
import { message, Dropdown, Tooltip, Button } from 'antd';
import { LogoutOutlined, UserOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { createElement } from 'react';
import { getAdminToken, removeAdminToken } from '@/utils/token';
import { authLogout } from '@/services/api';
import { ThemeProvider, useTheme } from '@/utils/themeContext';

// ---- 全局初始状态 ----
export async function getInitialState(): Promise<{
  user?: API.UserDTO;
  currentUser?: API.UserDTO;
}> {
  if (history.location.pathname !== '/login') {
    const token = getAdminToken();
    if (!token) {
      history.push(`/login?redirect=${encodeURIComponent(history.location.pathname)}`);
      return {};
    }
    try {
      const res = await fetch('/api/user/info', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.code === 0) {
        return { user: json.data, currentUser: json.data };
      }
    } catch {}
    removeAdminToken();
    history.push('/login');
  }
  return {};
}

// ---- 主题切换按钮 ----
// 在 ProLayout actionsRender 里渲染，此时已在 ThemeProvider 内，可安全使用 useTheme
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return createElement(
    Tooltip,
    { title: isDark ? '切换浅色' : '切换深色', placement: 'bottom' },
    createElement(Button, {
      type: 'text',
      shape: 'circle',
      icon: isDark ? createElement(SunOutlined) : createElement(MoonOutlined),
      onClick: toggleTheme,
      style: { color: isDark ? '#facc15' : '#6366f1' },
    }),
  );
}

// ---- ProLayout 运行时配置 ----
export const layout = ({ initialState }: { initialState?: { user?: API.UserDTO } }) => {
  const handleLogout = async () => {
    await authLogout().catch(() => {});
    removeAdminToken();
    message.success('已退出登录');
    history.push('/login');
  };

  const user = initialState?.user;

  return {
    logo: false,
    menu: { locale: false },
    actionsRender: () => [createElement(ThemeToggle, { key: 'theme' })],
    avatarProps: user
      ? {
          src: user.avatar || undefined,
          title: user.nickname,
          size: 'small',
          render: (_props: any, dom: any) =>
            createElement(
              Dropdown,
              {
                menu: {
                  items: [
                    {
                      key: 'user',
                      label: user.nickname,
                      icon: createElement(UserOutlined),
                      disabled: true,
                    },
                    { type: 'divider', key: 'divider' },
                    {
                      key: 'logout',
                      label: '退出登录',
                      icon: createElement(LogoutOutlined),
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
                },
                trigger: ['click'],
              },
              createElement('span', { style: { cursor: 'pointer' } }, dom),
            ),
        }
      : undefined,
    onPageChange: () => {
      const { pathname } = history.location;
      if (!initialState?.user && pathname !== '/login') {
        history.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    },
    footerRender: () => null,
  };
};

// ---- rootContainer：ThemeProvider 在最外层，不依赖任何 UmiJS context ----
export function rootContainer(container: React.ReactNode) {
  return createElement(ThemeProvider, {}, container);
}

// ---- request 请求配置 ----
export const request: RequestConfig = {
  baseURL: '',
  withCredentials: false,
  errorConfig: {
    errorHandler(error: any, opts: any) {
      if (opts?.skipErrorHandler) throw error;
    },
  },
  requestInterceptors: [
    (config: any) => {
      const token = getAdminToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      const data = response.data;
      if (data?.code === 401) {
        removeAdminToken();
        history.push('/login');
        return Promise.reject(new Error('未登录或登录已过期，请重新登录'));
      }
      if (data?.code !== 0) {
        return Promise.reject(new Error(data?.message || '请求失败'));
      }
      return response;
    },
  ],
};
