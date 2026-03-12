import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import Dropdown from 'react-dropdown';

import Icon from '../Icon';
import Loading from '../Loading';
import { fetchLobbyGenres } from '../../actions';

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
    state = {
        step: 1,
        genres: [],
        selectedGenreIds: [],
        isLoadingGenres: false,
        didAttemptGenreSubmit: false,
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

    onClickNext = () => {
        this.props.handleSubmit(() => {
            this.setState({ step: 2 });
        })();
    };

    onClickBack = () => {
        this.setState({ step: 1, didAttemptGenreSubmit: false });
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

        if (this.props.onSubmit) {
            this.props.onSubmit({
                ...values,
                genres: this.state.selectedGenreIds,
            });
        }

        if (this.props.handleClose) {
            this.props.handleClose();
        }
    };

    renderStepOne() {
        return (
            <Fragment>
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
                    <button className="btn-submit" type="button" onClick={this.onClickNext}>
                        Next
                    </button>
                </div>
            </Fragment>
        );
    }

    renderStepTwo() {
        const showGenreError = this.state.didAttemptGenreSubmit && this.state.selectedGenreIds.length === 0;
        const noGenresLoaded = this.state.genres.length === 0;

        return (
            <Fragment>
                <div className="genre-step">
                    <div className="genre-step__heading">Choose 1 to 5 genre tags</div>

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

                {this.state.isLoadingGenres ? <Loading /> : currentStep}
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

export default connect(null, { fetchLobbyGenres })(
    reduxForm({
        form: 'lobbyForm',
        initialValues: {
            visibility: 'public',
        },
        validate,
    })(LobbyForm)
);
