import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, message, Popconfirm, Space, Tag, Typography } from 'antd';
import { useRef } from 'react';
import { getCommentList, approveComment, rejectComment, deleteComment } from '@/services/api';

const STATUS_MAP: Record<number, { text: string; color: string }> = {
  0: { text: '待审核', color: 'warning' },
  1: { text: '已通过', color: 'success' },
  2: { text: '已拒绝', color: 'error' },
};

export default function CommentsPage() {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.CommentDTO>[] = [
    {
      title: '评论用户',
      dataIndex: 'userNickname',
      width: 140,
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <Avatar src={r.userAvatar || undefined} size={28}>
            {r.userNickname?.[0]?.toUpperCase()}
          </Avatar>
          <span style={{ fontSize: 13 }}>{r.userNickname}</span>
        </Space>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (_, r) => (
        <div>
          {r.replyUserNickname && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              回复 @{r.replyUserNickname}：
            </Typography.Text>
          )}
          <span>{r.content}</span>
        </div>
      ),
    },
    {
      title: '所属文章',
      dataIndex: 'articleTitle',
      ellipsis: true,
      width: 180,
      render: (v) => <Typography.Text type="secondary">{(v as string) || '-'}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: {
        0: { text: '待审核', status: 'Warning' },
        1: { text: '已通过', status: 'Success' },
        2: { text: '已拒绝', status: 'Error' },
      },
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      width: 150,
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.status === 0 && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#22c55e' }}
                onClick={async () => {
                  await approveComment(record.id);
                  message.success('审核通过');
                  actionRef.current?.reload();
                }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={async () => {
                  await rejectComment(record.id);
                  message.success('已拒绝');
                  actionRef.current?.reload();
                }}
              >
                拒绝
              </Button>
            </>
          )}
          <Popconfirm
            title="确定删除该评论？"
            onConfirm={async () => {
              await deleteComment(record.id);
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="评论管理">
      <ProTable<API.CommentDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await getCommentList({
            status: params.status,
            pageNum: params.current,
            pageSize: params.pageSize,
          });
          return { data: res.data?.list || [], total: res.data?.total || 0, success: true };
        }}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 15 }}
      />
    </PageContainer>
  );
}
