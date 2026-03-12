import React, { Fragment } from 'react';
import { reduxForm, Field } from 'redux-form';
import Dropdown from 'react-dropdown';

import Icon from '../Icon';

const MAX_LOBBY_NAME_LENGTH = 50;
const MAX_URL_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 255;

const VISIBILITY_OPTIONS = [
    {
        value: 'public',
        label: 'Public',
        className: 'pl-dropdown__item',
    },
    {
        value: 'private',
        label: 'Private',
        className: 'pl-dropdown__item',
    },
];

class LobbyForm extends React.Component {
    renderInput = ({ input, label, type, meta, maxLength }) => {
        const hasShowableError = meta.error && meta.touched;
        const inputClassName = `input ${hasShowableError ? 'error' : ''}`;
        const errorMessage = hasShowableError ? <div className="error-msg">{meta.error}</div> : null;
        const autoFocus = input.name === 'name';

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

    renderVisibilityDropdown = ({ input, label, meta }) => {
        const hasShowableError = meta.error && meta.touched;
        const errorMessage = hasShowableError ? <div className="error-msg">{meta.error}</div> : null;
        const currentSelection = VISIBILITY_OPTIONS.find(({ value }) => value === input.value) || VISIBILITY_OPTIONS[0];

        return (
            <div className="field">
                <label className="label">{label}</label>
                <div className="input">
                    <Dropdown
                        className="pl-dropdown lobby-visibility-dropdown"
                        placeholderClassName={`pl-dropdown__placeholder ${hasShowableError ? 'error' : ''}`}
                        menuClassName="pl-dropdown__menu"
                        options={VISIBILITY_OPTIONS}
                        value={currentSelection}
                        onChange={(option) => input.onChange(option.value)}
                        onBlur={() => input.onBlur(input.value)}
                    />
                </div>
                <input {...input} type="hidden" />
                {errorMessage}
            </div>
        );
    };

    renderTextArea = ({ input, label, meta, maxLength }) => {
        const hasShowableError = meta.error && meta.touched;
        const textAreaClassName = `input textarea ${hasShowableError ? 'error' : ''}`;
        const errorMessage = hasShowableError ? <div className="error-msg">{meta.error}</div> : null;

        return (
            <div className="field description">
                <label className="label">{label}</label>
                <textarea className={textAreaClassName} {...input} maxLength={maxLength} rows="5" />
                {errorMessage}
            </div>
        );
    };

    onSubmit = (values) => {
        this.props.onSubmit(values);
        this.props.handleClose();
    };

    render() {
        return (
            <form className="lobby-form" onSubmit={this.props.handleSubmit(this.onSubmit)}>
                <div className="header">
                    <span className="title">Create Your Lobby</span>
                </div>

                <div className="fields">
                    <Field
                        name="name"
                        type="text"
                        label="Lobby Name:"
                        maxLength={MAX_LOBBY_NAME_LENGTH}
                        component={this.renderInput}
                    />
                    <Field
                        name="url"
                        type="text"
                        label="URL:"
                        maxLength={MAX_URL_LENGTH}
                        component={this.renderInput}
                    />
                    <Field name="visibility" label="Visibility:" component={this.renderVisibilityDropdown} />
                    <Field
                        name="description"
                        label="Description:"
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        component={this.renderTextArea}
                    />
                </div>

                <div className="btns">
                    <button className="btn-close" type="button" onClick={this.props.goBack || this.props.handleClose}>
                        Cancel
                    </button>
                    <button className="btn-submit" type="submit">
                        <Fragment>
                            <Icon name="plus" /> Create Lobby
                        </Fragment>
                    </button>
                </div>
            </form>
        );
    }
}

const validate = (values) => {
    const errors = {};

    if (!values.name) {
        errors.name = 'Please enter a lobby name.';
    } else if (values.name.length > MAX_LOBBY_NAME_LENGTH) {
        errors.name = `Lobby name must not exceed ${MAX_LOBBY_NAME_LENGTH} characters.`;
    }

    if (!values.url) {
        errors.url = 'Please enter a URL.';
    } else if (values.url.length > MAX_URL_LENGTH) {
        errors.url = `URL must not exceed ${MAX_URL_LENGTH} characters.`;
    }

    if (!values.visibility || (values.visibility !== 'public' && values.visibility !== 'private')) {
        errors.visibility = 'Please choose a visibility option.';
    }

    if (values.description && values.description.length > MAX_DESCRIPTION_LENGTH) {
        errors.description = `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
    }

    return errors;
};

export default reduxForm({
    form: 'lobbyForm',
    initialValues: {
        visibility: 'public',
    },
    validate,
})(LobbyForm);
