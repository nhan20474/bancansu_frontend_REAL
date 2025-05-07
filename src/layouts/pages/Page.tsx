import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import './Page.css';
import { useParams } from 'react-router-dom';

const Page: React.FC = () => {
  const { slug } = useParams<{slug:string}>();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    axios.get(`/pages.php?slug=${slug}`)
      .then(res => setContent(res.data.content))
      .catch(() => setContent('Không tìm thấy trang'));
  }, [slug]);

  return <div className="page-content" dangerouslySetInnerHTML={{__html:content}} />;
};
export default Page;