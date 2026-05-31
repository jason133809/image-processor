import React, { useState } from 'react';
import { Card, Input, Button, Select, message, Image, Space } from 'antd';
import { imageAPI } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const TextToImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [creditsUsed, setCreditsUsed] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.textToImage({ prompt, size, quality });
      setImageUrl(response.data.image_url);
      setCreditsUsed(response.data.credits_used);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Text to Image" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <TextArea
          rows={4}
          placeholder="Describe the image you want to generate, e.g.: A cute orange cat taking a nap in the sunshine"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Space>
          <Select value={size} onChange={setSize} style={{ width: 150 }}>
            <Option value="1024x1024">1:1 (1024x1024)</Option>
            <Option value="1792x1024">16:9 (1792x1024)</Option>
            <Option value="1024x1792">9:16 (1024x1792)</Option>
          </Select>

          <Select value={quality} onChange={setQuality} style={{ width: 120 }}>
            <Option value="standard">Standard</Option>
            <Option value="hd">HD</Option>
          </Select>
        </Space>

        <Button type="primary" size="large" loading={loading} onClick={handleGenerate} block>
          Generate Image
        </Button>

        {imageUrl && (
          <div>
            <Image src={imageUrl} alt="Generated" style={{ width: '100%' }} />
            <p style={{ marginTop: 10, color: '#666' }}>Credits used: {creditsUsed}</p>
            <Button type="link" href={imageUrl} download>Download Image</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default TextToImage;