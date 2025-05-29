import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let selectedKey = 'event';
  if (location.pathname.startsWith('/monitor')) selectedKey = 'monitor';
  else if (location.pathname.startsWith('/ai')) selectedKey = 'ai';
  return (
    <div className="topbar-fixed">
      <Menu mode="horizontal" selectedKeys={[selectedKey]}>
        <Menu.Item key="monitor" onClick={() => navigate('/monitor')}>实时监控</Menu.Item>
        <Menu.Item key="event" onClick={() => navigate('/event')}>查看事件</Menu.Item>
        <Menu.Item key="ai" onClick={() => navigate('/ai')}>AI助手</Menu.Item>
      </Menu>
    </div>
  );
};
export default TopBar; 