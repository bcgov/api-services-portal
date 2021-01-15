import * as React from 'react';

import cx from 'classnames';

interface NameValueProps {
  name: String;
  value: any;
  width: String;
}

const NameValue: React.FC<NameValueProps> = ({ name, value, width }) => {
  const style = {}
  style['width'] = width
  return (
    <div className="flex" style={style}>
      <div className="m-2"><b>{name}</b><br/>{value}</div>
    </div>
  );
};

export default NameValue;