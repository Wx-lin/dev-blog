import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getTagList, saveTag, deleteTag } from '@/services/api';

const TAG_COLORS = ['blue', 'purple', 'cyan', 'green', 'orange', 'magenta', 'volcano', 'gold'];

export default function TagsPage() {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<API.TagDTO | undefined>();

  const columns: ProColumns<API.TagDTO>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, hideInSearch: true },
    {
      title: '标签名称',
      dataIndex: 'name',
      render: (_, r, idx) => (
        <Tag color={TAG_COLORS[idx % TAG_COLORS.length]}>{r.name}</Tag>
      ),
    },
    { title: '文章数', dataIndex: 'articleCount', width: 90, hideInSearch: true },
    { title: '创建时间', dataIndex: 'createTime', width: 150, hideInSearch: true, valueType: 'dateTime' },
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
            onClick={() => { setEditRecord(record); setModalOpen(true); }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该标签？"
            onConfirm={async () => {
              await deleteTag(record.id);
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="标签管理">
      <ProTable<API.TagDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          const res = await getTagList();
          return { data: res.data || [], success: true };
        }}
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditRecord(undefined); setModalOpen(true); }}
          >
            新建标签
          </Button>,
        ]}
        pagination={false}
      />

      <ModalForm
        title={editRecord ? '编辑标签' : '新建标签'}
        open={modalOpen}
        width={380}
        modalProps={{ destroyOnClose: true, onCancel: () => setModalOpen(false) }}
        initialValues={editRecord}
        onFinish={async (values) => {
          await saveTag({ ...values, id: editRecord?.id });
          message.success(editRecord ? '更新成功' : '创建成功');
          setModalOpen(false);
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 5 }}
      >
        <ProFormText name="name" label="标签名称" rules={[{ required: true }]} placeholder="请输入标签名称" />
      </ModalForm>
    </PageContainer>
  );
}
