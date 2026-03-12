import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import Dropdown from 'react-dropdown';

import Icon from '../Icon';
import Loading from '../Loading';
import { checkLobbyPathnameExists, createLobby, fetchLobbyGenres } from '../../actions';

const MAX_LOBBY_NAME_LENGTH = 50;
const MAX_URL_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 255;
const URL_REGEX = /^[a-z0-9_-]+$/i;

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
    state = {
        step: 1,
        genres: [],
        selectedGenreIds: [],
        isLoadingGenres: false,
        isSubmittingLobby: false,
        isValidatingStepOne: false,
        didAttemptStepOneNext: false,
        didAttemptGenreSubmit: false,
        submitError: null,
        stepOneUrlAsyncError: null,
        stepOneSyncErrors: {},
    };

    componentDidMount() {
        this.loadGenres();
    }

    loadGenres = () => {
        this.setState({ isLoadingGenres: true });

        this.props
            .fetchLobbyGenres()
            .then((genres) => {
                this.setState({ genres, isLoadingGenres: false });
            })
            .catch(() => {
                this.setState({ genres: [], isLoadingGenres: false });
            });
    };

    renderInput = ({ input, label, type, meta, maxLength }) => {
        const syncError = this.state.stepOneSyncErrors[input.name];
        const hasUrlAsyncError = input.name === 'url' && !!this.state.stepOneUrlAsyncError;
        const hasShowableError = (meta.touched || this.state.didAttemptStepOneNext) && (meta.error || syncError || hasUrlAsyncError);
        console.log('rendering input', { name: input.name, touched: meta.touched, error: meta.error, syncError, hasUrlAsyncError, hasShowableError });
        const inputClassName = `input ${hasShowableError ? 'error' : ''}`;
        const errorText = hasUrlAsyncError ? this.state.stepOneUrlAsyncError : meta.error || syncError;
        const errorMessage = hasShowableError ? <div className="error-msg">{errorText}</div> : null;
        const autoFocus = input.name === 'name';

        return (
            <div className="field">
                <label className="label">{label}</label>
                <input
                    className={inputClassName}
                    {...input}
                    onChange={(event) => {
                        input.onChange(event);

                        if (input.name === 'url' && this.state.stepOneUrlAsyncError) {
                            this.setState({ stepOneUrlAsyncError: null });
                        }

                        if (this.state.stepOneSyncErrors[input.name]) {
                            this.setState((prevState) => ({
                                stepOneSyncErrors: {
                                    ...prevState.stepOneSyncErrors,
                                    [input.name]: null,
                                },
                            }));
                        }
                    }}
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
        const syncError = this.state.stepOneSyncErrors.visibility;
        const errorText = meta.error || syncError;
        const hasShowableError = !!errorText && (meta.touched || this.state.didAttemptStepOneNext);
        const errorMessage = hasShowableError ? <div className="error-msg">{errorText}</div> : null;
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
                        onChange={(option) => {
                            input.onChange(option.value);

                            if (this.state.stepOneSyncErrors.visibility) {
                                this.setState((prevState) => ({
                                    stepOneSyncErrors: {
                                        ...prevState.stepOneSyncErrors,
                                        visibility: null,
                                    },
                                }));
                            }
                        }}
                        onBlur={() => input.onBlur(input.value)}
                    />
                </div>
                <input {...input} type="hidden" />
                {errorMessage}
            </div>
        );
    };

    renderTextArea = ({ input, label, meta, maxLength }) => {
        const syncError = this.state.stepOneSyncErrors.description;
        const errorText = meta.error || syncError;
        const hasShowableError = !!errorText && (meta.touched || this.state.didAttemptStepOneNext);
        const textAreaClassName = `input textarea ${hasShowableError ? 'error' : ''}`;
        const errorMessage = hasShowableError ? <div className="error-msg">{errorText}</div> : null;

        return (
            <div className="field description">
                <label className="label">{label}</label>
                <textarea
                    className={textAreaClassName}
                    {...input}
                    onChange={(event) => {
                        input.onChange(event);

                        if (this.state.stepOneSyncErrors.description) {
                            this.setState((prevState) => ({
                                stepOneSyncErrors: {
                                    ...prevState.stepOneSyncErrors,
                                    description: null,
                                },
                            }));
                        }
                    }}
                    maxLength={maxLength}
                    rows="5"
                />
                {errorMessage}
            </div>
        );
    };

    onClickNext = () => {
        const stepOneFieldNames = [ 'name', 'url', 'visibility', 'description' ];

        this.setState({ didAttemptStepOneNext: true });
        this.props.touch(...stepOneFieldNames);

        const values = this.props.formValues || {};
        const syncErrors = validate(values);

        if (Object.keys(syncErrors).length > 0) {
            this.setState({ stepOneUrlAsyncError: null, stepOneSyncErrors: syncErrors });
            return;
        }

        this.setState({
            isValidatingStepOne: true,
            submitError: null,
            stepOneUrlAsyncError: null,
            stepOneSyncErrors: {},
        });

        this.props
            .checkLobbyPathnameExists(values.url)
            .then((exists) => {
                if (exists) {
                    this.setState({
                        isValidatingStepOne: false,
                        stepOneUrlAsyncError: 'That lobby URL is already taken.',
                    });
                    return;
                }

                this.setState({
                    isValidatingStepOne: false,
                    step: 2,
                    didAttemptStepOneNext: false,
                    stepOneUrlAsyncError: null,
                    stepOneSyncErrors: {},
                });
            })
            .catch(() => {
                this.setState({
                    isValidatingStepOne: false,
                    stepOneUrlAsyncError: 'Could not validate this URL right now. Please try again.',
                });
            });
    };

    onClickBack = () => {
        this.setState({
            step: 1,
            didAttemptStepOneNext: false,
            didAttemptGenreSubmit: false,
            submitError: null,
            stepOneUrlAsyncError: null,
            stepOneSyncErrors: {},
        });
    };

    toggleGenre = (genreId) => {
        this.setState((prevState) => {
            if (prevState.selectedGenreIds.includes(genreId)) {
                return {
                    selectedGenreIds: prevState.selectedGenreIds.filter((id) => id !== genreId),
                };
            }

            if (prevState.selectedGenreIds.length >= 5) {
                return null;
            }

            return {
                selectedGenreIds: [...prevState.selectedGenreIds, genreId],
            };
        });
    };

    onSubmit = (values) => {
        if (!this.state.selectedGenreIds.length) {
            this.setState({ didAttemptGenreSubmit: true });
            return;
        }

        const payload = {
            name: values.name,
            pathname: values.url,
            visibility: values.visibility,
            description: values.description || '',
            genres: this.state.selectedGenreIds,
        };

        this.setState({ isSubmittingLobby: true, submitError: null });

        this.props
            .createLobby(payload)
            .then((createdLobby) => {
                const path = (createdLobby && createdLobby.pathname) || payload.pathname;
                window.location.href = `/${path}`;
            })
            .catch((error) => {
                const message = error?.response?.data || 'Could not create lobby. Please try again.';
                this.setState({ isSubmittingLobby: false, submitError: message });
            });
    };

    renderStepOne() {
        return (
            <Fragment>
                <div className="fields">
                    <Field
                        name="name"
                        type="text"
                        label="Lobby Name:"
                        key={this.state.stepOneSyncErrors.name ? `name-${this.state.stepOneSyncErrors.name}` : 'name'}
                        maxLength={MAX_LOBBY_NAME_LENGTH}
                        component={this.renderInput}
                    />
                    <Field
                        name="url"
                        type="text"
                        label="URL:"
                        key={this.state.stepOneSyncErrors.url || this.state.stepOneUrlAsyncError ? `url-${this.state.stepOneSyncErrors.url || this.state.stepOneUrlAsyncError}` : 'url'}
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
                    <button className="btn-submit" type="button" onClick={this.onClickNext}>
                        Next
                    </button>
                </div>

                {this.state.submitError ? <div className="server-error"><span>{this.state.submitError}</span></div> : null}
            </Fragment>
        );
    }

    renderStepTwo() {
        const showGenreError = this.state.didAttemptGenreSubmit && this.state.selectedGenreIds.length === 0;
        const noGenresLoaded = this.state.genres.length === 0;

        return (
            <Fragment>
                <div className="genre-step">
                    <div className="genre-step__heading">Choose 1-5 genre tags</div>

                    <div className="genre-step__tags">
                        {this.state.genres.map((genre) => {
                            const isSelected = this.state.selectedGenreIds.includes(genre.genre_id);

                            return (
                                <button
                                    key={genre.genre_id}
                                    type="button"
                                    className={`tag ${isSelected ? 'selected' : ''}`}
                                    onClick={() => this.toggleGenre(genre.genre_id)}
                                >
                                    {genre.tag}
                                </button>
                            );
                        })}
                    </div>

                    {noGenresLoaded ? <div className="genre-step__empty">No genres are currently available.</div> : null}

                    {showGenreError ? <div className="genre-step__error">Please select at least one genre tag.</div> : null}
                </div>

                <div className="btns">
                    <button className="btn-close" type="button" onClick={this.onClickBack}>
                        Back
                    </button>
                    <button className="btn-submit" type="submit">
                        <Fragment>
                            <Icon name="plus" /> Create Lobby
                        </Fragment>
                    </button>
                </div>

                {this.state.submitError ? <div className="server-error"><span>{this.state.submitError}</span></div> : null}
            </Fragment>
        );
    }

    render() {
        const currentStep = this.state.step === 1 ? this.renderStepOne() : this.renderStepTwo();

        return (
            <form className="lobby-form" onSubmit={this.props.handleSubmit(this.onSubmit)}>
                <div className="header">
                    <span className="title">Create Your Lobby</span>
                </div>

                {(this.state.step === 2 && this.state.isLoadingGenres) || this.state.isSubmittingLobby || this.state.isValidatingStepOne ? <Loading /> : null}
                {currentStep}
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
    } else if (!URL_REGEX.test(values.url)) {
        errors.url = 'URL can only include letters, numbers, underscores, and hyphens.';
    }

    if (!values.visibility || (values.visibility !== 'public' && values.visibility !== 'private')) {
        errors.visibility = 'Please choose a visibility option.';
    }

    if (values.description && values.description.length > MAX_DESCRIPTION_LENGTH) {
        errors.description = `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
    }

    return errors;
};

const asyncValidate = (values, dispatch, props, blurredField) => {
    if (blurredField && blurredField !== 'url') {
        return Promise.resolve();
    }

    if (!values.url || values.url.length > MAX_URL_LENGTH || !URL_REGEX.test(values.url)) {
        return Promise.resolve();
    }

    return props
        .checkLobbyPathnameExists(values.url)
        .then((exists) => {
            if (exists) {
                throw { url: 'That lobby URL is already taken.' };
            }
        })
        .catch((error) => {
            if (error && error.url) {
                throw error;
            }

            throw { url: 'Could not validate this URL right now. Please try again.' };
        });
};

const selector = formValueSelector('lobbyForm');

const mapStateToProps = (state) => {
    return {
        formValues: selector(state, 'name', 'url', 'visibility', 'description'),
    };
};

export default connect(mapStateToProps, { fetchLobbyGenres, checkLobbyPathnameExists, createLobby })(
    reduxForm({
        form: 'lobbyForm',
        initialValues: {
            visibility: 'public',
        },
        validate,
        asyncValidate,
        shouldAsyncValidate: (params) => {
            if (!params.syncValidationPasses) {
                return false;
            }
            return (params.trigger === 'blur');
        },
        asyncBlurFields: [ 'url' ],
    })(LobbyForm)
);
