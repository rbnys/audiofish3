import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import Loading from '../Loading';
import { signIn, clearLogInError } from '../../actions';

import errorIcon from '../../img/error.png';
import { selectAuthErrorMessage } from '../../reducers';

class SignInForm extends React.Component {
	state = { loading: false };

	componentDidMount() {
		this.props.clearLogInError(); // Clear the previous error (if there was one) to avoid confusion
	}

	renderInput = ({ input, label, type, meta }) => {
		const hasShowableError = meta.error && meta.touched;

		const inputClassName = `input ${hasShowableError ? 'error' : ''}`;
		const errorMessage = hasShowableError ? <div className="error-msg">{meta.error}</div> : null;
		const autoFocus = input.name === 'username';

		return (
			<div className="field">
				<label className="label">{label}</label>
				<input className={inputClassName} {...input} type={type} autoComplete="off" autoFocus={autoFocus} />
				{errorMessage}
			</div>
		);
	};

	onSubmit = (values) => {
		this.setState({ loading: true });
		this.props.clearLogInError();
		this.props.signIn(values.username, values.password);
	};

	render() {
		let serverError = null;
		if (this.props.errorMessage) {
			serverError = this.props.errorMessage;
		}
		serverError = serverError ? (
			<div className="server-error">
				<img src={errorIcon} alt="Error" width="16" height="16" />
				<span>{serverError}</span>
			</div>
		) : null;

		return (
			<form id="login-form" className="form" onSubmit={this.props.handleSubmit(this.onSubmit)}>
				{serverError}

				<div className="fields">
					<Field name="username" type="text" label="Username:" component={this.renderInput} />
					<Field name="password" type="password" label="Password:" component={this.renderInput} />
				</div>

				<div className="btns">
					<button className="btn-close" type="button" onClick={this.props.handleClose}>
						Cancel
					</button>
					<button className="btn-submit" type="submit">
						Log In
					</button>
				</div>

				{this.state.loading && !serverError ? <Loading /> : null}
			</form>
		);
	}
}

const validate = (values) => {
	const errors = {};

	const { username, password } = values;

	if (!username) {
		errors.username = 'You must provide a username.';
	}
	if (!password) {
		errors.password = 'You must provide a password.';
	}

	return errors;
};

const mapStateToProps = (state) => {
	return {
		errorMessage: selectAuthErrorMessage(state)
	};
};

export default connect(mapStateToProps, { signIn, clearLogInError })(
	reduxForm({
		form: 'signInForm',
		validate,
		touchOnBlur: false
	})(SignInForm)
);
