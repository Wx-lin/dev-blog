import { PageContainer } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  Typography,
  message,
  theme,
} from 'antd';
import { SendOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { sendNotification } from '@/services/api';

const { TextArea } = Input;
const { Text } = Typography;

export default function NotificationsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'user'>('all');
  const { token } = theme.useToken();

  const handleSubmit = async (values: {
    targetType: 'all' | 'user';
    userId?: number;
    title: string;
    content: string;
  }) => {
    setLoading(true);
    try {
      const res = await sendNotification({
        targetType: values.targetType,
        userId: values.targetType === 'user' ? values.userId : undefined,
        title: values.title,
        content: values.content,
      });
      if (res.code === 0) {
        message.success(`发送成功，共发送给 ${res.data} 位用户`);
        form.resetFields();
        setTargetType('all');
      } else {
        message.error(res.message || '发送失败');
      }
    } catch {
      message.error('网络异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="系统通知">
      <Card
        style={{
          maxWidth: 680,
          borderRadius: 12,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        styles={{ body: { padding: '32px 36px' } }}
      >
        <Alert
          type="info"
          showIcon
          message="发布系统通知后，目标用户将在个人通知中心收到一条 SYSTEM 类型的通知。"
          style={{ marginBottom: 28, borderRadius: 8 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ targetType: 'all' }}
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* 发送目标 */}
          <Form.Item
            label={<Text strong>发送目标</Text>}
            name="targetType"
            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={(e) => {
                setTargetType(e.target.value);
                form.setFieldValue('userId', undefined);
              }}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="all">
                <Space>
                  <TeamOutlined />
                  全部用户
                </Space>
              </Radio.Button>
              <Radio.Button value="user">
                <Space>
                  <UserOutlined />
                  指定用户
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* 指定用户 ID */}
          {targetType === 'user' && (
            <Form.Item
              label={<Text strong>目标用户 ID</Text>}
              name="userId"
              rules={[{ required: true, message: '请填写目标用户 ID' }]}
              extra="请前往用户管理页面确认用户 ID"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="请输入用户 ID"
                precision={0}
              />
            </Form.Item>
          )}

          {/* 通知标题 */}
          <Form.Item
            label={<Text strong>通知标题</Text>}
            name="title"
            rules={[
              { required: true, message: '请填写通知标题' },
              { max: 100, message: '标题最多 100 个字符' },
            ]}
          >
            <Input
              placeholder="例如：系统升级公告"
              showCount
              maxLength={100}
            />
          </Form.Item>

          {/* 通知正文 */}
          <Form.Item
            label={<Text strong>通知正文</Text>}
            name="content"
            rules={[
              { required: true, message: '请填写通知正文' },
              { max: 500, message: '正文最多 500 个字符' },
            ]}
          >
            <TextArea
              rows={5}
              placeholder="请输入通知正文内容..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* 提交 */}
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
              style={{ minWidth: 120 }}
            >
              发送通知
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
}
