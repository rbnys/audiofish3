import React from 'react';

import sprite from '../img/sprite.svg';

const Icon = (props) => {
	return (
		<svg {...props} className={`icon ${props.className ? props.className : ''}`}>
			<use href={`${sprite}#icon-${props.name}`} />
		</svg>
	);
};

export default Icon;
