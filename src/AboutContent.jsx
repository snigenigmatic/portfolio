import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import about from '../content/about.md?raw';
export default function AboutContent(){return <Markdown rehypePlugins={[rehypeRaw]}>{about.replace(/^---[\s\S]*?---/,'').replace(/^\s*# About\s*/,'')}</Markdown>}
