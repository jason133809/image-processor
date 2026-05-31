import React, { useState, useEffect } from 'react';
import { Layout, Menu, Tabs, Button, Space, Tag, Dropdown, message, Card, Statistic, Row, Col } from 'antd';
import {
  PictureOutlined,
  ScissorOutlined,
  ToolOutlined,
  UserOutlined,
  CrownOutlined,
  WalletOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import TextToImage from './components/TextToImage';
import ImageToImage from './components/ImageToImage';
import RemoveBackground from './components/RemoveBackground';
import ImageUtils from './components/ImageUtils';
import AuthModal from './components/AuthModal';
import { authAPI, creditsAPI, membershipAPI } from './services/api';
import type { User } from './types';
import './App.css';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setAuthModalVisible(true);
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setCredits(response.data.credits);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('token');
      setLoading(false);
      setAuthModalVisible(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthModalVisible(true);
    message.success('已退出登录');
  };

  const refreshCredits = async () => {
    try {
      const response = await creditsAPI.getBalance();
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Failed to refresh credits');
    }
  };

  const getMembershipTag = (level: string) => {
    const config = {
      free: { color: 'default', text: '免费用户' },
      vip: { color: 'gold', text: 'VIP' },
      svip: { color: 'red', text: 'SVIP' },
    };
    const { color, text } = config[level as keyof typeof config] || config.free;
    return <Tag color={color} icon={<CrownOutlined />}>{text}</Tag>;
  };

  const userMenu = user ? (
    <Menu>
      <Menu.Item key="email" disabled>
        {user.email}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="credits" icon={<WalletOutlined />}>
        积分: {credits.toFixed(1)}
      </Menu.Item>
      <Menu.Item key="membership">
        {getMembershipTag(user.membership_level)}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  ) : null;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}>加载中...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          🎨 图片处理平台
        </div>
        {user && (
          <Space>
            <Tag color="blue" icon={<WalletOutlined />}>
              积分: {credits.toFixed(1)}
            </Tag>
            {getMembershipTag(user.membership_level)}
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} style={{ color: 'white' }}>
                {user.email}
              </Button>
            </Dropdown>
          </Space>
        )}
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {user ? (
          <Tabs
            defaultActiveKey="1"
            size="large"
            items={[
              {
                key: '1',
                label: (
                  <span>
                    <PictureOutlined />
                    文生图
                  </span>
                ),
                children: <TextToImage />,
              },
              {
                key: '2',
                label: (
                  <span>
                    <PictureOutlined />
                    图生图
                  </span>
                ),
                children: <ImageToImage />,
              },
              {
                key: '3',
                label: (
                  <span>
                    <ScissorOutlined />
                    智能抠图
                  </span>
                ),
                children: <RemoveBackground />,
              },
              {
                key: '4',
                label: (
                  <span>
                    <ToolOutlined />
                    图片工具
                  </span>
                ),
                children: <ImageUtils />,
              },
            ]}
            onChange={refreshCredits}
          />
        ) : (
          <Card style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center' }}>
            <h2>欢迎使用图片处理平台</h2>
            <p>请先登录或注册以使用服务</p>
            <Button type="primary" size="large" onClick={() => setAuthModalVisible(true)}>
              登录 / 注册
            </Button>
          </Card>
        )}
      </Content>

      <AuthModal
        visible={authModalVisible}
        onClose={() => !user && setAuthModalVisible(false)}
        onSuccess={checkAuth}
      />
    </Layout>
  );
};

export default App;
