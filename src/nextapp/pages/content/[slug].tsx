import {getDocBySlug, getAllDocs } from '../../shared/services/utils'
import { remark } from 'remark';
import html from 'remark-html';

interface DocProps {
    slug: string
    content: string
}

const ContentPage: React.FC<DocProps> = ({content}) => {
  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  )
}


export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = await remark().use(html).process(markdown)
  return markdown.toString()
};


interface Params {
  params: {
    slug: string;
    content: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const doc = getDocBySlug(params.slug);
  const content = await markdownToHtml(doc.content || '');

  return {props: { content }};
}

export async function getStaticPaths() {
  const docs = getAllDocs();

  return {
    paths: docs.map((doc) => {
      return {
        params: {
          slug: doc.slug,
        },
      }
    }),
    fallback: false,
  }
}

export default ContentPage;