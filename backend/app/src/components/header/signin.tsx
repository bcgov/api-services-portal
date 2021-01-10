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
            { data != null && data.allTemporaryIdentities && data.allTemporaryIdentities.length == 1 ? (
                <span>{data.allTemporaryIdentities[0].username} (<a href="/admin/signout">Signout</a>)</span>
            ) : (
                <span><a href="/admin/signin">Signin</a></span>
            ) }
        </div>
    )
};

export default Signin;