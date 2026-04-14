import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Avatar, message, Popconfirm, Space, Switch, Tag } from 'antd';
import { ActionType } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getUserList, setUserStatus } from '@/services/api';

export default function UsersPage() {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.UserDTO>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, hideInSearch: true },
    {
      title: '用户',
      dataIndex: 'nickname',
      render: (_, r) => (
        <Space>
          <Avatar src={r.avatar || undefined} size={32}>{r.nickname?.[0]?.toUpperCase()}</Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{r.nickname}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>@{r.username}</div>
          </div>
        </Space>
      ),
    },
    { title: '邮箱', dataIndex: 'email', ellipsis: true, hideInSearch: true },
    {
      title: '角色',
      dataIndex: 'role',
      width: 90,
      hideInSearch: true,
      render: (_, r) => (
        <Tag color={r.role === 1 ? 'purple' : 'default'}>{r.roleDesc}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      hideInSearch: true,
      render: (_, record) => (
        <Popconfirm
          title={record.status === 1 ? '确定禁用该用户？' : '确定启用该用户？'}
          onConfirm={async () => {
            await setUserStatus(record.id, record.status === 1 ? 0 : 1);
            message.success('操作成功');
            actionRef.current?.reload();
          }}
        >
          <Switch checked={record.status === 1} size="small" />
        </Popconfirm>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      width: 160,
      hideInSearch: true,
      valueType: 'dateTime',
    },
  ];

  return (
    <PageContainer title="用户管理">
      <ProTable<API.UserDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getUserList({ pageNum: params.current, pageSize: params.pageSize });
          return { data: res.data?.list || [], total: res.data?.total || 0, success: true };
        }}
        search={false}
        pagination={{ pageSize: 15 }}
      />
    </PageContainer>
  );
}
