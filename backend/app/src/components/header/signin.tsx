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
          <Button color="secondary" href="/admin/signin">
            Sign In
          </Button>
        </span>
      )}
    </div>
  );
};

export default Signin;
