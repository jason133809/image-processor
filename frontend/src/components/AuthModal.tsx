import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Tabs } from 'antd';
import { authAPI } from '../services/api';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await authAPI.login({
        username: values.email,
        password: values.password,
      });
      localStorage.setItem('token', response.data.access_token);
      message.success('Login successful');
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await authAPI.register({
        email: values.email,
        password: values.password,
      });
      message.success('Registration successful! 100 credits bonus!');
      const loginResponse = await authAPI.login({
        username: values.email,
        password: values.password,
      });
      localStorage.setItem('token', loginResponse.data.access_token);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Welcome to AI Image Processor"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Login" key="login">
          <Form form={loginForm} onFinish={handleLogin} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="your@email.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Login
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Register" key="register">
          <Form form={registerForm} onFinish={handleRegister} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="your@email.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password placeholder="At least 6 characters" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm your password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Register (100 credits bonus!)
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default AuthModal;