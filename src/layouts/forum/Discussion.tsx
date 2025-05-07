// src/layouts/forum/Discussion.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import axios from '../../api/axiosConfig';
import './Discussion.css';

interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  code: string;
  author_id: number;
  content: string;
  created_at: string;
}

const Discussion: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Load all posts
  useEffect(() => {
    axios.get<Post[]>('/posts.php')
      .then(res => setPosts(res.data))
      .catch(err => setError('Lỗi tải bài viết: ' + err.message));
  }, []);

  // Submit new post
  const handlePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    axios.post<Post>('/posts.php', { content: newPost })
      .then(res => {
        setPosts(prev => [res.data, ...prev]);
        setNewPost('');
      })
      .catch(err => setError('Lỗi gửi bài: ' + err.message));
  };

  // Toggle comments for a post
  const toggleComments = (postId: number) => {
    const isOpen = openComments[postId];
    if (!isOpen) {
      axios.get<Comment[]>(`/posts.php?postId=${postId}`)
        .then(res => setCommentsMap(prev => ({ ...prev, [postId]: res.data })))
        .catch(err => setError('Lỗi tải bình luận: ' + err.message));
    }
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));
  };

  // Submit a comment for a post
  const handleCommentSubmit = (postId: number, e: FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId] || '';
    axios.post<Comment>(`/posts.php?postId=${postId}`, { content })
      .then(res => {
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      })
      .catch(err => setError('Lỗi gửi bình luận: ' + err.message));
  };

  return (
    <div className="forum-page">
      <h2>Diễn đàn thảo luận</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handlePostSubmit} className="post-form">
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Viết bài mới..."
          required
        />
        <button type="submit">Đăng bài</button>
      </form>

      <ul className="posts-list">
        {posts.map(post => (
          <li key={post.id} className="post-item">
            <div className="post-content">
              {post.content}
            </div>
            <div className="post-meta">
              <small>Ngày tạo: {new Date(post.created_at).toLocaleString()}</small>
              <button onClick={() => toggleComments(post.id)}>
                {openComments[post.id] ? 'Ẩn bình luận' : 'Xem bình luận'}
              </button>
            </div>

            {openComments[post.id] && (
              <div className="comments-section">
                <ul className="comments-list">
                  {(commentsMap[post.id] || []).map(c => (
                    <li key={c.id} className="comment-item">
                      <p>{c.content}</p>
                      <small>{new Date(c.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
                <form onSubmit={e => handleCommentSubmit(post.id, e)} className="comment-form">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Viết bình luận..."
                    required
                  />
                  <button type="submit">Gửi</button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Discussion;
export {};
