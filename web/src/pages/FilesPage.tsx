import React from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';

export const FilesPage: React.FC = () => {
  return (
    <Layout className="files-page">
      <div className="top-bar" />
      <main>
        <Panel>Files go here!</Panel>
      </main>
    </Layout>
  );
};
