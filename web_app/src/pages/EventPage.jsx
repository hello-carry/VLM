import { Row, Col } from 'antd';
import EventFilterPanel from '../components/EventFilterPanel';
import EventList from '../components/EventList';
import VideoPlayer from '../components/VideoPlayer';
import { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const mockEvents = [
  { name: '设备报警', videoUrl: '/video1.mp4' },
  { name: '人员闯入', videoUrl: '/video2.mp4' },
  { name: '视频丢失', videoUrl: '/video3.mp4' },
  { name: '网络异常', videoUrl: '/video4.mp4' },
  { name: '网络异常', videoUrl: '/video4.mp4' },
  { name: '网络异常', videoUrl: '/video4.mp4' },
  { name: '网络异常', videoUrl: '/video4.mp4' },
];

const EventPage = () => {
  const [selected, setSelected] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{height: '100%', minHeight: 0, flex: 1, display: 'flex', flexDirection: 'row'}}>
      <Col
        span={collapsed ? 1 : 6}
        style={{
          background: '#fafafa',
          height: '100%',
          minHeight: 0,
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
          <>
            <EventFilterPanel onFilter={() => {}} />
            <EventList events={mockEvents} onSelect={setSelected} />
          </>
        )}
      </Col>
      <Col span={collapsed ? 23 : 18} style={{ padding: 32, transition: 'all 0.3s', height: '100%', minHeight: 0 }}>
        <VideoPlayer event={selected} />
      </Col>
    </div>
  );
};
export default EventPage; 