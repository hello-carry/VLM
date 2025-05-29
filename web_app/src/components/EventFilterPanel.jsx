import { Form, Select, Input, Button } from 'antd';

const EventFilterPanel = ({ onFilter }) => (
  <Form layout="vertical" onFinish={onFilter} style={{ marginBottom: 16 }}>
    <Form.Item label="视频类型" name="type">
      <Select defaultValue="全部">
        <Select.Option value="全部">全部</Select.Option>
        <Select.Option value="报警">报警</Select.Option>
        <Select.Option value="异常">异常</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item label="关键字" name="keyword">
      <Input placeholder="请输入关键字" />
    </Form.Item>
    <Form.Item label="其他筛选条件 (可扩展)" name="extra">
      <Input placeholder="可在此扩展筛选条件" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">筛选</Button>
      <Button style={{ marginLeft: 8 }} htmlType="reset">重置</Button>
    </Form.Item>
  </Form>
);

export default EventFilterPanel; 