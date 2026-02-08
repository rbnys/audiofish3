import React from 'react';

import SignInForm from './forms/SignInForm';
import SignUpForm from './forms/SignUpForm';

class LogInOrSignUp extends React.Component {
	state = { signingUp: !!this.props.signingUp };

	switchForms = (event) => {
		event.preventDefault();
		this.setState({ signingUp: !this.state.signingUp });
	};

	render() {
		const title = this.state.signingUp ? 'Sign Up for AudioFish' : 'Log In to AudioFish';
		const switchFormText = this.state.signingUp ? 'Already have an account? ' : 'Want to make an account? ';
		const switchFormLinkText = this.state.signingUp ? 'Click here to log in' : 'Click here to sign up';
		const form = this.state.signingUp ? (
			<SignUpForm handleClose={this.props.handleClose} />
		) : (
			<SignInForm handleClose={this.props.handleClose} />
		);

		return (
			<div className="login-or-signup">
				<div className="header">
					<span className="title">{title}</span>
					<span className="switch-form">
						{switchFormText}
						<a href="#" onClick={this.switchForms}>
							{switchFormLinkText}
						</a>
					</span>
				</div>
				{form}
			</div>
		);
	}
}

export default LogInOrSignUp;
