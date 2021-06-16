import * as React from 'react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// import yamlfmt from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
// //import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';

// SyntaxHighlighter.registerLanguage('yaml', yamlfmt);

// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface YamlViewerProps {
  doc: string;
}

const YamlViewer: React.FC<YamlViewerProps> = ({ doc }) => {
  return (
    <SyntaxHighlighter language="yaml" bg={'white'}>
      {doc}
    </SyntaxHighlighter>
  );
};

export default YamlViewer;
