import { FormElement } from "./FormElement.js";

export class SettingsPage {
    resetButton;
    formElements;

    constructor() {
        if (this.constructor === SettingsPage) {
            throw new Error("Can't instantiate abstract class!");
        }
        this.formElements = [];
    }

    init() {
        throw new Error("init() must be implemented!");
    }

    onInit() {
        this.resetButton = document.getElementById('reset_btn');
        this.resetButton.addEventListener('click', () => this.onResetConfigValues());

        this.init();
        this.pullConfigValues();

        // Live-sync: when the popup (or another tab) changes localStorage,
        // automatically update the settings page to stay in sync.
        window.addEventListener('storage', (e) => {
            const match = this.formElements.find(fe => fe.name === e.key);
            if (match && e.newValue !== null) {
                match.setValue(JSON.parse(e.newValue));
            }
        });
    }

    clearConfigValues() {
        this.formElements.forEach(formElement => {
            localStorage.removeItem(formElement.name);
        });
    }

    // localstorage values push/pull
    pullConfigValues() {
        this.formElements.forEach(formElement => {
            const localStorageVal = localStorage.getItem(formElement.name);
            if (localStorageVal) {
                formElement.setValue(JSON.parse(localStorageVal));
            } else {
                formElement.setValue(formElement.default);
            }
        });
    }

    pushConfigValues() {
        this.formElements.forEach(formElement => {
            const formValue = (formElement.valueType === 'string')
                ? `"${formElement.getValue()}"`
                : formElement.getValue();
            localStorage.setItem(formElement.name, formValue);
        });
    }

    // register form element
    registerFormElement(name, description, type, defaultValue) {
        const formElement = new FormElement(name, description, type, defaultValue);
        formElement.registerChangeListener(() => {
            const formValue = (formElement.valueType === 'string')
                ? `"${formElement.getValue()}"`
                : formElement.getValue();
            localStorage.setItem(formElement.name, formValue);
        });
        this.formElements.push(formElement);
        return formElement;
    }

    // on event callbacks
    onResetConfigValues() {
        this.clearConfigValues();
        this.pullConfigValues();
    }
}
