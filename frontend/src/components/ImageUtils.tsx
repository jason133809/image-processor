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
      message.warning('请先上传图片');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.resize(file, width, height, maintainRatio);
      setResultUrl(response.data.image_url);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '处理失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="图片工具" style={{ maxWidth: 800, margin: '0 auto' }}>
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
        </Dragger>

        {previewUrl && (
          <Image src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
        )}

        <Card title="调整尺寸" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <span>宽度:</span>
              <InputNumber min={1} max={4096} value={width} onChange={(v) => setWidth(v || 1024)} />
              <span>高度:</span>
              <InputNumber min={1} max={4096} value={height} onChange={(v) => setHeight(v || 1024)} />
            </Space>
            <Checkbox checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)}>
              保持宽高比
            </Checkbox>
            <Button type="primary" loading={loading} onClick={handleResize} block>
              调整尺寸
            </Button>
          </Space>
        </Card>

        {resultUrl && (
          <div>
            <Image src={resultUrl} alt="Result" style={{ width: '100%' }} />
            <Button type="link" href={resultUrl} download>下载图片</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImageUtils;
