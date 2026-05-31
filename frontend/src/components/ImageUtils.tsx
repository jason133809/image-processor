import React, { useState } from 'react';
import { Card, Upload, InputNumber, Button, message, Image, Space, Checkbox } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { imageAPI } from '../services/api';

const { Dragger } = Upload;

const ImageUtils: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl('');
  };

  const handleResize = async () => {
    if (!file) {
      message.warning('Please upload an image first');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.resize(file, width, height, maintainRatio);
      setResultUrl(response.data.image_url);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Image Tools" style={{ maxWidth: 800, margin: '0 auto' }}>
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
        </Dragger>

        {previewUrl && (
          <Image src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
        )}

        <Card title="Resize" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <span>Width:</span>
              <InputNumber min={1} max={4096} value={width} onChange={(v) => setWidth(v || 1024)} />
              <span>Height:</span>
              <InputNumber min={1} max={4096} value={height} onChange={(v) => setHeight(v || 1024)} />
            </Space>
            <Checkbox checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)}>
              Maintain aspect ratio
            </Checkbox>
            <Button type="primary" loading={loading} onClick={handleResize} block>
              Resize
            </Button>
          </Space>
        </Card>

        {resultUrl && (
          <div>
            <Image src={resultUrl} alt="Result" style={{ width: '100%' }} />
            <Button type="link" href={resultUrl} download>Download</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImageUtils;