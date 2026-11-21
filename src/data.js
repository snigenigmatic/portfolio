import projectSource from '../content/projects.md?raw';
export const projects = [...projectSource.matchAll(/<article class="project-card">([\s\S]*?)<\/article>/g)].map(([_,body], i) => {
  const name = body.match(/class="project-title"><a[^>]*>(.*?)<\/a>/)[1];
  const url = body.match(/class="project-title"><a href="([^"]+)"/)[1];
  const description = body.match(/class="project-impact">([\s\S]*?)<\/p>/)[1].trim();
  const tags = body.match(/class="project-tags">(.*?)<\/p>/)[1];
  const category = /CUDA|Distributed|RESP3|C\+\+|Rust/.test(tags) ? 'Systems' : /Research|Federated/.test(tags) || name === 'MediChain-FL' ? 'Research' : 'Applied AI';
  const questions = { 'Towards Fair Indian English ASR': 'Does recognition work equally well across accents?', 'UncertaRAG': 'Does retrieval actually improve uncertainty estimation?', 'Qwen CUDA': 'What does language model inference look like in CUDA?', 'Rakshak-AI': 'How can agents help a team prepare for an audit?', 'LocalLens': 'How can agents search across local files?' };
  return {name,url,description,tags,category,id:i+1,question:questions[name]};
});

// Stable key for a project: its repository name (for example "qwen_cuda" → "qwen-cuda").
export const projectKey = p => p.url.split('/').filter(Boolean).pop().toLowerCase().replace(/_/g, '-');
const nameKey = p => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** The project a technical post links to via `project:` (matches repo name or project name). */
export const projectForPost = post => {
  if (!post?.project) return null;
  const key = post.project.toLowerCase().replace(/_/g, '-');
  return projects.find(p => projectKey(p) === key || nameKey(p) === key) || null;
};
