import * as React from 'react';

function flatten(text: string, child: React.ReactElement | string) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

interface DocHeaderProps {
  children: React.ReactNode;
  level: number;
}

const DocHeader: React.FC<DocHeaderProps> = ({ children, level }) => {
  const nodes = React.Children.toArray(children);
  const text = nodes.reduce(flatten, '');
  const slug = text.toLowerCase().replace(/\W/g, '-');

  return React.createElement('h' + level, { id: slug }, children);
};

export default DocHeader;
