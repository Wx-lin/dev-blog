import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import { useRef, useState } from 'react';
import { getCategoryList, saveCategory, deleteCategory } from '@/services/api';

export default function CategoriesPage() {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<API.CategoryDTO | undefined>();

  const columns: ProColumns<API.CategoryDTO>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, hideInSearch: true },
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description', ellipsis: true, hideInSearch: true },
    { title: '排序', dataIndex: 'sort', width: 80, hideInSearch: true },
    { title: '文章数', dataIndex: 'articleCount', width: 80, hideInSearch: true },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
      valueType: 'dateTime',
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
            onClick={() => { setEditRecord(record); setModalOpen(true); }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该分类？"
            onConfirm={async () => {
              await deleteCategory(record.id);
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
    <PageContainer title="分类管理">
      <ProTable<API.CategoryDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          const res = await getCategoryList();
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
            新建分类
          </Button>,
        ]}
        pagination={false}
      />

      <ModalForm
        title={editRecord ? '编辑分类' : '新建分类'}
        open={modalOpen}
        width={480}
        modalProps={{ destroyOnClose: true, onCancel: () => setModalOpen(false) }}
        initialValues={editRecord}
        onFinish={async (values) => {
          await saveCategory({ ...values, id: editRecord?.id });
          message.success(editRecord ? '更新成功' : '创建成功');
          setModalOpen(false);
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 5 }}
      >
        <ProFormText name="name" label="分类名称" rules={[{ required: true }]} placeholder="请输入分类名称" />
        <ProFormTextArea name="description" label="描述" rows={2} placeholder="分类描述（可选）" />
        <ProFormDigit name="sort" label="排序" tooltip="数值越大越靠前" initialValue={0} min={0} />
      </ModalForm>
    </PageContainer>
  );
}
