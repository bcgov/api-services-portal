import * as React from 'react';

import Button from '../button';

interface SigninProps {
  user: { username; roles; namespace };
}

const Signin: React.FC<SigninProps> = ({ user }) => {
  return (
    <div className="">
      {user ? (
        <span>
          {user.username} (<a href="/admin/signout">Signout</a>)
        </span>
      ) : (
        <span>
          <Button color="secondary" href="/oauth2/sign_out">
            Sign In
          </Button>
        </span>
      )}
    </div>
  );
};

export default Signin;
