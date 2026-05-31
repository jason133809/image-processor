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
      message.warning('Please upload an image first');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.imageToImage(file, prompt);
      setImageUrl(response.data.image_url);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Image to Image" style={{ maxWidth: 800, margin: '0 auto' }}>
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
          <p className="ant-upload-hint">Supports PNG, JPEG, WEBP formats</p>
        </Dragger>

        {previewUrl && (
          <Image src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
        )}

        <Input
          placeholder="Optional: Describe the changes you want"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Button type="primary" size="large" loading={loading} onClick={handleGenerate} block>
          Generate Variant
        </Button>

        {imageUrl && (
          <div>
            <Image src={imageUrl} alt="Generated" style={{ width: '100%' }} />
            <Button type="link" href={imageUrl} download>Download</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImageToImage;