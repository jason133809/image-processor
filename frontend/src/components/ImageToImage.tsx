import React, { useState } from 'react';
import { Card, Upload, Input, Button, message, Image, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { imageAPI } from '../services/api';

const { Dragger } = Upload;

const ImageToImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!file) {
      message.warning('请先上传图片');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.imageToImage(file, prompt);
      setImageUrl(response.data.image_url);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="图生图" style={{ maxWidth: 800, margin: '0 auto' }}>
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
          <p className="ant-upload-hint">支持 PNG, JPEG, WEBP 等格式</p>
        </Dragger>

        {previewUrl && (
          <Image src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
        )}

        <Input
          placeholder="可选：描述你想要的变化效果"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Button type="primary" size="large" loading={loading} onClick={handleGenerate} block>
          生成变体
        </Button>

        {imageUrl && (
          <div>
            <Image src={imageUrl} alt="Generated" style={{ width: '100%' }} />
            <Button type="link" href={imageUrl} download>下载图片</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImageToImage;
