// Generate Types for the `tsoa` controllers
const fs = require('fs');
const { metadata } = require('../batch/data-rules.js');

let content = `
/********************************************/
/***** WARNING!!!! THIS IS AUTO-GENERATED ***/
/***** RUNING: npm run tsoa-gen-types     ***/
/********************************************/

`;

const refIdList = {};

Object.keys(metadata).forEach((m) => {
  const md = metadata[m];

  const relationshipFields = Object.keys(
    md.transformations
  ).filter((tranField) =>
    ['connectOne', 'connectExclusiveList', 'connectMany'].includes(
      md.transformations[tranField].name
    )
  );

  const objectFields = Object.keys(md.transformations).filter((tranField) =>
    ['toString', 'toStringDefaultArray'].includes(
      md.transformations[tranField].name
    )
  );

  const fields = [];
  fields.push(`  ${md.refKey}?: string; // Primary Key`);
  md.sync
    .filter((s) => !relationshipFields.includes(s))
    .filter((s) => !objectFields.includes(s))
    .filter((s) => s != md.refKey)
    .slice()
    .forEach((f) => {
      let type =
        md.validations && f in md.validations
          ? md.validations[f].type
          : 'string';
      if (type == 'enum') {
        fields.push(
          `  ${f}?: ${md.validations[f].values
            .map((v) => `"${v}"`)
            .join(' | ')};`
        );
      } else {
        fields.push(`  ${f}?: ${type};`);
      }
    });

  objectFields
    .map((field) => {
      const listToMatch = md.transformations[field].list;
      const mdRelField = Object.keys(metadata)
        .filter(
          (entity) =>
            metadata[entity].query === listToMatch || entity === listToMatch
        )
        .pop();
      if (md.transformations[field].name === 'toStringDefaultArray') {
        return `  ${field}?: string[];`;
      } else {
        return `  ${field}?: any; // ${md.transformations[field].name}`;
      }
    })
    .forEach((s) => fields.push(s));

  relationshipFields
    .map((field) => {
      const listToMatch = md.transformations[field].list;
      const mdRelField = Object.keys(metadata)
        .filter(
          (entity) =>
            metadata[entity].query === listToMatch || entity === listToMatch
        )
        .pop();
      if (md.transformations[field].name === 'connectOne') {
        refIdList[mdRelField] = true;
        return `  ${field}?: ${mdRelField}RefID;`;
      } else if (md.transformations[field].name === 'connectExclusiveList') {
        return `  ${field}?: ${mdRelField}[];`;
      } else {
        refIdList[mdRelField] = true;
        return `  ${field}?: ${mdRelField}RefID[];`;
      }
    })
    .forEach((s) => fields.push(s));

  const example = 'example' in md ? commentedExample(md.example) : ' *';

  content += `

/**
 * @tsoaModel
${example}
 */  
export interface ${m} {
${fields.join('\n')}
}
`;
});

Object.keys(refIdList)
  .sort()
  .forEach((id) => {
    content += `
/**
 * @tsoaModel
 */  
export type ${id}RefID = string
`;
  });

fs.writeFile('controllers/v2/types.ts', content, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Updated file: controllers/v2/types.ts');
  //file written successfully
});

function commentedExample(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .split('\n')
    .map((l, i) => ` * ${i == 0 ? '@example ' : ''}${l}`)
    .join('\n');
}
