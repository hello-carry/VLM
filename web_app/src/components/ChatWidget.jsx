import { FloatButton, Drawer, Input, Button, List } from 'antd';
import { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // 流式发送消息
  const sendMsg = async () => {
    if (!input || loading) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    let aiMsg = { from: 'ai', text: '' };
    setMessages(msgs => [...msgs, aiMsg]);
    try {
      // 调用后端API  注意参数
      const resp = await fetch('http://localhost:8090/chat_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text, top_k: 3 })
      });
      if (!resp.body) throw new Error('No stream');
      const reader = resp.body.getReader();
      let decoder = new TextDecoder('utf-8');
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages(msgs => {
            // 取出当前AI消息内容，拼接新chunk
            const prevText = msgs[msgs.length - 1]?.from === 'ai' ? msgs[msgs.length - 1].text : '';
            const newText = prevText + chunk;
            const newMsgs = [...msgs];
            newMsgs[newMsgs.length - 1] = { from: 'ai', text: newText };
            return newMsgs;
          });
        }
      }
    } catch (e) {
      setMessages(msgs => {
        const newMsgs = [...msgs];
        newMsgs[newMsgs.length - 1] = { from: 'ai', text: 'AI服务异常或未启动' };
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <FloatButton
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="AI 咨询窗口"
        placement="right"
        width={350}
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 55px)' }}
        footer={
          <div style={{ display: 'flex' }}>
            <Input
              placeholder="说点什么..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={sendMsg}
              disabled={loading}
            />
            <Button type="primary" onClick={sendMsg} style={{ marginLeft: 8 }} loading={loading}>发送</Button>
          </div>
        }
      >
        <div
          ref={listRef}
          className="chat-list-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: 8,
            marginBottom: 8
          }}
        >
          <List
            dataSource={messages}
            renderItem={msg => (
              <List.Item style={{ justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', border: 'none', padding: 4 }}>
                <div style={{
                  background: msg.from === 'user' ? '#e6f7ff' : '#f6ffed',
                  borderRadius: 8,
                  padding: 8,
                  maxWidth: 220,
                  wordBreak: 'break-all',
                  alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </List.Item>
            )}
          />
        </div>
      </Drawer>
    </>
  );
};

export default ChatWidget; 