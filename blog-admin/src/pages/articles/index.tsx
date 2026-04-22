import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDigit,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, message, Popconfirm, Space, Tag, Typography, Modal, Progress, Alert } from 'antd';
import { useRef, useState } from 'react';
import { marked } from 'marked';
import {
  getArticleList,
  getArticleDetail,
  saveArticle,
  deleteArticle,
  getCategoryList,
  getTagList,
} from '@/services/api';

// ── 判断是否是 HTML（新格式，已迁移） ──
function isHtml(content: string): boolean {
  return /^\s*<[a-zA-Z]/.test((content || '').trim());
}

export default function ArticlesPage() {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [content, setContent] = useState('');

  // ── 迁移状态 ──
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateLog, setMigrateLog] = useState<string[]>([]);
  const [migrateDone, setMigrateDone] = useState(0);
  const [migrateTotal, setMigrateTotal] = useState(0);

  const { data: catData } = useRequest(getCategoryList);
  const { data: tagData } = useRequest(getTagList);

  const categories = (catData?.data || []).map((c: API.CategoryDTO) => ({ label: c.name, value: c.id }));
  const tags = (tagData?.data || []).map((t: API.TagDTO) => ({ label: t.name, value: t.id }));

  const openEdit = async (id: number) => {
    const res = await getArticleDetail(id);
    const art = res.data;
    setEditId(id);
    setContent(art.content || '');
    setModalOpen(true);
    return art;
  };

  // ── 一键迁移 ──
  const handleMigrate = async () => {
    setMigrating(true);
    setMigrateLog([]);
    setMigrateDone(0);
    setMigrateTotal(0);

    try {
      // 1. 拉取所有文章（分页全量）
      const log = (msg: string) => setMigrateLog((prev) => [...prev, msg]);
      log('📦 正在拉取文章列表...');

      let pageNum = 1;
      const pageSize = 50;
      const allArticles: API.ArticleDTO[] = [];

      while (true) {
        const res = await getArticleList({ pageNum, pageSize });
        const list = res.data?.list || [];
        allArticles.push(...list);
        if (allArticles.length >= (res.data?.total || 0)) break;
        pageNum++;
      }

      // 2. 过滤出需要迁移的（内容不是 HTML 的）
      const needMigrate = allArticles.filter((a) => a.content && !isHtml(a.content));
      setMigrateTotal(needMigrate.length);

      if (needMigrate.length === 0) {
        log('✅ 所有文章已经是新格式，无需迁移！');
        setMigrating(false);
        return;
      }

      log(`🔍 共发现 ${needMigrate.length} 篇需要迁移的文章（Markdown 格式）`);

      // 3. 逐篇转换并更新
      let done = 0;
      for (const article of needMigrate) {
        try {
          // 获取完整详情（列表可能没有 content）
          const detailRes = await getArticleDetail(article.id);
          const detail = detailRes.data;

          if (!detail.content || isHtml(detail.content)) {
            log(`⏭️ 跳过《${detail.title}》（已是 HTML 格式）`);
            done++;
            setMigrateDone(done);
            continue;
          }

          // Markdown → HTML
          const html = marked(detail.content.replace(/\\n/g, '\n')) as string;

          // 保存回去
          await saveArticle({
            id: detail.id,
            title: detail.title,
            content: html,
            summary: detail.summary,
            cover: detail.cover,
            categoryId: detail.categoryId,
            tagIds: detail.tags?.map((t: API.TagDTO) => t.id) || [],
            isTop: detail.isTop,
            status: detail.status,
          });

          done++;
          setMigrateDone(done);
          log(`✅ [${done}/${needMigrate.length}] 已迁移《${detail.title}》`);
        } catch (err: any) {
          done++;
          setMigrateDone(done);
          log(`❌ [${done}/${needMigrate.length}] 迁移失败《${article.title}》: ${err?.message || '未知错误'}`);
        }
      }

      log(`\n🎉 迁移完成！共处理 ${needMigrate.length} 篇文章`);
      message.success(`迁移完成，共处理 ${needMigrate.length} 篇文章`);
      actionRef.current?.reload();
    } catch (err: any) {
      message.error('迁移失败：' + (err?.message || '未知错误'));
    } finally {
      setMigrating(false);
    }
  };

  const columns: ProColumns<API.ArticleDTO>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (_, r) => (
        <Space>
          {r.isTop === 1 && <Tag color="gold">置顶</Tag>}
          <Typography.Text strong>{r.title}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      width: 100,
      render: (v) => <Tag color="purple">{v as string}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: {
        0: { text: '草稿', status: 'Default' },
        1: { text: '已发布', status: 'Success' },
        2: { text: '已下架', status: 'Error' },
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      width: 80,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      width: 120,
      hideInSearch: true,
      valueType: 'date',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该文章？"
            onConfirm={async () => {
              await deleteArticle(record.id);
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="文章管理">
      <ProTable<API.ArticleDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getArticleList({
            keyword: params.title,
            status: params.status,
            pageNum: params.current,
            pageSize: params.pageSize,
          });
          return { data: res.data?.list || [], total: res.data?.total || 0, success: true };
        }}
        toolBarRender={() => [
          <Button
            key="migrate"
            icon={<ThunderboltOutlined />}
            onClick={() => { setMigrateOpen(true); setMigrateLog([]); setMigrateDone(0); setMigrateTotal(0); }}
          >
            迁移旧文章
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditId(undefined); setContent(''); setModalOpen(true); }}
          >
            写文章
          </Button>,
        ]}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 12 }}
      />

      {/* ── 迁移 Modal ── */}
      <Modal
        title="迁移旧文章（Markdown → HTML）"
        open={migrateOpen}
        onCancel={() => !migrating && setMigrateOpen(false)}
        footer={[
          <Button key="close" onClick={() => setMigrateOpen(false)} disabled={migrating}>
            关闭
          </Button>,
          <Button
            key="start"
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={migrating}
            disabled={migrating}
            onClick={handleMigrate}
          >
            {migrating ? '迁移中...' : '开始迁移'}
          </Button>,
        ]}
        width={600}
      >
        <Alert
          type="info"
          showIcon
          message="说明"
          description="此操作将扫描所有 Markdown 格式的文章，自动转换为 HTML 富文本格式。已是 HTML 格式的文章会自动跳过，此操作不可撤销，请确认后执行。"
          style={{ marginBottom: 16 }}
        />

        {migrateTotal > 0 && (
          <Progress
            percent={Math.round((migrateDone / migrateTotal) * 100)}
            status={migrating ? 'active' : migrateDone === migrateTotal ? 'success' : 'normal'}
            style={{ marginBottom: 12 }}
          />
        )}

        {migrateLog.length > 0 && (
          <div
            style={{
              background: '#f6f8fa',
              borderRadius: 8,
              padding: '12px 16px',
              maxHeight: 320,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {migrateLog.join('\n')}
          </div>
        )}
      </Modal>

      {/* ── 编辑 / 新建文章 Modal ── */}
      <ModalForm
        title={editId ? '编辑文章' : '写文章'}
        open={modalOpen}
        width={900}
        modalProps={{ destroyOnClose: true, onCancel: () => setModalOpen(false) }}
        request={editId ? () => getArticleDetail(editId).then((r) => ({
          ...r.data,
          tagIds: r.data.tags?.map((t) => t.id),
        })) : undefined}
        onFinish={async (values) => {
          await saveArticle({ ...values, id: editId, content });
          message.success(editId ? '更新成功' : '创建成功');
          setModalOpen(false);
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 4 }}
      >
        <ProFormText name="title" label="标题" rules={[{ required: true }]} placeholder="文章标题" />
        <ProFormTextArea name="summary" label="摘要" rows={2} placeholder="文章摘要（可选）" />
        <ProFormText name="cover" label="封面图" placeholder="封面图 URL（可选）" />
        <ProFormSelect name="categoryId" label="分类" options={categories} rules={[{ required: true }]} placeholder="选择分类" />
        <ProFormSelect name="tagIds" label="标签" options={tags} mode="multiple" placeholder="选择标签（可多选）" />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '草稿', value: 0 },
            { label: '已发布', value: 1 },
            { label: '已下架', value: 2 },
          ]}
          initialValue={0}
        />
        <ProFormSelect
          name="isTop"
          label="置顶"
          options={[{ label: '否', value: 0 }, { label: '是', value: 1 }]}
          initialValue={0}
        />
        <ProFormDigit name="__content" label="内容" hidden />
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.88)', fontWeight: 500 }}>
            内容（Markdown）<span style={{ color: 'red' }}>*</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: 13,
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d9d9d9',
              resize: 'vertical',
              outline: 'none',
            }}
            placeholder="输入文章内容（Markdown 或 HTML 均可）"
          />
        </div>
      </ModalForm>
    </PageContainer>
  );
}
