import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
import { Button, message, Popconfirm, Space, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  getArticleList,
  getArticleDetail,
  saveArticle,
  deleteArticle,
  getCategoryList,
  getTagList,
} from '@/services/api';

const STATUS_MAP: Record<number, { text: string; color: string }> = {
  0: { text: '草稿', color: 'default' },
  1: { text: '已发布', color: 'green' },
  2: { text: '已下架', color: 'red' },
};

export default function ArticlesPage() {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [content, setContent] = useState('');

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
          <div data-color-mode="light">
            <MDEditor value={content} onChange={(v) => setContent(v || '')} height={360} />
          </div>
        </div>
      </ModalForm>
    </PageContainer>
  );
}
