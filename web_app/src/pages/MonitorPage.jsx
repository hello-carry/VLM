import { Card, Row, Col, List } from 'antd';
import { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const mockCameras = [
  { name: '摄像头1' },
  { name: '摄像头2' },
  { name: '摄像头3' },
];

const MonitorPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(null);
  return (
    <Row style={{height: '100%', minHeight: 0, flex: 1}}>
      <Col
        span={collapsed ? 1 : 5}
        style={{
          background: '#fafafa',
          minHeight: '100vh',
          padding: collapsed ? '8px 0' : 16,
          position: 'relative',
          transition: 'all 0.3s',
          zIndex: 2
        }}
      >
        <div style={{ position: 'absolute', top: 12, right: collapsed ? -16 : -12, zIndex: 10 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 2px 8px #f0f1f2',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid #eee',
              transition: 'right 0.3s'
            }}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? '展开侧栏' : '收起侧栏'}
          >
            {collapsed ? <RightOutlined style={{ fontSize: 18, color: '#888' }} /> : <LeftOutlined style={{ fontSize: 18, color: '#888' }} />}
          </div>
        </div>
        {!collapsed && (
          <List
            header={<div style={{fontWeight: 500}}>摄像头列表</div>}
            dataSource={mockCameras}
            renderItem={item => (
              <List.Item style={{ cursor: 'pointer', padding: '8px 16px', background: selected === item.name ? '#e6f7ff' : undefined }} onClick={() => setSelected(item.name)}>
                {item.name}
              </List.Item>
            )}
          />
        )}
      </Col>
      <Col span={collapsed ? 23 : 19} style={{ padding: 32, transition: 'all 0.3s' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div>实时监控画面</div>
            <video src="/realtime.mp4" controls width="600" />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default MonitorPage; 