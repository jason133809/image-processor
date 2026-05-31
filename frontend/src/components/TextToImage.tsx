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
      message.warning('请输入提示词');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.textToImage({ prompt, size, quality });
      setImageUrl(response.data.image_url);
      setCreditsUsed(response.data.credits_used);
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="文生图" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <TextArea
          rows={4}
          placeholder="描述你想要生成的图片，例如：一只可爱的橘猫在阳光下打盹"
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
            <Option value="standard">标准</Option>
            <Option value="hd">高清</Option>
          </Select>
        </Space>

        <Button type="primary" size="large" loading={loading} onClick={handleGenerate} block>
          生成图片
        </Button>

        {imageUrl && (
          <div>
            <Image src={imageUrl} alt="Generated" style={{ width: '100%' }} />
            <p style={{ marginTop: 10, color: '#666' }}>消耗积分: {creditsUsed}</p>
            <Button type="link" href={imageUrl} download>下载图片</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default TextToImage;
