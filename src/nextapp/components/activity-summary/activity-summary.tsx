import * as React from 'react';
import compact from 'lodash/compact';
import { Text } from '@chakra-ui/react';
import { uid } from 'react-uid';

interface ActivitySummaryProps {
  data: TemplateMap;
  message: string;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ data, message }) => {
  const compiled = template(message, data);
  const regex = /(\(|\[|\]|\))/g;
  const clean = compact(compiled.split(regex));
  const result = [];

  clean.forEach((str, index, arr) => {
    if (!regex.test(str)) {
      if (arr[index - 1] === '(') {
        result.push(
          <Text key={uid(str)} as="mark" bg="none">
            {str}
          </Text>
        );
      } else if (arr[index - 1] === '[') {
        result.push(
          <Text key={uid(str)} as="strong">
            {str}
          </Text>
        );
      } else {
        result.push(str);
      }
    }
  });

  return <Text>{result}</Text>;
};

export default ActivitySummary;

// Adapted from just-template
// https://github.com/angus-c/just/blob/master/packages/string-template/index.js
type TemplateMap = {
  [key: string]: TemplateMap | string;
};

function template(string: string, data: TemplateMap): string {
  const proxyRegEx = /\{([^}]+)?\}/g;

  return string.replace(proxyRegEx, (_, key) => {
    const keyParts = key.split('.');
    let value = data;
    let result = '';

    for (let i = 0; i < keyParts.length; i++) {
      if (!value) return '';

      switch (keyParts[i]) {
        case 'actor':
          result += `(${value[keyParts[i]]})`;
          break;
        case 'action':
          result += `[${value[keyParts[i]]}]`;
          break;
        default:
          result += value[keyParts[i]];
          break;
      }
    }

    return result || '';
  });
}
