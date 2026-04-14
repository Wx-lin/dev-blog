import {
  FileTextOutlined,
  EyeOutlined,
  MessageOutlined,
  TeamOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  ArrowRightOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Link, useModel, useRequest } from '@umijs/max';
import { Button, Col, Divider, Progress, Row, Skeleton, Tooltip, theme } from 'antd';
import { getDashboardOverview } from '@/services/api';

type DKey = keyof API.DashboardDTO;

const STATS: { key: DKey; label: string; desc: string; icon: React.ReactNode; color: string; href: string }[] = [
  { key: 'totalArticles',   label: '文章',   desc: '已收录文章总数',     icon: <FileTextOutlined />, color: '#4f46e5', href: '/articles'   },
  { key: 'totalViewCount',  label: '阅读量', desc: '全站累计浏览次数',   icon: <EyeOutlined />,      color: '#0284c7', href: '/articles'   },
  { key: 'totalComments',   label: '评论',   desc: '用户提交的评论总数', icon: <MessageOutlined />,  color: '#7c3aed', href: '/comments'   },
  { key: 'totalUsers',      label: '用户',   desc: '注册用户总数',       icon: <TeamOutlined />,     color: '#0891b2', href: '/users'      },
  { key: 'totalCategories', label: '分类',   desc: '文章分类数量',       icon: <AppstoreOutlined />, color: '#d97706', href: '/categories' },
  { key: 'totalTags',       label: '标签',   desc: '文章标签数量',       icon: <TagsOutlined />,     color: '#059669', href: '/tags'       },
];

/* ─── 统计卡 ── */
function StatCard({
  label, desc, value, icon, color, href, loading,
}: {
  label: string; desc: string; value: number;
  icon: React.ReactNode; color: string; href: string; loading: boolean;
}) {
  const { token } = theme.useToken();
  return (
    <Link to={href} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 12,
          padding: '20px 22px',
          transition: 'box-shadow 0.18s, border-color 0.18s',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = token.boxShadowSecondary;
          e.currentTarget.style.borderColor = color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = token.colorBorderSecondary;
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color,
          }}>
            {icon}
          </div>
          <ArrowRightOutlined style={{ fontSize: 11, color: token.colorTextQuaternary }} />
        </div>

        {loading ? (
          <Skeleton.Input active size="small" style={{ width: 72, height: 32, marginBottom: 6 }} />
        ) : (
          <div style={{ fontSize: 30, fontWeight: 700, color: token.colorText, lineHeight: 1, marginBottom: 6 }}>
            {value.toLocaleString()}
          </div>
        )}

        <div style={{ fontSize: 13, color: token.colorTextSecondary }}>
          <span style={{ fontWeight: 500, color: token.colorText, marginRight: 4 }}>{label}</span>
          {desc}
        </div>
      </div>
    </Link>
  );
}

/* ─── 卡片容器 ── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { token } = theme.useToken();
  return (
    <div style={{
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: 12,
      padding: '22px 24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── 区块标题 ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div style={{ fontSize: 14, fontWeight: 600, color: token.colorText, marginBottom: 14 }}>
      {children}
    </div>
  );
}

/* ─── 主页面 ── */
export default function DashboardPage() {
  const { token } = theme.useToken();
  const { data, loading } = useRequest(getDashboardOverview);
  const { initialState } = useModel('@@initialState');
  const d = data?.data;

  const publishRate = d?.totalArticles ? Math.round((d.publishedArticles / d.totalArticles) * 100) : 0;
  const draftRate   = d?.totalArticles ? Math.round((d.draftArticles   / d.totalArticles) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
  const nickname = initialState?.currentUser?.nickname || '管理员';

  return (
    <PageContainer title={null} style={{ paddingTop: 0 }}>

      {/* ── 页头 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, paddingBottom: 20,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: token.colorText, lineHeight: 1.3 }}>
            {greeting}，{nickname}
          </div>
          <div style={{ fontSize: 13, color: token.colorTextTertiary, marginTop: 4 }}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
        <Link to="/articles">
          <Button type="primary" icon={<EditOutlined />} style={{ borderRadius: 8 }}>写文章</Button>
        </Link>
      </div>

      {/* ── 统计卡片 ── */}
      <SectionTitle>数据总览</SectionTitle>
      <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
        {STATS.map((s) => (
          <Col xs={12} sm={8} lg={4} key={s.key}>
            <StatCard
              label={s.label} desc={s.desc}
              value={d?.[s.key] ?? 0}
              icon={s.icon} color={s.color} href={s.href} loading={loading}
            />
          </Col>
        ))}
      </Row>

      {/* ── 下方双栏 ── */}
      <Row gutter={16}>

        {/* 文章发布分布 */}
        <Col xs={24} lg={14}>
          <Card>
            <SectionTitle>文章发布分布</SectionTitle>
            {loading ? <Skeleton active paragraph={{ rows: 4 }} /> : (
              <>
                {/* 已发布 */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: token.colorTextSecondary }}>已发布</span>
                    <span style={{ fontSize: 13, color: token.colorTextSecondary }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: token.colorText, marginRight: 4 }}>
                        {d?.publishedArticles ?? 0}
                      </span>
                      篇 · {publishRate}%
                    </span>
                  </div>
                  <Progress percent={publishRate} strokeColor="#4f46e5" trailColor={token.colorFillSecondary} showInfo={false} strokeWidth={7} />
                </div>

                {/* 草稿 */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: token.colorTextSecondary }}>草稿</span>
                    <span style={{ fontSize: 13, color: token.colorTextSecondary }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: token.colorText, marginRight: 4 }}>
                        {d?.draftArticles ?? 0}
                      </span>
                      篇 · {draftRate}%
                    </span>
                  </div>
                  <Progress percent={draftRate} strokeColor="#d97706" trailColor={token.colorFillSecondary} showInfo={false} strokeWidth={7} />
                </div>

                <Divider style={{ margin: '0 0 18px' }} />

                {/* 汇总行 */}
                <div style={{ display: 'flex' }}>
                  {[
                    { label: '合计文章', value: d?.totalArticles ?? 0,  color: '#4f46e5' },
                    { label: '全站阅读', value: d?.totalViewCount ?? 0, color: '#0284c7' },
                    { label: '全部评论', value: d?.totalComments ?? 0,  color: '#7c3aed' },
                  ].map((item, i) => (
                    <div key={item.label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      {i > 0 && (
                        <div style={{
                          position: 'absolute', left: 0, top: '10%', bottom: '10%',
                          width: 1, background: token.colorBorderSecondary,
                        }} />
                      )}
                      <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
                        {item.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 4 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* 右侧 */}
        <Col xs={24} lg={10}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* 待处理 */}
            <Card>
              <SectionTitle>待处理事项</SectionTitle>
              {loading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                d?.pendingComments && d.pendingComments > 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: token.colorWarningBg,
                    border: `1px solid ${token.colorWarningBorder}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <ExclamationCircleOutlined style={{ color: token.colorWarning, fontSize: 15 }} />
                      <span style={{ fontSize: 13, color: token.colorWarningText }}>
                        <strong>{d.pendingComments}</strong> 条评论待审核
                      </span>
                    </div>
                    <Link to="/comments">
                      <span style={{ fontSize: 12, color: token.colorPrimary, cursor: 'pointer', fontWeight: 500 }}>
                        去处理 <ArrowRightOutlined style={{ fontSize: 10 }} />
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: token.colorTextSecondary, fontSize: 13 }}>
                    <CheckOutlined style={{ color: token.colorSuccess }} />
                    暂无待处理事项
                  </div>
                )
              )}
            </Card>

            {/* 站点概况 */}
            <Card>
              <SectionTitle>站点概况</SectionTitle>
              {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : (
                <div>
                  {[
                    { label: '用户总数',   value: `${d?.totalUsers ?? 0} 人`,      color: '#0891b2' },
                    { label: '文章分类',   value: `${d?.totalCategories ?? 0} 个`, color: '#d97706' },
                    { label: '文章标签',   value: `${d?.totalTags ?? 0} 个`,       color: '#059669' },
                    {
                      label: '评论通过率',
                      value: d?.totalComments
                        ? `${Math.round(((d.totalComments - (d.pendingComments ?? 0)) / d.totalComments) * 100)}%`
                        : '—',
                      color: '#4f46e5',
                    },
                  ].map((row, i, arr) => (
                    <div key={row.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0' }}>
                        <span style={{ fontSize: 13, color: token.colorTextSecondary }}>{row.label}</span>
                        <Tooltip title="">
                          <span style={{ fontSize: 14, fontWeight: 600, color: row.color }}>{row.value}</span>
                        </Tooltip>
                      </div>
                      {i < arr.length - 1 && <Divider style={{ margin: 0 }} />}
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        </Col>
      </Row>
    </PageContainer>
  );
}
