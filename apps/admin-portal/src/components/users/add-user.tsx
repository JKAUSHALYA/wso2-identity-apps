/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Field, Forms, FormValue, Validation } from "@wso2is/forms";
import { FormValidation } from "@wso2is/validation";
import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Grid,
    Message,
} from "semantic-ui-react";
import { getUsersList, getUserStoreList } from "../../api";
import { generate } from "generate-password";
import { BasicUserDetailsInterface } from "../../models";

/**
 * Proptypes for the add user component.
 */
interface AddUserProps {
    initialValues: any;
    triggerSubmit: boolean;
    onSubmit: (values: any) => void;
}

/**
 * Add user page.
 *
 * @return {ReactElement}
 */
export const AddUser: React.FunctionComponent<AddUserProps> = (props: AddUserProps): ReactElement => {

    const {
        initialValues,
        triggerSubmit,
        onSubmit,
    } = props;

    const [ userStoreOptions, setUserStoresList ] = useState([]);
    const [ passwordOption, setPasswordOption ] = useState(initialValues && initialValues.passwordOption);
    const [ isUsernameValid, setIsUsernameValid ] = useState<boolean>(true);
    const [ updatedUsername, setUpdatedUsername ] = useState<string>(initialValues?.userName);
    const [ userStore, setUserStore ] = useState<string>("");
    const [ randomPassword, setRandomPassword ] = useState<string>("");
    const [ isPasswordGenerated, setIsPasswordGenerated ] = useState<boolean>(false);

    const { t } = useTranslation();

    /**
     * The following useEffect is triggered when a random password is generated.
     */
    useEffect(() => {
        if (randomPassword && randomPassword !== "") {
            setIsPasswordGenerated(true);
        }
    }, [ randomPassword ]);

    /**
     * The following useEffect is triggered when the username gets updated.
     */
    useEffect(() => {
        setIsUsernameValid(false);
        validateUsername(updatedUsername);
    }, [ updatedUsername ]);

    /**
     * The following useEffect is triggered when the username gets updated.
     */
    useEffect(() => {
        setIsUsernameValid(false);
        validateUsername(updatedUsername);
    }, [ userStore ]);

    /**
     * Fetch the list of available user stores.
     */
    useEffect(() => {
        getUserStores();
    }, []);

    const passwordOptions = [
        { label: "Invite user to set password", value: "askPw" },
        { label: "Set user password", value: "createPw" },
    ];

    /**
     * The following function validates whether the username entered by the user already exists in the
     * user store selected by the user.
     *
     * @param username
     */
    const validateUsername = (username: string): void => {
        getUsersList(null, null, "userName eq " + username, null, userStore)
            .then((response) => {
                setIsUsernameValid(response?.totalResults === 0);
            });
    };

    /**
     * The following function handles the change of the userstore.
     *
     * @param values
     */
    const handleUserStoreChange = (values: Map<string, FormValue>): void => {
        setUserStore(values.get("domain").toString());
    };

    /**
     * The following function handles the change of the username.
     *
     * @param values
     */
    const handleUserNameChange = (values: Map<string, FormValue>): void => {
        setUpdatedUsername(values?.get("userName")?.toString());
    };

    /**
     * The following function generate a random password.
     */
    const generateRandomPassword = (): void => {
        setRandomPassword(generate({ length: 10, numbers: true }));
    };

    /**
     * The following function fetch the user store list and set it to the state.
     */
    const getUserStores = (): void => {
        const storeOptions = [{ text: "Primary", key: -1, value: "primary" }];
        let storeOption = { text: "", key: null, value: "" };
        getUserStoreList()
            .then((response) => {
                if (storeOptions === []) {
                    storeOptions.push(storeOption);
                }
                response.data.map((store, index) => {
                    storeOption = {
                        key: index,
                        text: store.name,
                        value: store.name
                    };
                    storeOptions.push(storeOption);
                }
                );
                setUserStoresList(storeOptions);
            });

        setUserStoresList(storeOptions);
    };

    const getFormValues = (values: Map<string, FormValue>): BasicUserDetailsInterface => {
        return {
            domain: values.get("domain").toString(),
            email: values.get("email").toString(),
            firstName: values.get("firstName").toString(),
            lastName: values.get("lastName").toString(),
            newPassword: values.get("newPassword") && values.get("newPassword") !== undefined  ?
                values.get("newPassword").toString() : "",
            confirmPassword: values.get("confirmPassword") && values.get("confirmPassword") !== undefined  ?
                values.get("confirmPassword").toString() : "",
            passwordOption: values.get("passwordOption").toString(),
            userName: values.get("userName").toString(),
        };
    };

    const handlePasswordOptions = () => {
        if (passwordOption && passwordOption === "createPw") {
            return (
                <>
                    <Grid.Row columns={ 2 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                            <Field
                                data-testid="user_mgt_add_user_form_newPassword_input"
                                hidePassword={ t("common:hidePassword") }
                                label={ t(
                                    "devPortal:components.user.forms.addUserForm.inputs.newPassword.label"
                                ) }
                                name="newPassword"
                                placeholder={ t(
                                    "devPortal:components.user.forms.addUserForm.inputs." +
                                    "newPassword.placeholder"
                                ) }
                                required={ true }
                                requiredErrorMessage={ t(
                                    "devPortal:components.user.forms.addUserForm." +
                                    "inputs.newPassword.validations.empty"
                                ) }
                                showPassword={ t("common:showPassword") }
                                type="password"
                                value={ isPasswordGenerated ? randomPassword : initialValues?.newPassword }
                            />
                        </Grid.Column>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                            <Field
                                className="generate-password-button"
                                onClick={ generateRandomPassword }
                                type="button"
                                value="Generate Password"
                                icon="random"
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                            <Field
                                data-testid="user_mgt_add_user_form_confirmPassword_input"
                                hidePassword={ t("common:hidePassword") }
                                label={ t(
                                    "devPortal:components.user.forms.addUserForm.inputs.confirmPassword.label"
                                ) }
                                name="confirmPassword"
                                placeholder={ t(
                                    "devPortal:components.user.forms.addUserForm.inputs." +
                                    "confirmPassword.placeholder"
                                ) }
                                required={ true }
                                requiredErrorMessage={ t(
                                    "devPortal:components.user.forms.addUserForm." +
                                    "inputs.confirmPassword.validations.empty"
                                ) }
                                showPassword={ t("common:showPassword") }
                                type="password"
                                value={ isPasswordGenerated ? randomPassword : initialValues?.confirmPassword }
                                validation={ (value: string, validation: Validation, formValues) => {
                                    if (formValues.get("newPassword") !== value) {
                                        validation.isValid = false;
                                        validation.errorMessages.push(
                                            t("devPortal:components.user.forms.addUserForm.inputs" +
                                                ".confirmPassword.validations.mismatch"));
                                    }
                                } }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </>
            );
        } else if (passwordOption && passwordOption === "askPw") {
            return (
                <>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                            <Message
                                icon="mail"
                                content="An email with a confirmation link will be sent to the provided email address
                                for the user to set his/her own password."
                            />
                        </Grid.Column>
                    </Grid.Row>
                </>
            );
        } else {
            return "";
        }
    };

    /**
     * The modal to add new user.
     */
    const addUserBasicForm = () => (
        <Forms
            data-testid="user_mgt_add_user_form"
            onSubmit={ (values) => {
                onSubmit(getFormValues(values));
            } }
            submitState={ triggerSubmit }
        >
            <Grid>
                <Grid.Row columns={ 2 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            data-testid="user_mgt_add_user_form_domain_dropdown"
                            type="dropdown"
                            label={ t(
                                "devPortal:components.user.forms.addUserForm.inputs.domain.label"
                            ) }
                            name="domain"
                            children={ userStoreOptions }
                            requiredErrorMessage={ t(
                                "devPortal:components.user.forms.addUserForm.inputs.domain.validations.empty"
                            ) }
                            required={ true }
                            value={ initialValues?.domain ? initialValues?.domain : userStoreOptions[0]?.value }
                            listen={ handleUserStoreChange }
                        />
                    </Grid.Column>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            data-testid="user_mgt_add_user_form_username_input"
                            label={ t(
                                "devPortal:components.user.forms.addUserForm.inputs.username.label"
                            ) }
                            name="userName"
                            placeholder={ t(
                                "devPortal:components.user.forms.addUserForm.inputs." +
                                "username.placeholder"
                            ) }
                            required={ true }
                            requiredErrorMessage={ t(
                                "devPortal:components.user.forms.addUserForm." +
                                "inputs.username.validations.empty"
                            ) }
                            type="text"
                            validation={ (value: string, validation: Validation) => {
                                if (isUsernameValid === false) {
                                    validation.isValid = false;
                                    validation.errorMessages.push("A user already exists with this username.");
                                }
                            } }
                            value={ initialValues && initialValues.userName }
                            listen={ handleUserNameChange }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 2 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            data-testid="user_mgt_add_user_form_firstName_input"
                            label={ t(
                                "devPortal:components.user.forms.addUserForm.inputs.firstName.label"
                            ) }
                            name="firstName"
                            placeholder={ t(
                                "devPortal:components.user.forms.addUserForm.inputs." +
                                "firstName.placeholder"
                            ) }
                            required={ true }
                            requiredErrorMessage={ t(
                                "devPortal:components.user.forms.addUserForm." +
                                "inputs.firstName.validations.empty"
                            ) }
                            type="text"
                            value={ initialValues && initialValues.firstName }
                        />
                    </Grid.Column>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            data-testid="user_mgt_add_user_form_lastName_input"
                            label={ t(
                                "devPortal:components.user.forms.addUserForm.inputs.lastName.label"
                            ) }
                            name="lastName"
                            placeholder={ t(
                                "devPortal:components.user.forms.addUserForm.inputs." +
                                "lastName.placeholder"
                            ) }
                            required={ true }
                            requiredErrorMessage={ t(
                                "devPortal:components.user.forms.addUserForm." +
                                "inputs.lastName.validations.empty"
                            ) }
                            type="text"
                            value={ initialValues && initialValues.lastName }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            data-testid="user_mgt_add_user_form_email_input"
                            label="Email address"
                            name="email"
                            placeholder={ t(
                                "devPortal:components.user.forms.addUserForm.inputs." +
                                "email.placeholder"
                            ) }
                            required={ true }
                            requiredErrorMessage={ t(
                                "devPortal:components.user.forms.addUserForm.inputs.email.validations.empty"
                            ) }
                            validation={ (value: string, validation: Validation) => {
                                if (!FormValidation.email(value)) {
                                    validation.isValid = false;
                                    validation.errorMessages.push(
                                        t(
                                            "devPortal:components.user.forms.addUserForm.inputs.email." +
                                            "validations.invalid"
                                        ).toString()
                                    );
                                }
                            }
                            }
                            type="email"
                            value={ initialValues && initialValues.email }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 10 }>
                        <Field
                            data-testid="user_mgt_add_user_form_passwordOption_radio_button"
                            type="radio"
                            label="Select the method to set the user password"
                            name="passwordOption"
                            default="Ask password"
                            listen={ (values) => { setPasswordOption(values.get("passwordOption").toString()); } }
                            children={ passwordOptions }
                            value={ initialValues && initialValues.passwordOption }
                        />
                    </Grid.Column>
                </Grid.Row>
                { handlePasswordOptions() }
            </Grid>
        </Forms>
    );

    return (
        <>
            { addUserBasicForm() }
        </>
    );
};
