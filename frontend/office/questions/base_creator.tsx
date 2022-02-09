declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { Message } from 'primereact/message';
import { VariantsList } from "./variants_list"

var axios = require('axios');

export class BaseCreator extends React.Component<any, any> {

    state: {
        questionIndex: any
    }
    saveDataCallback = null;

    constructor(props) {
        super(props);

        this.state = {
            questionIndex: this.props.questionIndex
        };

        this.saveDataCallback = props.saveDataCallback;
    }

    getData = () => {
        return;
    }

    loadData = (data) => {
        return;
    }

    hasError = () => {
        return false;
    }

    isInformationBlock = () => {
        return false;
    }

    setStateAndUpdate = (data) => {
        let self = this;
        this.setState(data,
            () => self.saveDataCallback(self.getData(), self.hasError()))
    }

    render() {
        return null;
    }
}

export default BaseCreator;