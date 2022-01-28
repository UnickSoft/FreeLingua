declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import { Translate, translate } from 'react-i18nify';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class CategoriesSelection extends React.Component<any, any> {
    state: {
        id: any
        categories: any
        selected: any
    };

    onSuccessFunc = null;
    onCloseFunc   = null;

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            categories: props.categories,
            selected: []
        };
        if ("onSuccess" in props) {
            this.onSuccessFunc = props.onSuccess;
        }
        if ("onClose" in props) {
            this.onCloseFunc = props.onClose;
        }

        this.updatePublicCategories();
        this.updateSelectedPublicCategories();
    }

    updatePublicCategories = () => {
        let self = this;
        axios.get("/office/get_public_categories", {})
            .then(function (response) {
                self.setState({
                    categories: response.data.categories.map((el) => {
                        return { label: el.title, value: el.id };
                    })
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    updateSelectedPublicCategories = () => {
        let self = this;
        axios.get("/office/get_template_public_categories", { params: { id: this.state.id }})
            .then(function (response) {
                self.setState({
                    selected: response.data.categories
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    onSave = () => {
        let self = this;
        axios.post("/office/set_template_public_category", { id: this.state.id, categories: this.state.selected})
            .then(function (response) {
                self.onSuccessFunc();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    renderFooter() {
        return (
            <div>
                <Button label={translate("button_common.save")} icon="pi pi-check" onClick={this.onSave} autoFocus />
            </div>
        );
    }

    render() {
        let self = this;
        return (<Dialog header={translate("select_categories.title")} visible={true} style={{ width: '50vw' }}
            footer={this.renderFooter()}
            onHide={this.onCloseFunc}>
            <div className="p-fluid">
                <div className="p-field">
                    <ListBox value={this.state.selected} options={this.state.categories}
                        onChange={(e) => this.setState({ selected: e.value })} multiple filter listStyle={{ maxHeight: '350px' }}/>
                </div>
                <div className="p-field">
                    <span><Translate value="select_categories.selection_number" />: {this.state.selected.length} {this.state.selected.length == 0 ? (<Translate value="select_categories.select_to_make_public" />) : null} </span>
                </div>
            </div>
        </Dialog>);
    }
}

export default CategoriesSelection;