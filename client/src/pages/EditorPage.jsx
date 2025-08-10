import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import EditorCore from '../components/EditorCore';

export default function EditorPage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const username = searchParams.get('username') || 'Anonymous';

  if (!roomId) return <Navigate to="/" replace />;

  return <EditorCore roomId={roomId} displayName={decodeURIComponent(username)} />;
}