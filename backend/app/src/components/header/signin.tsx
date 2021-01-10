import * as React from 'react';



interface SigninProps {
    user: { username, roles };
}

const Signin: React.FC<SigninProps> = ({ user }) => {

    return (
        <div className="">
            { user ? (
                <span>{user.username} (<a href="/admin/signout">Signout</a>) : Roles {user.roles}</span>
            ) : (
                <span><a href="/admin/signin">Signin</a></span>
            ) }
        </div>
    )
};

export default Signin;