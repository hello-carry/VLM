import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import MonitorPage from './pages/MonitorPage';
import EventPage from './pages/EventPage';
import AiChatPage from './pages/AiChatPage';
import 'antd/dist/reset.css';
import './global.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column', minHeight: 0}}>
        <TopBar />
        <div className="main-content-with-topbar" style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <Routes>
            <Route path="/monitor" element={<MonitorPage />} />
            <Route path="/event" element={<EventPage />} />
            <Route path="/ai" element={<AiChatPage />} />
            <Route path="*" element={<EventPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
