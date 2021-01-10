import * as React from 'react';

const { useEffect, useState } = React;

import graphql from '../../shared/services/graphql'

const GET_USER = `
query GetUser {
    allTemporaryIdentities {
      name
      username
      email
    }
}
`


interface SigninProps {
}

const Signin: React.FC<SigninProps> = ({ }) => {
    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
    let fetch = () => {
        graphql(GET_USER)
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, []);

    return (
        <div className="">
            { data ? data.name : "Anonymous" }
        </div>
    );
};

export default Signin;