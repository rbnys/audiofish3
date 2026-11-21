import React from 'react';

import sprite from '../img/sprite.svg';

const Icon = (props) => {
	const { name, className, ...rest } = props;

	return (
		<svg {...rest} className={`icon icon-tag-${name}${className ? ` ${className}` : ''}`}>
			<use href={`${sprite}#icon-${name}`} />
		</svg>
	);
};

export default Icon;
