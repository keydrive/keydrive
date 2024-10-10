import React from 'react';

export const Tag: React.FC<{ children: string }> = ({ children }) => <span className="tag">{children}</span>;
