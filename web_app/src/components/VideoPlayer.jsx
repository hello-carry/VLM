import { Card } from 'antd';

const VideoPlayer = ({ event }) => (
  <Card style={{ width: '100%', minHeight: 200, margin: '0 auto', marginTop: 100, boxShadow: '0 2px 8px #f0f1f2' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 16 }}>当前事件: {event ? event.name : '暂无事件'}</div>
      {event && event.videoUrl ? (
        <video src={event.videoUrl} controls width="400" />
      ) : (
        <img src="/placeholder.png" alt="Default Video Placeholder" width="200" />
      )}
    </div>
  </Card>
);

export default VideoPlayer; 