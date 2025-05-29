import { Layout, List, Button, Input, Spin, Empty } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { PlusOutlined, SendOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;

const mockSessions = [
  { id: 1, title: '会话1', time: '2024-05-01' },
  { id: 2, title: '会话2', time: '2024-05-02' }
];

const BUTTON_TOP = 60;
const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 1;

const AiChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [aiKnowledge, setAiKnowledge] = useState(null);
  const [aiAnswer, setAiAnswer] = useState('');
  const messagesContainerRef = useRef(null);

  const sendMsg = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setAiKnowledge(null);
    setAiAnswer('');
    try {
      const aiMsg = { from: 'ai', text: '', knowledge: null };
      setMessages(prev => [...prev, aiMsg]);
      const response = await fetch('http://localhost:8090/chat_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text, top_k: 3 })
      });
      if (!response.body) throw new Error('No stream available');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let gotKnowledge = false;
      let answerText = '';
      let knowledgeData = null;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split(/\r?\n/).filter(Boolean);
          for (let line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);
                if (!gotKnowledge && data.knowledge) {
                  setAiKnowledge(data.knowledge);
                  knowledgeData = data.knowledge;
                  gotKnowledge = true;
                } else if (data.delta) {
                  answerText += data.delta;
                  setAiAnswer(answerText);
                }
              } catch (e) {
                // 忽略解析失败
              }
            }
          }
        }
      }
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.from === 'ai') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            text: answerText,
            knowledge: knowledgeData
          };
        }
        return newMessages;
      });
      setAiKnowledge(null);
      setAiAnswer('');
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.from === 'ai') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            text: 'AI服务异常或未启动'
          };
        }
        return newMessages;
      });
      setAiKnowledge(null);
      setAiAnswer('');
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    setMessages([]);
    setAiKnowledge(null);
    setAiAnswer('');
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, aiAnswer, aiKnowledge]);

  const siderWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const renderAiImages = (knowledge) => {
    if (!knowledge || !Array.isArray(knowledge)) return null;
    const imgs = knowledge.map(item => item.evt_frame_url).filter(Boolean).slice(0, 3);
    if (imgs.length === 0) return null;
    return (
      <div className="ai-img-fadein" style={{ display: 'flex', gap: 16, marginBottom: 10, width: '100%', justifyContent: imgs.length === 1 ? 'flex-start' : 'space-between' }}>
        {imgs.map((url, idx) => (
          <img key={idx} src={url} alt="事件图片" style={{ width: `calc((100% - ${(imgs.length - 1) * 16}px) / ${imgs.length})`, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee', transition: 'opacity 0.5s cubic-bezier(.4,0,.2,1)' }} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Layout style={{height: '100%', minHeight: 0}}>
        <Sider width={siderWidth} style={{background: '#f7f7f7', borderRight: '1px solid #eee', height: '100%', overflowY: 'auto', position: 'relative', transition: 'all 0.3s'}}>
          {!collapsed && <>
            <div style={{ padding: '48px 16px 16px 16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={createNewChat} block>新建会话</Button>
            </div>
            <List
              dataSource={mockSessions}
              renderItem={item => (
                <List.Item style={{ cursor: 'pointer', padding: '10px 16px', borderBottom: 'none', transition: 'background 0.3s' }} className="session-item">
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{item.time}</div>
                  </div>
                </List.Item>
              )}
            />
          </>}
        </Sider>
        <Layout style={{height: '100%', minHeight: 0}}>
          <Content style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#f9f9f9', padding: 0}}>
            <div className="chat-list-scroll" style={{flex: 1, minHeight: 0, overflowY: 'auto', maxWidth: 800, margin: '0 auto', padding: '20px 0'}} ref={messagesContainerRef}>
              {messages.length > 0 ? (
                <List
                  dataSource={messages}
                  renderItem={(msg, idx) => (
                    <List.Item style={{display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', padding: '8px 0', border: 'none'}}>
                      <div style={{
                        background: msg.from === 'user' ? '#e6f7ff' : '#f6ffed',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        maxWidth: 600,
                        minWidth: 80,
                        width: 'auto',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}>
                        {msg.from === 'ai' && (
                          idx === messages.length - 1
                            ? renderAiImages(aiKnowledge || msg.knowledge)
                            : renderAiImages(msg.knowledge)
                        )}
                        {msg.from === 'ai' && idx === messages.length - 1 ? (aiAnswer || msg.text) : msg.text}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="有什么可以帮忙的？" style={{margin: 'auto', marginTop: '20vh'}} />
              )}
              {loading && (<div style={{ textAlign: 'center', padding: '16px' }}><Spin /></div>)}
            </div>
            <div style={{height: 80, background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <div style={{width: '60%', maxWidth: 600, display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 24, padding: '8px 16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
                <Input placeholder="询问任何问题" value={input} onChange={e => setInput(e.target.value)} onPressEnter={sendMsg} disabled={loading} style={{border: 'none', background: 'transparent', padding: '8px 0', fontSize: 16, boxShadow: 'none', flex: 1}} />
                <Button type="primary" onClick={sendMsg} disabled={loading} icon={<SendOutlined />} style={{borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8}} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
      <div
        style={{
          position: 'fixed',
          top: BUTTON_TOP,
          left: collapsed ? 8 : `calc(${siderWidth}px - 16px)` ,
          zIndex: 1000,
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
          transition: 'left 0.3s'
        }}
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? '展开侧栏' : '收起侧栏'}
      >
        {collapsed ? <RightOutlined style={{ fontSize: 18, color: '#888' }} /> : <LeftOutlined style={{ fontSize: 18, color: '#888' }} />}
      </div>
      <style jsx global>{`
        .session-item:hover { background: #e6f7ff; }
        .ai-chat-layout .ant-layout-sider-children { overflow-y: auto; height: 100%; }
        .ai-img-fadein img {
          opacity: 0;
          animation: fadeinimg 0.6s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes fadeinimg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AiChatPage;
