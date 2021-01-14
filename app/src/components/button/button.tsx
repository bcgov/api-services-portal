import * as React from 'react';
import cx from 'classnames';

interface ButtonProps {
  color?: 'primary' | 'secondary';
  children: React.ReactNode;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  color = 'primary',
  children,
  href,
}) => {
  const classes = cx(
    'text-white',
    'py-2',
    'px-4',
    'rounded-sm',
    'text-base',
    'no-underline',
    'leading-6',
    {
      ['bg-bc-blue']: color === 'primary',
      ['bg-bc-yellow']: color === 'secondary',
    }
  );
  if (href.trim()) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }
  return <button className={classes}>{children}</button>;
};

export default Button;
