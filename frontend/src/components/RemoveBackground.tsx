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
      message.warning('Please upload an image first');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.removeBackground(file);
      setResultUrl(response.data.image_url);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Remove Background" style={{ maxWidth: 1000, margin: '0 auto' }}>
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
          <p className="ant-upload-text">Click or drag image to upload</p>
          <p className="ant-upload-hint">Automatically detect and remove background, generate transparent PNG</p>
        </Dragger>

        <Button type="primary" size="large" loading={loading} onClick={handleRemoveBg} block disabled={!file}>
          Remove Background
        </Button>

        {(originalUrl || resultUrl) && (
          <Row gutter={16}>
            {originalUrl && (
              <Col span={12}>
                <Card title="Original" size="small">
                  <Image src={originalUrl} alt="Original" style={{ width: '100%' }} />
                </Card>
              </Col>
            )}
            {resultUrl && (
              <Col span={12}>
                <Card title="Result" size="small">
                  <div style={{ background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px' }}>
                    <Image src={resultUrl} alt="Result" style={{ width: '100%' }} />
                  </div>
                  <Button type="link" href={resultUrl} download style={{ marginTop: 10 }}>Download PNG</Button>
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