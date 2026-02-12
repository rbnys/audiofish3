import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import axios from 'axios';

import Loading from '../Loading';
import serverIP from '../../server';
import { signUp, clearLogInError } from '../../actions';

import errorIcon from '../../img/error.png';
import { selectAuthErrorMessage } from '../../reducers';

class SignUpForm extends React.Component {
	state = { loading: false };

	componentDidMount() {
		this.props.clearLogInError(); // Clear the previous error (if there was one) to avoid confusion
	}

	renderInput = ({ input, label, type, meta, maxLength }) => {
		const hasShowableError = meta.error && meta.touched;

		const inputClassName = `input ${hasShowableError ? 'error' : ''}`;
		const errorMessage = hasShowableError ? <div className="error-msg">{meta.error}</div> : null;
		const autoFocus = input.name === 'username';

		return (
			<div className="field">
				<label className="label">{label}</label>
				<input
					className={inputClassName}
					{...input}
					type={type}
					autoComplete="off"
					autoFocus={autoFocus}
					maxLength={maxLength}
				/>
				{errorMessage}
			</div>
		);
	};

	onSubmit = (values) => {
		this.setState({ loading: true });
		this.props.clearLogInError();
		this.props.signUp(values.username, values.password);
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
			<form id="signup-form" className="form" onSubmit={this.props.handleSubmit(this.onSubmit)}>
				{serverError}

				<div className="fields">
					<Field name="username" type="text" label="Username:" maxLength="16" component={this.renderInput} />
					<Field
						name="password"
						type="password"
						label="Password:"
						maxLength="255"
						component={this.renderInput}
					/>
					<Field
						name="confirm"
						type="password"
						label="Confirm Password:"
						maxLength="255"
						component={this.renderInput}
					/>
				</div>

				<div className="btns">
					<button className="btn-close" type="button" onClick={this.props.handleClose}>
						Cancel
					</button>
					<button className="btn-submit" type="submit">
						Create Account
					</button>
				</div>

				{this.state.loading && !serverError ? <Loading /> : null}
			</form>
		);
	}
}

const validate = (values) => {
	const errors = {};

	const { username, password, confirm } = values;

	if (!username || username.length < 2) {
		errors.username = 'Username must be at least 2 characters long.';
	} else if (username.length > 16) {
		errors.username = 'Username must not exceed 16 characters.';
	} else if (!username.match(/^[a-z0-9_]+$/i)) {
		errors.username = 'Username can only include letters, numbers, and underscores.';
	}

	if (!password || password.length < 6) {
		errors.password = 'Password must be at least 6 characters long.';
	} else if (password.length > 255) {
		errors.password = 'Password must not exceed 255 characters.';
	}

	if (password !== confirm) {
		errors.confirm = 'Passwords do not match!';
	}

	return errors;
};

const asyncValidate = (values) => {
	return axios
		.post(`${serverIP}/user/exists`, {
			username: values.username
		})
		.then((res) => {
			if (res.data === true) {
				throw { username: 'That username is already taken!' };
			}
		});
};

const mapStateToProps = (state) => {
	return {
		errorMessage: selectAuthErrorMessage(state)
	};
};

export default connect(mapStateToProps, { signUp, clearLogInError })(
	reduxForm({
		form: 'signUpForm',
		validate,
		asyncValidate,
		asyncBlurFields: [ 'username' ],
		touchOnBlur: false
	})(SignUpForm)
);
