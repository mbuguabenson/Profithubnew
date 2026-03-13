import classNames from 'classnames';
import React from 'react';

type TButtonLinkProps = Omit<React.HTMLProps<HTMLAnchorElement>, 'size'> & {
    to: string;
    size?: 'small' | 'medium' | 'large';
};

const ButtonLink = ({
    children,
    className,
    to,
    onClick,
    size = 'medium',
}: React.PropsWithChildren<Partial<TButtonLinkProps>>) => (
    <a
        className={classNames('dc-btn dc-btn--primary', className, 'effect', `dc-btn__${size}`)}
        href={to ?? ''}
        onClick={onClick}
    >
        {children}
    </a>
);

export default ButtonLink;
