import React, { useState } from 'react';
import { Card, Upload, Button, message, Image, Space, Row, Col } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { imageAPI } from '../services/api';

const { Dragger } = Upload;

const RemoveBackground: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    setFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl('');
  };

  const handleRemoveBg = async () => {
    if (!file) {
      message.warning('请先上传图片');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.removeBackground(file);
      setResultUrl(response.data.image_url);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '处理失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="智能抠图" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Dragger
          accept="image/*"
          maxCount={1}
          beforeUpload={() => false}
          onChange={handleFileChange}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
          <p className="ant-upload-hint">自动识别并移除背景，生成透明PNG</p>
        </Dragger>

        <Button type="primary" size="large" loading={loading} onClick={handleRemoveBg} block disabled={!file}>
          一键抠图
        </Button>

        {(originalUrl || resultUrl) && (
          <Row gutter={16}>
            {originalUrl && (
              <Col span={12}>
                <Card title="原图" size="small">
                  <Image src={originalUrl} alt="Original" style={{ width: '100%' }} />
                </Card>
              </Col>
            )}
            {resultUrl && (
              <Col span={12}>
                <Card title="抠图结果" size="small">
                  <div style={{ background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px' }}>
                    <Image src={resultUrl} alt="Result" style={{ width: '100%' }} />
                  </div>
                  <Button type="link" href={resultUrl} download style={{ marginTop: 10 }}>下载透明PNG</Button>
                </Card>
              </Col>
            )}
          </Row>
        )}
      </Space>
    </Card>
  );
};

export default RemoveBackground;
