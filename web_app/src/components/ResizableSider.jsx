import React, { useRef, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const COLLAPSED_WIDTH = 1;
const BUTTON_SIZE = 32;
const BUTTON_TOP = 56;

const ResizableSider = ({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  minWidth = MIN_WIDTH,
  maxWidth = MAX_WIDTH,
  defaultWidth = DEFAULT_WIDTH,
  collapsedWidth = COLLAPSED_WIDTH,
  onCollapse,
  children,
  style = {},
  className = '',
  showCollapse = true,
  siderContentStyle = {},
}) => {
  const [collapsed, setCollapsed] = useState(collapsedProp ?? defaultCollapsed);
  const [width, setWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(width);

  // 拖拽事件
  const onDragStart = (e) => {
    setDragging(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  const onDrag = (e) => {
    if (!dragging) return;
    let newWidth = startWidth.current + (e.clientX - startX.current);
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setWidth(newWidth);
  };
  const onDragEnd = () => {
    setDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', onDragEnd);
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [dragging]);

  // 收起/展开
  const handleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      if (onCollapse) onCollapse(next);
      return next;
    });
  };

  // 侧栏实际宽度
  const siderWidth = collapsed ? collapsedWidth : width;

  return (
    <div
      className={className}
      style={{
        width: siderWidth,
        minWidth: siderWidth,
        maxWidth: siderWidth,
        height: '100%',
        background: '#f7f7f7',
        borderRight: '1px solid #eee',
        position: 'relative',
        transition: 'width 0.2s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* 悬浮收起按钮 */}
      {showCollapse && (
        <div
          style={{
            position: 'fixed',
            top: BUTTON_TOP,
            left: collapsed ? 8 : `calc(${siderWidth}px - 16px)`,
            zIndex: 1000,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 2px 8px #f0f1f2',
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid #eee',
            transition: 'left 0.2s cubic-bezier(.4,0,.2,1)',
          }}
          onClick={handleCollapse}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
        >
          {collapsed ? <RightOutlined style={{ fontSize: 18, color: '#888' }} /> : <LeftOutlined style={{ fontSize: 18, color: '#888' }} />}
        </div>
      )}
      {/* 侧栏内容 */}
      {!collapsed && (
        <div style={{height: '100%', ...siderContentStyle}}>
          {children}
          {/* 拖拽条 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 6,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 20,
              background: dragging ? 'rgba(24,144,255,0.08)' : 'transparent',
              transition: 'background 0.2s',
            }}
            onMouseDown={onDragStart}
          />
        </div>
      )}
    </div>
  );
};

export default ResizableSider; 