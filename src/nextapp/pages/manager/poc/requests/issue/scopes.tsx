import React, { useState, useEffect } from 'react';
import {
    Stack,
    Checkbox, CheckboxGroup,
  } from '@chakra-ui/react';

const ScopeChoice = ({scopes, selectedScopes}) => {

    const [checkedItems, setCheckedItems] = React.useState(scopes.map(s => selectedScopes.includes(s)))

    const toggle =  (scope, toggle) => {
        toggle ? selectedScopes.push(scope) : selectedScopes.splice(selectedScopes.indexOf(scope), 1)
        setCheckedItems(scopes.map(s => selectedScopes.includes(s)))
    }

    return (
       <Stack pl={6} mt={1} spacing={1}>
            {
                scopes.map((scope,index) => (
                    <Checkbox key={index}
                        value={scope}
                        isChecked={checkedItems[index]} onChange={(e) => toggle(scope, e.target.checked)}
                    >
                        {scope}
                    </Checkbox>
                ))
            }
        </Stack>

    )
}

export default ScopeChoice