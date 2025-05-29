import { List } from 'antd';
import './EventList.css';

const EventList = ({ events, onSelect }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 8,
      padding: 8,
      boxShadow: '0 2px 8px #f0f1f2'
    }}
  >
    <div style={{ textAlign: 'center', fontSize: 18, marginTop: 0, marginBottom: 12 }}>
      事件列表
    </div>
    <div className="event-list-scroll" style={{ overflowY: 'auto', height: 240 }}>
      <List
        dataSource={events}
        renderItem={(item, idx) => (
          <List.Item
            onClick={() => onSelect(item)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <span>事件{idx + 1}：{item.name}</span>
          </List.Item>
        )}
      />
    </div>
  </div>
);

export default EventList; 